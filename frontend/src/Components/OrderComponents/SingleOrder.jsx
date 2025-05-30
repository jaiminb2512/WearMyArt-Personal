import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductImages from "../ProductComponents/ProductImages";
import BlockIcon from "@mui/icons-material/Block";
import MenuIcon from "@mui/icons-material/Menu";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MTooltipButton from "../MTooltipButton";
import { statusFlow } from "../../Data/Content.js";
import { useOrderMutations } from "../../utils/useEntityMutations";

const SingleOrder = ({
  order,
  handleFetchUser = null,
  handleFetchProduct = null,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.isAdmin || false;

  const [localStatus, setLocalStatus] = useState(order?.Status);

  const location = useLocation();
  const showOrderDetails = location.pathname.includes("/order-details");

  const updateOrderStatusCallback = (orderId, newStatus) => {
    setLocalStatus(newStatus);
  };

  const { handleMoveToNextStatus, isLoading: isStatusUpdateLoading } =
    useOrderMutations(updateOrderStatusCallback);

  if (!order) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p>No order details available.</p>
        <MTooltipButton
          title="Go Back"
          variant="contained"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </MTooltipButton>
      </div>
    );
  }

  const {
    _id,
    CustomerImg,
    FinalProductImg,
    Quantity,
    FinalCost,
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
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleRedirect = () => {
    navigate("/dashboard/order-details", { state: { order } });
  };

  const orderWithCorrectId = {
    ...order,
    id: _id,
  };

  const handleNextStage = () => {
    const currentIndex = statusFlow.findIndex((s) => s.name === localStatus);
    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1].name;
      console.log(orderWithCorrectId);
      handleMoveToNextStatus(orderWithCorrectId, localStatus, nextStatus);
    }
  };

  const currentStatus = statusFlow.find((s) => s.name === localStatus);
  const currentIndex = statusFlow.findIndex((s) => s.name === localStatus);
  const nextStatus = statusFlow[currentIndex + 1]?.name || "Completed";
  const NextIcon = statusFlow[currentIndex + 1]?.icon;
  const nextColor = statusFlow[currentIndex + 1]?.color || "default";

  return (
    <div className="w-full h-full mx-auto p-4 rounded-lg flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <ProductImages imgs={imgs} altNames={altNames} />
        </div>
        <div className="p-4 w-full sm:w-1/2 flex flex-col gap-2 justify-center">
          <p className="text-lg font-light">Order ID: {_id}</p>
          <p>
            <span className="font-medium">Status:</span>
            <span className={`font-bold text-${currentStatus?.color}-600`}>
              {currentStatus?.name}
            </span>
          </p>
          <p>
            <span className="font-medium">Quantity:</span> {Quantity}
          </p>
          <p>
            <span className="font-medium">Final Cost of Order:</span> ₹
            {FinalCost}
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
            <span className="font-medium">Total Cost:</span> ₹
            {Quantity * FinalCost}
          </p>
          <p>
            <span className="font-medium">Order Date:</span>
            {formatDate(createdAt)}
          </p>

          <div className="flex flex-wrap gap-3 items-center mt-4 w-full justify-center sm:justify-start">
            {isAdmin && showOrderDetails && (
              <>
                <MTooltipButton
                  title="Customer Details"
                  variant="contained"
                  color="primary"
                  onClick={handleFetchUser}
                  className="min-w-[180px] text-center"
                  startIcon={<PersonAddIcon />}
                >
                  Customer Details
                </MTooltipButton>

                <MTooltipButton
                  title="Product Details"
                  variant="contained"
                  color="primary"
                  onClick={handleFetchProduct}
                  className="min-w-[180px] text-center"
                  startIcon={<Inventory2Icon />}
                >
                  Product Details
                </MTooltipButton>
              </>
            )}

            {isAdmin && !showOrderDetails && (
              <MTooltipButton
                title="Order Details"
                variant="contained"
                color="primary"
                onClick={handleRedirect}
                className="min-w-[180px] text-center"
                startIcon={<MenuIcon />}
              >
                Order Details
              </MTooltipButton>
            )}

            {isAdmin &&
              localStatus !== "Completed" &&
              localStatus !== "Rejected" &&
              localStatus !== "Pending" && (
                <MTooltipButton
                  title={`Next to ${nextStatus}`}
                  variant="contained"
                  color={nextColor}
                  className="min-w-[180px] text-center"
                  startIcon={NextIcon ? <NextIcon /> : null}
                  onClick={handleNextStage}
                  disabled={isStatusUpdateLoading}
                >
                  Move to {nextStatus} State
                </MTooltipButton>
              )}

            {isAdmin && localStatus === "Pending" && (
              <>
                <MTooltipButton
                  title="Accept Order"
                  variant="contained"
                  color="success"
                  className="min-w-[180px] text-center"
                  startIcon={<ModeEditIcon />}
                  onClick={() => {
                    handleMoveToNextStatus(
                      orderWithCorrectId,
                      "Pending",
                      "Process"
                    );
                  }}
                  disabled={isStatusUpdateLoading}
                >
                  Accept Order
                </MTooltipButton>

                <MTooltipButton
                  title="Reject Order"
                  variant="contained"
                  color="error"
                  className="min-w-[180px] text-center"
                  startIcon={<BlockIcon />}
                  onClick={() => {
                    handleMoveToNextStatus(
                      orderWithCorrectId,
                      "Pending",
                      "Rejected"
                    );
                  }}
                  disabled={isStatusUpdateLoading}
                >
                  Reject Order
                </MTooltipButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOrder;
