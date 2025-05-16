import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { generateAndSetTokens } from "../utils/generateAndSetTokens.js";
import { sendMail } from "../utils/sendMail.js";
import bcrypt from "bcrypt";
import notificationQueue from "../queues/notificationQueue.js";
import {
  registerValidator,
  loginValidator,
  sendingMailForLoginValidator,
  sendingMailForForgotPasswordValidator,
  otpVerifyForForgotPasswordValidator,
  forgotPasswordValidator,
  updateUserValidator,
  sendingMailForActivateValidator,
  verifyActivationOTPValidator,
  blockUsersValidator,
  unblockUsersValidator,
} from "../validators/userValidator.js";

const generateOTP = () => {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  const OTPExpiry = new Date(Date.now() + 10 * 60 * 1000);

  return { OTP, OTPExpiry };
};

const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  const validation = registerValidator.safeParse({ fullName, email, password });

  if (!validation.success) {
    const firstError = validation.error.errors[0];
    return apiResponse(
      res,
      false,
      null,
      firstError.message,
      firstError.statusCode || 400
    );
  }

  try {
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return apiResponse(
        res,
        false,
        null,
        existedUser.isActive
          ? "User already exists"
          : "User exists but inactive",
        existedUser.isActive ? 401 : 403
      );
    }

    const { OTP, OTPExpiry } = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      OTP,
      OTPExpiry,
    });

    await newUser.save();

    const htmlContent = `
      <p>Hello, ${fullName}</p>
      <p>Thank you for registering with WearMyArt!</p>
      <p>Your OTP code is <strong>${OTP}</strong>. It will expire in 10 minutes.</p>
      <p>Please enter this OTP code in the registration form to complete your registration.</p>
      <p>If you encounter any issues, feel free to contact our support team.</p>
      <p>Thank you for choosing WearMyArt!</p>
    `;

    const name = "WearMyArt Registration";
    const subject = "Registration code of WearMyArt";
    const otpResponse = await sendMail(email, name, subject, htmlContent);

    if (!otpResponse.success) {
      return apiResponse(res, false, null, otpResponse.message, 500);
    }

    return apiResponse(
      res,
      true,
      null,
      "User created successfully and OTP sent",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const sendingMailForLoginUser = async (req, res) => {
  try {
    const validation = sendingMailForLoginValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return apiResponse(res, false, null, "Invalid Email", 400);
    }

    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }

    if (!user.isActive) {
      return apiResponse(res, false, null, "User is not Active", 400);
    }

    const { OTP, OTPExpiry } = generateOTP();

    user.OTP = OTP;
    user.OTPExpiry = OTPExpiry;

    const htmlContent = `
      <p>Hello, ${user.fullName}</p>
      <p>You've requested to log in to WearMyArt. Your One-Time Password (OTP) code is: <strong>${OTP}</strong></p>
      <p>This OTP will expire in 10 minutes, so please use it before it expires.</p>
      <p>If you encounter any issues or did not request this login attempt, please contact our support team.</p>
      <p>Thank you for using WearMyArt!</p>
    `;

    const name = "WearMyArt Login";
    const subject = "Login code of WearMyArt";
    const otpResponse = await sendMail(email, name, subject, htmlContent);

    await user.save();

    return apiResponse(res, true, null, "OTP Sent Successfully", 200);
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const loginUser = async (req, res) => {
  const { email, OTP, password } = req.body;

  const validation = loginValidator.safeParse({ email, OTP, password });

  if (!validation.success) {
    const firstError = validation.error.errors[0];
    return apiResponse(
      res,
      false,
      null,
      firstError.message,
      firstError.statusCode
    );
  }

  try {
    const user = await User.findOne({ email }).select(
      "+password +OTP +OTPExpiry"
    )

    if (!user) {
      return apiResponse(res, false, null, "Invalid Email", 400);
    }

    if (!OTP && !password) {
      return apiResponse(res, false, null, "Password or OTP is required", 400);
    }

    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }

    if (!user.isActive) {
      return apiResponse(res, false, null, "User is not Active", 403);
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return apiResponse(res, false, null, "Invalid Password", 400);
      }
    } else {
      if (OTP != user.OTP) {
        return apiResponse(res, false, null, "Invalid OTP", 400);
      }
      if (user.OTPExpiry < Date.now()) {
        return apiResponse(res, false, null, "OTP Expired", 400);
      }
    }

    const { refreshToken } = generateAndSetTokens(user._id, res);

    const userResponse = {
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return apiResponse(
      res,
      true,
      { user: userResponse, refreshToken },
      "User successfully logged in",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const autoLogin = async (req, res) => {
  try {
    const { fullName, email, isAdmin } = req.user;

    const userResponse = {
      fullName,
      email,
      isAdmin,
    };

    return apiResponse(
      res,
      true,
      { user: userResponse },
      "User Successfully Login",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return apiResponse(res, false, null, "User not found", 400);
    }
    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }
    if (user.isAdmin) {
      return apiResponse(res, false, null, "User is already an admin", 400);
    }

    user.isAdmin = true;
    await user.save({ validateBeforeSave: false });

    const htmlContent = `
      <p>Dear ${user.fullName},</p>
      <p>Congratulations! Your request has been approved, and you are now an Admin of WearMyArt.</p>
      <p>You now have administrative privileges to manage the platform effectively.</p>
      <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
      <p>Thank you for being a valuable part of WearMyArt!</p>
      <br/>
      <p>Best Regards,</p>
      <p>WearMyArt Team</p>
    `;

    const name = "WearMyArt Admin";
    const subject = "You are now an Admin of WearMyArt";
    const otpResponse = await sendMail(user.email, name, subject, htmlContent);

    return apiResponse(
      res,
      true,
      null,
      `Now, ${user.fullName} is an Admin`,
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const sendingMailForForgotPassword = async (req, res) => {
  try {
    const validation = sendingMailForForgotPasswordValidator.safeParse(
      req.body
    );

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return apiResponse(res, false, null, "Invalid Email", 400);
    }

    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }

    const { OTP, OTPExpiry } = generateOTP();

    user.OTP = OTP;
    user.OTPExpiry = OTPExpiry;

    const htmlContent = `
      <p>Hello, ${user.fullName}</p>
      <p>You've requested to Forgot Password in to WearMyArt. Your One-Time Password (OTP) code is: <strong>${OTP}</strong></p>
      <p>This OTP will expire in 10 minutes, so please use it before it expires.</p>
      <p>If you encounter any issues or did not request this login attempt, please contact our support team.</p>
      <p>Thank you for using WearMyArt!</p>
    `;

    const name = "WearMyArt Forgot Password";
    const subject = "Forgot Password code of WearMyArt";
    const otpResponse = await sendMail(email, name, subject, htmlContent);

    await user.save();

    return apiResponse(res, true, null, "OTP Sent Successfully", 200);
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const otpVerifyForForgotPassword = async (req, res) => {
  try {
    const validation = otpVerifyForForgotPasswordValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { email, OTP } = req.body;
    const user = await User.findOne({ email }).select("+OTP +OTPExpiry");

    if (!user) {
      return apiResponse(res, false, null, "Invalid Email", 400);
    }

    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }

    if (user.OTP != OTP) {
      return apiResponse(res, true, null, "Invalid OTP", 200);
    }

    if (user.OTPExpiry < Date.now()) {
      return apiResponse(res, false, null, "OTP Expired", 400);
    }

    return apiResponse(res, true, null, "OTP is Verified", 200);
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const validation = forgotPasswordValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { email, OTP, password } = req.body;
    const user = await User.findOne({ email }).select("+OTP +OTPExpiry");

    if (!user) {
      return apiResponse(res, false, null, "Invalid Email", 400);
    }
    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }
    if (OTP != user.OTP) {
      return apiResponse(res, false, null, "Invalid OTP", 400);
    }
    if (user.OTPExpiry < Date.now()) {
      return apiResponse(res, false, null, "OTP Expired", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save({ validateBeforeSave: true });

    const userResponse = {
      fullName: user.fullName,
      email: user.email,
    };

    const htmlContent = `
      <p>Hello, ${user.fullName}</p>
      <p>Your password has been changed successfully for WearMyArt.</p>
      <p>If you did not request this change, please contact our support team immediately.</p>
      <p>For security reasons, we recommend using a strong and unique password.</p>
      <p>Thank you for choosing WearMyArt!</p>
    `;

    const name = "WearMyArt Security";
    const subject = "Your Password Has Been Changed Successfully";
    const otpResponse = await sendMail(email, name, subject, htmlContent);

    return apiResponse(
      res,
      true,
      { user: userResponse },
      "Password Changed Successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getAllOwnOrder = async (req, res) => {
  try {
    const customerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return apiResponse(res, false, null, "Invalid user ID", 400);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customerObjectId = new mongoose.Types.ObjectId(customerId);

    const filter = {
      CustomerId: customerObjectId,
    };

    const { Status, CustomizedType, Quantity, FinalCost, OrderDate, Duration } =
      req.body;

    if (Status && Status.length > 0) {
      filter.Status = { $in: Status };
    }

    if (CustomizedType && CustomizedType.length > 0) {
      filter.CustomizedType = { $in: CustomizedType };
    }

    if (Quantity) {
      filter.Quantity = Quantity;
    }

    if (FinalCost && Array.isArray(FinalCost) && FinalCost.length === 2) {
      filter.FinalCost = {
        $gte: parseFloat(FinalCost[0]),
        $lte: parseFloat(FinalCost[1]),
      };
    }

    let dateFilter = {};

    if (OrderDate) {
      const date = new Date(OrderDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      dateFilter = {
        createdAt: {
          $gte: date,
          $lt: nextDay,
        },
      };
    }

    if (Duration && Duration.start && Duration.end) {
      const startDate = new Date(Duration.start);
      const endDate = new Date(Duration.end);
      endDate.setDate(endDate.getDate() + 1);

      dateFilter = {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    if (Object.keys(dateFilter).length > 0) {
      Object.assign(filter, dateFilter);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    return apiResponse(
      res,
      true,
      {
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          totalPages: Math.ceil(totalOrders / limit),
        },
      },
      "Orders fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, `Error: ${error.message}`, 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({ isAdmin: false });

    const AllUser = await User.find({ isAdmin: false })
      .select("_id fullName email isActive isBlocked createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return apiResponse(
      res,
      true,
      {
        AllUser,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
      "Users Fetched Successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const SingleUser = await User.findById(id);

    return apiResponse(res, true, SingleUser, "User Fetched Successfully", 200);
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const validation = updateUserValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { _id } = req.user;
    const { fullName, email } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: _id } });
      if (existingUser) {
        return apiResponse(res, false, null, "Email is already in use", 400);
      }
      updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return apiResponse(res, false, null, "User not found", 404);
    }

    const userResponse = {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
    };

    const senderName = "WearMyArt Support";
    const subject = "Your Profile Has Been Updated";

    await notificationQueue.add(
      "send-email",
      {
        to: updatedUser.email,
        name: updatedUser.fullName,
        subject,
        senderName,
        topic: "nameChanged",
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    return apiResponse(
      res,
      true,
      { user: userResponse },
      "User Updated Successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const logoutUser = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    res.clearCookie("refreshToken", options);

    return apiResponse(res, true, null, "User is succesfully Logout", 200);
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

// Activate - deactivate user
const deActivateUser = async (req, res) => {
  try {
    const { _id } = req.user;

    const deActivatedUser = await User.findByIdAndUpdate(
      _id,
      { isActive: false },
      { new: true }
    );

    if (!deActivatedUser) {
      return apiResponse(res, false, null, "User not found", 400);
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    res.clearCookie("refreshToken", options);

    const senderName = "WearMyArt Support";
    const subject = "Account deactivation Notification";

    notificationQueue.add(
      "send-email",
      {
        to: req.user.Email,
        name: req.user.FullName,
        subject,
        senderName,
        topic: "deActivateUser",
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    return apiResponse(
      res,
      true,
      null,
      "User is successfully deactivated",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const sendingMailForActivate = async (req, res) => {
  try {
    const validation = sendingMailForActivateValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return apiResponse(res, false, null, "Invalid Email", 400);
    }

    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is blocked", 403);
    }

    if (user.isActive) {
      return apiResponse(res, false, null, "User is already activated", 400);
    }

    const { OTP, OTPExpiry } = generateOTP();

    user.OTP = OTP;
    user.OTPExpiry = OTPExpiry;

    const htmlContent = `
      <p>Hello, ${user.fullName}</p>
      <p>You've requested to activate your WearMyArt account. Your One-Time Password (OTP) is: <strong>${OTP}</strong></p>
      <p>This OTP will expire in 10 minutes. Please use it to verify your account and activate access.</p>
      <p>If you did not request this activation, please ignore this message or contact our support team.</p>
      <p>Thank you,<br/>The WearMyArt Team</p>
    `;

    const senderName = "WearMyArt";
    const subject = "WearMyArt Account Activation OTP";

    await sendMail(email, senderName, subject, htmlContent);
    await user.save();

    return apiResponse(
      res,
      true,
      null,
      "OTP sent successfully for account activation",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const verifyActivationOTP = async (req, res) => {
  try {
    const validation = verifyActivationOTPValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { email, OTP } = req.body;
    const user = await User.findOne({ email }).select("+OTP +OTPExpiry");

    if (!user) {
      return apiResponse(res, false, null, "User not found", 404);
    }

    if (user.isActive) {
      return apiResponse(res, false, null, "Account is already active", 400);
    }

    if (user.OTP != OTP) {
      return apiResponse(res, false, null, "Invalid OTP", 400);
    }

    if (new Date() > user.OTPExpiry) {
      return apiResponse(res, false, null, "OTP has expired", 400);
    }

    user.isActive = true;
    await user.save();

    const senderName = "WearMyArt Support";
    const subject = "Account activation Notification";

    await notificationQueue.add(
      "send-email",
      {
        to: user.email,
        name: user.fullName,
        subject,
        senderName,
        topic: "activateUser",
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    const { refreshToken } = generateAndSetTokens(user._id, res);

    const userResponse = {
      fullName: user.fullName,
      email,
      isAdmin: user.isAdmin,
    };

    return apiResponse(
      res,
      true,
      { user: userResponse, refreshToken },
      "User activated successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const blockUsers = async (req, res) => {
  try {
    const validation = blockUsersValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { userIds } = req.body;

    const foundUsers = await User.find({ _id: { $in: userIds } });

    if (foundUsers.length === 0) {
      return apiResponse(
        res,
        false,
        null,
        "No users found with given IDs",
        404
      );
    }

    await User.updateMany(
      { _id: { $in: userIds }, isBlocked: false },
      { $set: { isBlocked: true } }
    );

    const senderName = "WearMyArt Support";
    const subject = "Account Blocked Notification";

    const emailJobs = foundUsers.map((user) =>
      notificationQueue.add(
        "send-email",
        {
          to: user.email,
          name: user.fullName,
          subject,
          senderName,
          topic: "blockUser",
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
    );

    await Promise.all(emailJobs);

    return apiResponse(
      res,
      true,
      null,
      "Users blocked successfully and notified via email",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const unblockUsers = async (req, res) => {
  try {
    const validation = unblockUsersValidator.safeParse(req.body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return apiResponse(
        res,
        false,
        null,
        firstError.message,
        firstError.statusCode || 400
      );
    }

    const { userIds } = req.body;

    const foundUsers = await User.find({ _id: { $in: userIds } });

    if (foundUsers.length === 0) {
      return apiResponse(
        res,
        false,
        null,
        "No users found with given IDs",
        404
      );
    }

    await User.updateMany(
      { _id: { $in: userIds }, isBlocked: true },
      { $set: { isBlocked: false } }
    );

    const senderName = "WearMyArt Support";
    const subject = "Account Unblocked Notification";

    const emailJobs = foundUsers.map((user) =>
      notificationQueue.add(
        "send-email",
        {
          to: user.email,
          name: user.fullName,
          subject,
          senderName,
          topic: "unblockUser",
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
    );

    await Promise.all(emailJobs);

    return apiResponse(
      res,
      true,
      null,
      "Users unblocked successfully and notified via email",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

export {
  registerUser,
  sendingMailForLoginUser,
  loginUser,
  sendingMailForForgotPassword,
  forgotPassword,
  getAllOwnOrder,
  getSingleUser,
  updateUser,
  logoutUser,
  deActivateUser,
  sendingMailForActivate,
  verifyActivationOTP,
  makeAdmin,
  blockUsers,
  unblockUsers,
  getAllUsers,
  otpVerifyForForgotPassword,
  autoLogin,
};
