import React, { useState } from "react";
import ProductImages from "./ProductImages";
import CustomizeBtn from "./CustomizeBtn";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import BlockIcon from "@mui/icons-material/Block";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import MTooltipButton from "../MTooltipButton";
import { useSelector } from "react-redux";
import { useProductMutations } from "../../utils/useEntityMutations";

const SingleProduct = ({ Product, handleOpenDialog }) => {
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.isAdmin || false;

  const {
    _id,
    ImgURL,
    Color,
    Size,
    Sleeve,
    Price,
    DiscountedPrice,
    Stock,
    CustomizeOption,
    isDiscontinued,
    name,
  } = Product;

  const [localDiscontinued, setLocalDiscontinued] = useState(isDiscontinued);

  const { handleDiscontinueProducts, handleReContinueProducts, isLoading } =
    useProductMutations((productId, isDiscontinued) => {
      setLocalDiscontinued(isDiscontinued);
    });

  return (
    <div
      key={_id}
      className="flex gap-6 rounded-lg overflow-hidden p-3 flex-col sm:flex-row border"
    >
      <div className="w-full sm:w-1/2">
        <ProductImages imgs={ImgURL} />
      </div>

      <div className="p-4 w-full sm:w-1/2 flex flex-col justify-between">
        <div>
          {Stock <= 5 && (
            <span className="bg-red-100 text-red-800 font-bold text-md px-2 py-1 rounded">
              only {Stock} left
            </span>
          )}
          <h3 className="text-2xl font-light capitalize mt-2">
            {Color} {Sleeve} Product - Size {Size}
          </h3>

          <div className="flex items-center gap-3 mb-4">
            {DiscountedPrice &&
            parseFloat(DiscountedPrice) < parseFloat(Price) ? (
              <>
                <p className="text-black font-medium text-lg">
                  ₹{DiscountedPrice}
                </p>
                <p className="text-gray-500 line-through">₹{Price}</p>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {Math.round(((Price - DiscountedPrice) / Price) * 100)}% OFF
                </span>
              </>
            ) : (
              <p className="text-black font-medium text-lg">₹{Price}</p>
            )}
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-gray-700">
              <span className="font-medium">Color:</span> {Color}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Sleeve:</span> {Sleeve}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Size:</span> {Size}
            </p>
            {isAdmin && (
              <p className="text-gray-700">
                <span className="font-medium">Stock:</span> {Stock}
              </p>
            )}
            {CustomizeOption && (
              <p className="text-gray-700">
                <span className="font-medium">Customization:</span>{" "}
                {CustomizeOption}
              </p>
            )}
          </div>
        </div>

        {isAdmin ? (
          <div className="flex gap-3 mt-4">
            <MTooltipButton
              title="Update Product"
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog(Product)}
              className="flex gap-2 justify-center items-center"
              disabled={isLoading}
            >
              <ModeEditIcon />
              <span className="hidden sm:block">Update Product</span>
            </MTooltipButton>

            {localDiscontinued ? (
              <MTooltipButton
                title="Recontinue Product"
                variant="contained"
                color="secondary"
                onClick={() => handleReContinueProducts(Product)}
                className="flex gap-2 justify-center items-center"
                disabled={isLoading}
              >
                <ControlPointIcon />
                <span className="hidden sm:block">
                  {isLoading ? "Continuing..." : "ReContinue Product"}
                </span>
              </MTooltipButton>
            ) : (
              <MTooltipButton
                title="Discontinue Product"
                variant="contained"
                color="error"
                onClick={() => handleDiscontinueProducts(Product)}
                className="flex gap-2 justify-center items-center"
                disabled={isLoading}
              >
                <BlockIcon />
                <span className="hidden sm:block">
                  {isLoading ? "Discontinuing..." : "Discontinue Product"}
                </span>
              </MTooltipButton>
            )}
          </div>
        ) : (
          <div className="w-full flex gap-3 mt-4">
            <CustomizeBtn variant={"contained"} product={Product} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;
