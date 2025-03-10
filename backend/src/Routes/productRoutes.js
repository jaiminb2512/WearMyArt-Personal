import { Router } from "express";
import {
  addProduct,
  disContinueProducts,
  reContinueProducts,
  getAllCustomersOfProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  getAllActiveProducts,
  getLowStockProducts,
} from "../Controllers/productControllers.js";
import tokenVerification from "../middleware/tokenVerification.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post(
  "/add-product",
  (req, res, next) => tokenVerification(req, res, next, true),
  upload.array("ProductImages", 5),
  addProduct
);
router.put(
  "/update-product",
  (req, res, next) => tokenVerification(req, res, next, true),
  upload.array("ProductImages", 5),
  updateProduct
);
router.patch(
  "/discontinue-products",
  (req, res, next) => tokenVerification(req, res, next, true),
  disContinueProducts
);
router.patch(
  "/recontinue-products",
  (req, res, next) => tokenVerification(req, res, next, true),
  reContinueProducts
);
router.get(
  "/get-low-stock-products",
  (req, res, next) => tokenVerification(req, res, next, true),
  getLowStockProducts
);
router.get("/single-product/:id", tokenVerification, getSingleProduct);
router.get(
  "/get-all-products",
  (req, res, next) => tokenVerification(req, res, next, true),
  getAllProducts
);
router.get("/get-all-active-products", getAllActiveProducts);
router.get(
  "/get-all-customers-of-products",
  (req, res, next) => tokenVerification(req, res, next, true),
  getAllCustomersOfProduct
);

export default router;
