import express from "express";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  changeDefaultAddress,
} from "../controllers/userAddressController.js";
import tokenVerification from "../middleware/tokenVerification.js";

const router = express.Router();

router.post("/add", tokenVerification, addAddress);
router.put("/update/:id", tokenVerification, updateAddress);
router.delete("/delete/:id", tokenVerification, deleteAddress);
router.get("/get-all-address", tokenVerification, getUserAddresses);
router.get("/default-address", tokenVerification, changeDefaultAddress);

export default router;