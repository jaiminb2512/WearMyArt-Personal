import apiResponse from "../utils/apiResponse.js";
import Notification from "../models/notificationModel.js";
import {
  paginationQuerySchema,
  markAsReadValidator,
  addNotificationValidator,
} from "../validators/notificationValidator.js";

const getAllNotification = async (req, res) => {
  try {
    const validation = paginationQuerySchema.safeParse(req.query);

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

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const notifications = await Notification.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotification = await Notification.countDocuments({ userId, read: false });

    return apiResponse(
      res,
      true,
      {
        notifications,
        pagination: {
          total: totalNotification,
          page,
          limit,
          totalPages: Math.ceil(totalNotification / limit),
        },
      },
      "Notifications fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    const validation = markAsReadValidator.safeParse(req.body);

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

    const { notificationId } = validation.data;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId, read: false },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return apiResponse(res, false, null, "Notification not found", 404);
    }

    return apiResponse(
      res,
      true,
      null,
      "Notification marked as read",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    if (result.modifiedCount === 0) {
      return apiResponse(
        res,
        false,
        null,
        "No unread notifications found",
        404
      );
    }

    return apiResponse(
      res,
      true,
      { modifiedCount: result.modifiedCount },
      "All notifications marked as read",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

export { getAllNotification, markAsRead, markAllAsRead };
