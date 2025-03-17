import React from "react";
import ProductImages from "./ProductImages";
import CustomizeBtn from "./CustomizeBtn";
import { Button } from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import BlockIcon from "@mui/icons-material/Block";
import ControlPointIcon from "@mui/icons-material/ControlPoint";

const SingleProduct = ({
  Product,
  allProducts = false,
  handleOpenDialog = null,
}) => {
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
  } = Product;

  return (
    <div
      key={_id}
      className="flex gap-6 rounded-lg overflow-hidden p-3 flex-col sm:flex-row"
    >
      <div className="w-full sm:w-1/2">
        <ProductImages imgs={ImgURL} />
      </div>

      <div className="p-4 w-full sm:w-2/3">
        {Stock <= 5 && (
          <span className="bg-red-100 text-red-800 font-bold text-md px-2 py-1 rounded">
            only {Stock} left
          </span>
        )}
        <h3 className="text-2xl font-light capitalize">
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
          {allProducts && (
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

        {allProducts ? (
          <div className="flex gap-3">
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog(Product)}
              className="flex gap-2 justify-center items-center"
            >
              <ModeEditIcon />{" "}
              <span className="hidden sm:block">Update Product</span>
            </Button>

            {isDiscontinued ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => console.log("ReContinue product:", _id)}
                className="flex gap-2 justify-center items-center"
              >
                <ControlPointIcon />{" "}
                <span className="hidden sm:block">ReContinue Product</span>
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={() => console.log("Discontinue product:", _id)}
                className="flex gap-2 justify-center items-center"
              >
                <BlockIcon />{" "}
                <span className="hidden sm:block">Discontinue Product</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full flex gap-3">
            <CustomizeBtn variant={"contained"} product={Product} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;
