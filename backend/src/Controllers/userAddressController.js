import User from "../models/userModel.js";
import UserAddress from "../models/userAddressModel.js";
import apiResponse from "../utils/apiResponse.js";
import { addAddressValidator, updateAddressValidator, changeDefaultAddressValidator } from "../validators/addressValidator.js";

const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Validate request body
    const validationResult = addAddressValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(res, false, null, validationResult.error.errors[0].message, 400);
    }

    const {
      phoneNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      addressType,
      label,
    } = validationResult.data;

    const user = await User.findById(userId);

    if (!user) {
      return apiResponse(res, false, null, "User not found", 404);
    }

    // Check max address limit
    if (user.addresses.length >= 5) {
      return apiResponse(
        res,
        false,
        null,
        "You can only save up to 5 addresses",
        400
      );
    }

    const labelToUse = label || "Address";

    // Check for duplicate label (case-insensitive)
    const isLabelDuplicate = user.addresses.some(
      (addr) => addr.label.toLowerCase() === labelToUse.toLowerCase()
    );

    if (isLabelDuplicate) {
      return apiResponse(
        res,
        false,
        null,
        "Label already exists. Please use a unique label.",
        400
      );
    }

    // Create the address
    const address = await UserAddress.create({
      userId,
      phoneNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      addressType,
    });

    // Add address reference with label
    user.addresses.push({
      label: labelToUse,
      addressId: address._id,
    });

    await user.save();

    return apiResponse(res, true, address, "Address added successfully", 201);
  } catch (error) {
    return apiResponse(
      res,
      false,
      null,
      `Error adding address: ${error.message}`,
      500
    );
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params; // id of UserAddress

    // Validate request body
    const validationResult = updateAddressValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(res, false, null, validationResult.error.errors[0].message, 400);
    }

    const {
      phoneNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      addressType,
      label,
    } = validationResult.data;

    // Step 1: Update the address in UserAddress collection
    const updated = await UserAddress.findByIdAndUpdate(
      id,
      {
        phoneNumber,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        postalCode,
        country,
        addressType,
      },
      { new: true }
    );

    if (!updated) {
      return apiResponse(res, false, null, "Address not found", 404);
    }

    // Step 2: Update the label in User's addresses array
    await User.updateOne(
      { "addresses.addressId": id },
      { $set: { "addresses.$.label": label || "Address" } }
    );

    return apiResponse(
      res,
      true,
      updated,
      "Address and label updated successfully"
    );
  } catch (error) {
    return apiResponse(
      res,
      false,
      null,
      `Error updating address: ${error.message}`,
      500
    );
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      $pull: {
        addresses: { addressId: id },
      },
    });

    return apiResponse(res, true, null, "Address deleted successfully");
  } catch (error) {
    return apiResponse(
      res,
      false,
      null,
      `Error deleting address: ${error.message}`,
      500
    );
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("addresses.addressId")
      .select("addresses");

    if (!user) return apiResponse(res, false, null, "User not found", 404);

    const formattedAddresses = user.addresses.map(({ label, addressId }) => ({
      label,
      address: addressId,
    }));

    return apiResponse(
      res,
      true,
      formattedAddresses,
      "Fetched addresses successfully"
    );
  } catch (error) {
    return apiResponse(
      res,
      false,
      null,
      `Error fetching addresses: ${error.message}`,
      500
    );
  }
};

const changeDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Validate request body
    const validationResult = changeDefaultAddressValidator.safeParse(req.body);
    if (!validationResult.success) {
      return apiResponse(res, false, null, validationResult.error.errors[0].message, 400);
    }

    const { addressId, label } = validationResult.data;

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, false, null, "User not found", 404);
    }

    // Find the address index
    const addressIndex = user.addresses.findIndex(
      (addr) => addr.addressId.toString() === addressId
    );

    if (addressIndex === -1) {
      return apiResponse(res, false, null, "Address not found", 404);
    }

    // Get the address, update the label
    const addressToMove = { ...user.addresses[addressIndex], label };

    // Remove it from current position
    user.addresses.splice(addressIndex, 1);

    // Insert it at the first position
    user.addresses.unshift(addressToMove);

    // Save the user document
    await user.save();

    return apiResponse(
      res,
      true,
      user.addresses,
      "Default address updated (by position)"
    );
  } catch (error) {
    return apiResponse(
      res,
      false,
      null,
      `Error updating default address: ${error.message}`,
      500
    );
  }
};

export {
  addAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  changeDefaultAddress,
};