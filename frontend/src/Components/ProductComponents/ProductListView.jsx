import React from "react";
import SingleProduct from "./SingleProduct";

const ProductListView = ({
  products = [],
  isLoading,
  handleOpenDialog = null,
  count = null,
  singleProduct = null,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if ((!products || products.length === 0) && !singleProduct) {
    return (
      <div className="text-center text-gray-500 text-lg">
        No items to display
      </div>
    );
  }

  const productList = singleProduct ? [singleProduct] : products;

  return (
    <section>
      <h1 className="text-lg font-bold hidden sm:block">{`${count} Products`}</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        {productList.map((product) => (
          <SingleProduct
            key={product._id}
            Product={product}
            handleOpenDialog={handleOpenDialog}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductListView;
