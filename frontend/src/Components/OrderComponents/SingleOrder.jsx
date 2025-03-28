import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import ProductImages from "../ProductComponents/ProductImages";
import BlockIcon from "@mui/icons-material/Block";
import MenuIcon from "@mui/icons-material/Menu";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MTooltip from "../MTooltip";
import { useSelector } from "react-redux";

const SingleOrder = ({
  order,
  OrderDetails = false,
  handleFetchUser = null,
  handleFetchProduct = null,
}) => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.isAdmin || false;

  if (!order) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p>No order details available.</p>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const {
    _id,
    CustomerImg,
    FinalProductImg,
    Quantity,
    FinalCost,
    Status,
    createdAt,
    CustomizeOption,
    Font,
    Text,
    Color,
  } = order;

  const imgs = [FinalProductImg];
  const altNames = ["Final Product Img"];

  if (CustomizeOption === "Photo") {
    imgs.push(CustomerImg);
    altNames.push("Customer Img");
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "N/A" : date.toLocaleDateString();
  };

  const handleRedirect = (order) => {
    navigate("/dashboard/order-details", { state: { order } });
  };

  return (
    <div className="w-full h-full mx-auto p-4 rounded-lg flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <ProductImages imgs={imgs} altNames={altNames} />
        </div>
        <div className="w-full sm:w-2/3 flex flex-col gap-2 justify-center">
          <p className="text-lg font-light">Order ID: {_id}</p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`font-bold ${
                Status === "Completed"
                  ? "text-green-600"
                  : Status === "Rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {Status}
            </span>
          </p>
          <p>
            <span className="font-medium">Quantity:</span> {Quantity}
          </p>
          <p>
            <span className="font-medium">Final Cost:</span> ₹{FinalCost}
          </p>

          {(CustomizeOption === "Text" || CustomizeOption === "Both") && (
            <div>
              <p>
                <span className="font-medium">Text:</span> {Text}
              </p>
              <p>
                <span className="font-medium">Font:</span> {Font}
              </p>
              <p>
                <span className="font-medium">Color:</span> {Color}
              </p>
            </div>
          )}

          <p>
            <span className="font-medium">Order Date:</span>{" "}
            {formatDate(createdAt)}
          </p>

          <div className="flex gap-2 items-center mt-4 w-2/3">
            {OrderDetails ? (
              <div className="flex gap-3 justify-center items-center">
                <div className="w-full sm:w-auto">
                  <MTooltip title="Customer Details">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFetchUser}
                      className="sm:w-[200px]"
                    >
                      <div className="flex gap-2 items-center justify-center">
                        <PersonAddIcon />
                        <span className="hidden sm:block">
                          Customer Details
                        </span>
                      </div>
                    </Button>
                  </MTooltip>
                </div>
                <div className="w-full">
                  <MTooltip title="Product Details">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFetchProduct}
                      className="sm:w-[200px]"
                    >
                      <div className="flex gap-2 items-center justify-center">
                        <Inventory2Icon />
                        <span className="hidden sm:block">Product Details</span>
                      </div>
                    </Button>
                  </MTooltip>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <MTooltip title="Order Details">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRedirect(order)}
                    className={` ${Status} === "Pending" ? "sm:w-[150px]" : "`}
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <MenuIcon />
                      <span className="hidden sm:block">Order Details</span>
                    </div>
                  </Button>
                </MTooltip>
              </div>
            )}

            {isAdmin && Status === "Pending" && (
              <div className="flex gap-3 w-fit">
                <MTooltip title="Accept Order">
                  <Button
                    variant="contained"
                    color="success"
                    className="sm:w-[150px]"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <ModeEditIcon />
                      <span className="hidden sm:block">Accept Order</span>
                    </div>
                  </Button>
                </MTooltip>
                <MTooltip title="Reject Order">
                  <Button
                    variant="contained"
                    color="error"
                    className="sm:w-[150px]"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <BlockIcon />
                      <span className="hidden sm:block">Reject Order</span>
                    </div>
                  </Button>
                </MTooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOrder;
