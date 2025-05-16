import jwt from "jsonwebtoken";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/userModel.js";

const tokenVerification = async function (req, res, next, checkAdmin = false) {
  const token = req.cookies?.refreshToken || req.header("refreshToken");

  if (!token) {
    return apiResponse(res, false, null, "Unauthorized", 401);
  }

  try {
    const decodedUser = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    const user = await User.findById(decodedUser?._id);

    if (!user) {
      return apiResponse(res, false, null, "Invalid Token", 401);
    }

    if (user.isBlocked) {
      return apiResponse(res, false, null, "User is Blocked", 400);
    }

    if (!user.isActive) {
      return apiResponse(res, false, null, "Account Disabled", 403);
    }

    if (checkAdmin && !user.isAdmin) {
      return apiResponse(res, false, null, "Forbidden", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

export default tokenVerification;
