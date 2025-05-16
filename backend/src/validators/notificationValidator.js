import { z } from "zod";

// Schema for pagination query parameters
const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit: z.string().optional().transform((val) => parseInt(val) || 10),
}).refine(
  (data) => data.page > 0 && data.limit > 0,
  {
    message: "Page and limit must be positive numbers",
    statusCode: 400,
  }
);

// Schema for marking a single notification as read
const markAsReadValidator = z.object({
  notificationId: z.string({
    required_error: "Notification ID is required",
    statusCode: 400,
  }).refine(
    (val) => /^[0-9a-fA-F]{24}$/.test(val),
    {
      message: "Invalid notification ID format",
      statusCode: 400,
    }
  ),
});

// Schema for adding a new notification
const addNotificationValidator = z.object({
  userId: z.string({
    required_error: "User ID is required",
    statusCode: 400,
  }).refine(
    (val) => /^[0-9a-fA-F]{24}$/.test(val),
    {
      message: "Invalid user ID format",
      statusCode: 400,
    }
  ),
  title: z.string({
    required_error: "Title is required",
    statusCode: 400,
  }).min(1, {
    message: "Title cannot be empty",
    statusCode: 422,
  }).max(100, {
    message: "Title must be less than 100 characters",
    statusCode: 422,
  }),
  message: z.string({
    required_error: "Message is required",
    statusCode: 400,
  }).min(1, {
    message: "Message cannot be empty",
    statusCode: 422,
  }).max(500, {
    message: "Message must be less than 500 characters",
    statusCode: 422,
  }),
  type: z.enum(["order", "product", "address", "system"], {
    errorMap: () => ({
      message: "Type must be one of: order, product, address, system",
      statusCode: 422,
    }),
  }).default("system"),
  relatedOrderId: z.string().refine(
    (val) => !val || /^[0-9a-fA-F]{24}$/.test(val),
    {
      message: "Invalid order ID format",
      statusCode: 400,
    }
  ).optional(),
  relatedProductId: z.string().refine(
    (val) => !val || /^[0-9a-fA-F]{24}$/.test(val),
    {
      message: "Invalid product ID format",
      statusCode: 400,
    }
  ).optional(),
});

export {
  paginationQuerySchema,
  markAsReadValidator,
  addNotificationValidator,
}; 