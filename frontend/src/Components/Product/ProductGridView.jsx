import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import CustomizeBtn from "./CustomizeBtn";
import { Button } from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import BlockIcon from "@mui/icons-material/Block";
import ControlPointIcon from "@mui/icons-material/ControlPoint";

const ProductGridView = ({
  products,
  loading,
  allProducts = false,
  handleOpenDialog = null,
}) => {
  const navigate = useNavigate();

  const redirectToProduct = (id) => {
    navigate(`/product/${id}`);
  };

  console.log(products);

  return (
    <div className="flex-1 flex flex-col pb-10">
      {loading ? (
        <p>Loading products...</p>
      ) : products.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="p-4 rounded-lg cursor-pointer shadow-xl hover:shadow-lg transition duration-300"
            >
              <img
                src={`${import.meta.env.VITE_BASE_URL}${product.ImgURL[0]}`}
                alt={product.name}
                className="w-full h-[350px] object-cover rounded-lg"
                onClick={() => redirectToProduct(product._id)}
              />
              <div className="flex flex-col gap-2">
                <div className="mt-2">
                  <p className="text-sm truncate">{`${product.Color} Customizable ${product.Sleeve}`}</p>
                  {product.DiscountedPrice ? (
                    <div className="flex items-center space-x-2">
                      <p className="font-bold flex items-center text-md">
                        <FaRupeeSign /> {product.DiscountedPrice}
                      </p>
                      <del className="text-gray-500">{product.Price}</del>
                    </div>
                  ) : (
                    <p className="flex font-bold items-center text-lg">
                      <FaRupeeSign />
                      {product.Price}
                    </p>
                  )}
                </div>

                {allProducts ? (
                  <div className="flex gap-3">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <ModeEditIcon />{" "}
                      <span className="hidden md:block">Update Product</span>
                    </Button>

                    {product.isDiscontinued ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          console.log("ReContinue product:", product._id)
                        }
                      >
                        <ControlPointIcon />{" "}
                        <span className="hidden md:block">
                          ReContinue Product
                        </span>
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                          console.log("Discontinue product:", product._id)
                        }
                      >
                        <BlockIcon />{" "}
                        <span className="hidden md:block">
                          Discontinue Product
                        </span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex gap-3">
                    <CustomizeBtn variant={"contained"} product={product} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No products available</p>
      )}
    </div>
  );
};

export default ProductGridView;
