import Order from "../models/orderModel.js";
import { connectRedis } from "../config/redisConnection.js";
import apiResponse from "../utils/apiResponse.js";
import productValidate from "../utils/productValidate.js";
import { sendOrderConfirmationEmail } from "../utils/sendMail.js";
import deleteFiles from "../utils/deleteFiles.js";
import notificationQueue from "../queues/notificationQueue.js";
import addNotification from "../utils/addNotification.js";

const addOrder = async (req, res) => {
  try {
    const { CustomizedType, Quantity, FinalCost, ProductId } = req.body;
    const { Email, FullName } = req.user;
    const CustomerId = req.user._id;

    if (!CustomizedType) {
      return apiResponse(res, false, null, "CustomizedType is required", 400);
    }
    if (!FinalCost) {
      return apiResponse(res, false, null, "FinalCost is required", 400);
    }

    productValidate(ProductId, res, Quantity);

    if (!req.files?.FinalProductImg?.[0]) {
      return apiResponse(
        res,
        false,
        null,
        "Final Product Image is required",
        400
      );
    }
    const FinalProductImg = `/uploads/${req.files.FinalProductImg[0].filename}`;

    const orderBase = {
      ProductId,
      CustomerId,
      Quantity,
      FinalCost,
      FinalProductImg,
      CustomizedType,
    };

    let newOrder;
    const senderName = "WearMyArt";
    const subject = "Add Order";
    const emailData = {
      to: Email,
      name: FullName,
      subject,
      senderName,
      topic: "addOrder",
    };

    switch (CustomizedType) {
      case "Text":
        const { Font, Text, Color, TextStyle } = req.body;

        let parsedTextStyle = TextStyle;
        if (typeof TextStyle === "string") {
          try {
            parsedTextStyle = JSON.parse(TextStyle);
          } catch (err) {
            console.error("Failed to parse TextStyle:", TextStyle);
          }
        }
        newOrder = new Order({
          ...orderBase,
          Font,
          Text,
          Color,
          TextStyle: parsedTextStyle,
        });
        break;

      case "Photo":
        if (!req.files?.CustomerImg?.[0]) {
          return apiResponse(res, false, null, "Customer Img is required", 400);
        }
        const CustomerImg = `/uploads/${req.files.CustomerImg[0].filename}`;
        newOrder = new Order({
          ...orderBase,
          CustomerImg,
        });
        break;

      case "Both":
        const {
          Font: bothFont,
          Text: bothText,
          Color: bothColor,
          TextStyle: bothTextStyle,
        } = req.body;
        if (!req.files?.CustomerImg?.[0]) {
          return apiResponse(res, false, null, "Customer Img is required", 400);
        }
        const BothCustomerImg = `/uploads/${req.files.CustomerImg[0].filename}`;
        newOrder = new Order({
          ...orderBase,
          CustomerImg: BothCustomerImg,
          Font: bothFont,
          Text: bothText,
          Color: bothColor,
          TextStyle: bothTextStyle,
        });
        break;

      default:
        return apiResponse(res, false, null, "Invalid CustomizedType", 400);
    }

    const savedOrder = await newOrder.save();
    await notificationQueue.add(
      "send-email",
      {
        ...emailData,
        data: {
          newOrder: [newOrder],
          FinalProductImg: [FinalProductImg],
        },
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    return apiResponse(
      res,
      true,
      savedOrder,
      "Order is Successfully placed",
      201
    );
  } catch (error) {
    const filesToDelete = [];
    if (req.files?.CustomerImg?.[0]) {
      filesToDelete.push(`/uploads/${req.files.CustomerImg[0].filename}`);
    }
    if (req.files?.FinalProductImg?.[0]) {
      filesToDelete.push(`/uploads/${req.files.FinalProductImg[0].filename}`);
    }
    if (filesToDelete.length) {
      deleteFiles(filesToDelete);
    }
    return apiResponse(res, false, null, error.message, 500);
  }
};

const addToCartOrder = async (req, res) => {
  try {
    const { CustomizedType, Quantity, FinalCost, ProductId } = req.body;
    const FinalProductImg = `/uploads/${req.files.FinalProductImg[0].filename}`;

    const CustomerId = req.user._id;

    if (!CustomizedType) {
      return apiResponse(res, false, null, "CustomizedType is required", 400);
    }
    const { Size } = productValidate(ProductId, res, Quantity);

    if (!FinalProductImg) {
      return apiResponse(res, false, null, "FinalProductImg is required", 400);
    }
    if (!FinalCost) {
      return apiResponse(res, false, null, "FinalCost is required", 400);
    }

    await productValidate(ProductId, res, Quantity);

    const redisClient = await connectRedis();

    if (CustomizedType === "Text") {
      const { Font, TextStyle, Text, Color } = req.body;

      if (!(ProductId || Font || TextStyle || Text || Color)) {
        return apiResponse(res, false, null, "All fields are required", 400);
      }

      const newOrderKey = `order:${CustomerId}:${Date.now()}`;

      await redisClient.hSet(newOrderKey, {
        ProductId: String(ProductId),
        CustomerId: String(CustomerId),
        Font: String(Font || ""),
        TextStyle: String(TextStyle || ""),
        Text: String(Text || ""),
        Color: String(Color || ""),
        Quantity: Number(Quantity) || 1,
        FinalCost: Number(FinalCost),
        FinalProductImg: String(FinalProductImg || ""),
        CustomizedType: "Text",
      });

      return apiResponse(
        res,
        true,
        {
          OrderKey: newOrderKey,
          ProductId,
          Font,
          TextStyle,
          Text,
          Color,
          Quantity,
          FinalCost,
          FinalProductImg,
        },
        `Order is successfully added to cart`,
        201
      );
    } else if (CustomizedType === "Photo") {
      const CustomerImg = `/uploads/${req.files.CustomerImg[0].filename}`;

      if (!CustomerImg) {
        return apiResponse(res, false, null, "Customer Img is required", 400);
      }

      const newOrderKey = `order:${CustomerId}:${Date.now()}`;
      await redisClient.hSet(newOrderKey, {
        ProductId: String(ProductId),
        CustomerImg: String(CustomerImg || ""),
        CustomerId: String(CustomerId),
        Quantity: Number(Quantity) || 1,
        FinalCost: Number(FinalCost),
        FinalProductImg: String(FinalProductImg || ""),
        CustomizedType: "Photo",
      });

      return apiResponse(
        res,
        true,
        {
          OrderKey: newOrderKey,
          ProductId,
          CustomerImg,
          CustomerId,
          Quantity,
          FinalCost,
          FinalProductImg,
          CustomizedType,
        },
        `Order is successfully added to cart`,
        201
      );
    } else if (CustomizedType === "Both") {
      const { Font, Text, Color, TextStyle } = req.body;
      const CustomerImg = `/uploads/${req.files.CustomerImg[0].filename}`;

      if (!CustomerImg && !FinalProductImg) {
        return apiResponse(
          res,
          false,
          null,
          "Customer Img and Final Product Image is required",
          400
        );
      }

      if (!CustomerImg && FinalProductImg) {
        return apiResponse(res, false, null, "Customer Img is required", 400);
      }

      if (!FinalProductImg) {
        deleteFiles([`/uploads/${req.files.CustomerImg[0].filename}`]);
        return apiResponse(
          res,
          false,
          null,
          "Final Product Image is required",
          400
        );
      }

      const newOrderKey = `order:${CustomerId}:${Date.now()}`;
      await redisClient.hSet(newOrderKey, {
        ProductId: String(ProductId),
        CustomerImg: String(CustomerImg || ""),
        CustomerId: String(CustomerId),
        Quantity: Number(Quantity) || 1,
        FinalCost: Number(FinalCost),
        FinalProductImg: String(FinalProductImg || ""),
        Font: String(Font || ""),
        TextStyle: String(TextStyle || ""),
        Text: String(Text || ""),
        Color: String(Color || ""),
        CustomizedType: "Both",
      });

      const newOrder = new Order({
        ProductId,
        CustomerImg,
        CustomerId,
        Quantity,
        FinalCost,
        FinalProductImg,
        Font,
        TextStyle,
        Text,
        Color,
        CustomizedType: "Both",
      });

      return apiResponse(
        res,
        true,
        {
          OrderKey: newOrderKey,
          ProductId,
          CustomerImg,
          CustomerId,
          Quantity,
          FinalCost,
          FinalProductImg,
          Font,
          TextStyle,
          Text,
          Color,
          CustomizedType: "Both",
        },
        "Order is Successfully placed",
        201
      );
    }
  } catch (error) {
    if (req.files?.CustomerImg?.[0])
      deleteFiles([`/uploads/${req.filesCustomerImg?.[0].filename}`]);
    deleteFiles([`/uploads/${req.files.FinalProductImg?.[0].filename}`]);
    return apiResponse(res, false, null, error.message, 500);
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { orderKey, Quantity } = req.body;

    if (!Quantity) {
      return apiResponse(res, false, null, "Quantity is required", 400);
    }

    if (Quantity < 1) {
      return apiResponse(
        res,
        false,
        null,
        "Quantity must be greater than or equal to 1",
        400
      );
    }

    if (!orderKey) {
      return apiResponse(res, false, null, "orderKey is required", 400);
    }

    const redisClient = await connectRedis();

    await redisClient.hSet(orderKey, "Quantity", Quantity);

    return apiResponse(
      res,
      true,
      { orderKey, Quantity },
      "Cart updated successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const removeCart = async (req, res) => {
  try {
    const { orderKeys } = req.body;

    for (const orderKey of orderKeys) {
      if (!orderKey) {
        return apiResponse(res, false, null, "OrderKey is required", 400);
      }

      const redisClient = await connectRedis();

      await redisClient.del(orderKey);
    }

    return apiResponse(
      res,
      true,
      { orderKeys },
      "Cart item removed successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const cartToOrder = async (req, res) => {
  try {
    const { orderKeys } = req.body;
    const CustomerId = req.user._id;
    const redisClient = await connectRedis();
    const Orders = [];

    const { Email, FullName } = req.user;

    for (const orderKey of orderKeys) {
      const orderData = await redisClient.hGetAll(orderKey);

      if (!orderData || Object.keys(orderData).length === 0) {
        continue;
      }
      const {
        ProductId,
        CustomerImg = "",
        Font = "",
        TextStyle = "",
        Text = "",
        Color = "",
        Quantity = 1,
        FinalCost,
        FinalProductImg = "",
        CustomizedType = "",
      } = orderData;

      if (CustomizedType == "Photo") {
        const newOrder = new Order({
          ProductId,
          CustomerImg,
          CustomerId,
          Quantity,
          FinalCost,
          FinalProductImg,
          CustomizedType,
        });
        const SavedOrder = await newOrder.save();
        Orders.push(SavedOrder);

        await redisClient.del(orderKey);
      } else if (CustomizedType == "Text") {
        const newOrder = new Order({
          ProductId,
          CustomerId,
          Font,
          TextStyle,
          Text,
          Color,
          Quantity,
          FinalCost,
          FinalProductImg,
          CustomizedType,
        });
        const SavedOrder = await newOrder.save();
        Orders.push(SavedOrder);

        await redisClient.del(orderKey);
      } else {
        const newOrder = new Order({
          ProductId,
          CustomerId,
          CustomerImg,
          Font,
          TextStyle,
          Text,
          Color,
          FinalProductImg,
          Quantity: Number(Quantity),
          FinalCost: Number(FinalCost),
          CustomizedType,
        });

        const SavedOrder = await newOrder.save();
        Orders.push(SavedOrder);

        await redisClient.del(orderKey);
      }
    }

    if (Orders.length == 0) {
      return apiResponse(res, false, null, "Orders can not be Empty", 400);
    }
    await sendOrderConfirmationEmail(
      Email,
      FullName,
      Orders,
      Orders.map((order) => order.FinalProductImg)
    );

    return apiResponse(res, true, Orders, "Orders successfully purchased", 200);
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getAllCartOrder = async (req, res) => {
  try {
    const CustomerId = req.user._id;

    const redisClient = await connectRedis();

    const keys = await redisClient.keys(`order:${CustomerId}:*`);

    const orders = [];

    for (const key of keys) {
      const orderData = await redisClient.hGetAll(key);

      if (orderData.CustomerId === String(CustomerId)) {
        orders.push({
          key,
          orderData,
        });
      }
    }

    return apiResponse(
      res,
      true,
      orders,
      `Cart Orders fetched successfully`,
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getAllOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

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
    console.error("Error in getAllOrder:", error);
    return apiResponse(res, false, null, error.message, 500);
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const SingleOrder = await Order.findById(id);

    const populatedOrder = await Order.findById(SingleOrder._id);

    return apiResponse(
      res,
      true,
      populatedOrder,
      "Product Fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    if (!status) {
      return apiResponse(res, false, null, "Status is required", 400);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { Status: status } },
      { new: true, runValidators: true }
    )

    

    await addNotification({
      res,
      userId: order.CustomerId._id,
      title: "Order Status updated",
      message: `Your order status has been updated to '${status}'.`,
      type: "product",
      relatedOrderId: order._id,
    });


    return apiResponse(
      res,
      true,
      null,
      `Order status updated to '${status}' successfully`,
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

const orderData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDateTime;
      }
    }

    const metricsResult = await Order.aggregate([
      { $match: { ...dateFilter } },
      {
        $facet: {
          revenueStats: [
            {
              $group: {
                _id: null,
                revenue: { $sum: { $multiply: ["$FinalCost", "$Quantity"] } },
                avgOrderValue: { $avg: "$FinalCost" },
                totalOrders: { $sum: 1 },
              },
            },
          ],

          activeUsers: [
            { $group: { _id: "$CustomerId" } },
            { $count: "activeUsers" },
          ],

          statusDistribution: [
            { $group: { _id: "$Status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          customizationDistribution: [
            { $group: { _id: "$CustomizedType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          topCustomers: [
            {
              $group: {
                _id: "$CustomerId",
                totalSpent: {
                  $sum: { $multiply: ["$FinalCost", "$Quantity"] },
                },
                orderCount: { $sum: 1 },
              },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "customerDetails",
              },
            },
            {
              $unwind: {
                path: "$customerDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                customerId: "$_id",
                customerName: "$customerDetails.FullName",
                customerEmail: "$customerDetails.Email",
                totalSpent: 1,
                orderCount: 1,
              },
            },
          ],

          topProducts: [
            {
              $group: {
                _id: "$ProductId",
                totalRevenue: {
                  $sum: { $multiply: ["$FinalCost", "$Quantity"] },
                },
                totalQuantity: { $sum: "$Quantity" },
                orderCount: { $sum: 1 },
              },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productDetails",
              },
            },
            {
              $unwind: {
                path: "$productDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                productId: "$_id",
                productImgURL: "$productDetails.ImgURL",
                productStock: "$productDetails.Stock",
                totalRevenue: 1,
                totalQuantity: 1,
                orderCount: 1,
              },
            },
          ],
        },
      },
    ]);

    const revenueStats = metricsResult[0].revenueStats[0] || {
      revenue: 0,
      avgOrderValue: 0,
      totalOrders: 0,
    };
    const activeUsers = metricsResult[0].activeUsers[0]?.activeUsers || 0;

    let fromDate, toDate;

    if (startDate) {
      fromDate = new Date(startDate);
    } else {
      fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 11);
      fromDate.setDate(1);
      fromDate.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      toDate = new Date(endDate);
      toDate.setHours(23, 59, 59, 999);
    } else {
      toDate = new Date();
    }

    const monthWiseSales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: { $multiply: ["$FinalCost", "$Quantity"] } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const allMonths = [];
    const currentDate = new Date(fromDate);
    currentDate.setDate(1);

    while (currentDate <= toDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const existingMonth = monthWiseSales.find(
        (item) => item._id.year === year && item._id.month === month
      );

      allMonths.push({
        monthYear: `${monthNames[month - 1]} ${year}`,
        month,
        year,
        revenue: existingMonth?.revenue || 0,
        orderCount: existingMonth?.orderCount || 0,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return apiResponse(
      res,
      true,
      {
        revenue: revenueStats.revenue,
        averageOrderValue: revenueStats.avgOrderValue,
        totalOrders: revenueStats.totalOrders,
        activeUsers,
        monthWiseSales: allMonths,
        statusDistribution: metricsResult[0].statusDistribution,
        customizationDistribution: metricsResult[0].customizationDistribution,
        topCustomers: metricsResult[0].topCustomers,
        topProducts: metricsResult[0].topProducts,
      },
      "Data fetched successfully",
      200
    );
  } catch (error) {
    return apiResponse(res, false, null, error.message, 500);
  }
};

export {
  addOrder,
  addToCartOrder,
  cartToOrder,
  getAllCartOrder,
  getAllOrder,
  getSingleOrder,
  updateOrderStatus,
  updateCartQuantity,
  removeCart,
  orderData,
};
