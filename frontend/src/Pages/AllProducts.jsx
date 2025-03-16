import React, { useMemo, useState } from "react";
import { useFetchData } from "../utils/apiRequest";
import ApiURLS from "../Data/ApiURLS";
import { Dialog, DialogContent } from "@mui/material";
import ProductForm from "../Components/Product/ProductForm";
import ProductFilter from "../Components/Product/ProductFilter";
import ProductTopbar from "../Components/Product/ProductTopbar";
import ProductGridView from "../Components/Product/ProductGridView";
import ProductBottomBar from "../Components/Product/ProductBottomBar";
import ProductListView from "../Components/Product/ProductListView";
import { useSelector } from "react-redux";

const AllProducts = () => {
  const { FilterBarOpen } = useSelector((state) => state.OpenClose);

  const { data: AllProducts = [], isLoading } = useFetchData(
    "all-products",
    ApiURLS.GetAllProduct.url,
    ApiURLS.GetAllProduct.method,
    {
      staleTime: 5 * 60 * 1000, // 5 Minutes
      cacheTime: 10 * 60 * 1000, // 10 Minutes
    }
  );

  const [userStock, setUserStock] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleStockChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setUserStock(isNaN(value) ? 0 : value);
  };

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const [sortOrder, setSortOrder] = useState("lowToHigh");
  const [filterOptions, setFilterOptions] = useState({
    Size: [],
    Sleeve: [],
    CustomizeOption: [],
    Color: [],
    Price: [],
    Sort: ["Low to High"],
    Avalibility: ["All"],
    VisibleColumns: [
      "image",
      "color",
      "size",
      "sleeve",
      "price",
      "discountedPrice",
      "stock",
      "customizeOption",
    ],
  });
  const [listView, setListView] = useState(true);

  const isPriceInRange = (price, range) => {
    if (!range) return true;
    if (range === "0-499") return price >= 0 && price <= 499;
    if (range === "499-999") return price >= 499 && price <= 999;
    if (range === "999-1999") return price >= 999 && price <= 1999;
    if (range === "1999+") return price >= 1999;
    return true;
  };

  const filteredProducts = useMemo(() => {
    return AllProducts.filter((product) => {
      const sizeMatch =
        !filterOptions.Size.length || filterOptions.Size.includes(product.Size);
      const sleeveMatch =
        !filterOptions.Sleeve.length ||
        filterOptions.Sleeve.includes(product.Sleeve);
      const customizeMatch =
        !filterOptions.CustomizeOption.length ||
        filterOptions.CustomizeOption.includes(product.CustomizeOption);
      const colorMatch =
        !filterOptions.Color.length ||
        filterOptions.Color.includes(product.Color);

      // Fix for multiple price ranges
      const priceMatch =
        !filterOptions.Price.length ||
        filterOptions.Price.some((range) =>
          isPriceInRange(product.Price, range)
        );

      // Fix for Availability
      const availabilityMatch =
        filterOptions.Avalibility.includes("All") ||
        (filterOptions.Avalibility.includes("Discontinued") &&
          product.isDiscontinued) ||
        (filterOptions.Avalibility.includes("Available") &&
          !product.isDiscontinued);

      return (
        sizeMatch &&
        sleeveMatch &&
        customizeMatch &&
        colorMatch &&
        priceMatch &&
        availabilityMatch
      );
    }).sort((a, b) =>
      sortOrder === "lowToHigh" ? a.Price - b.Price : b.Price - a.Price
    );
  }, [filterOptions, AllProducts, sortOrder]);

  return (
    <div className="flex h-screen">
      {FilterBarOpen && (
        <div
          className={`fixed top-17 h-screen overflow-y-auto scrollbar-hide border-r transition-all duration-300
      ${FilterBarOpen ? "w-[20vw] sm:block" : "w-0 sm:w-0"}`}
        >
          <div className="pl-[2vw] pt-[5vh] pr-5">
            <ProductFilter
              setFilterOptions={setFilterOptions}
              filterOptions={filterOptions}
              applySorting={true}
              setSortOrder={setSortOrder}
              allowColumnSelection={true}
              allProducts={true}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-y-scroll scrollbar-hide transition-all duration-300
      ${FilterBarOpen ? "sm:ml-[20vw]" : "ml-0"}`}
      >
        <div className="fixed top-15 z-20 bg-white shadow-2xl w-full transition-all duration-300">
          <div className="flex gap-1 items-center ml-2 backdrop-blur-3xl pt-3 pb-2 sm:h-15 w-full ">
            <ProductTopbar
              listView={listView}
              setListView={setListView}
              count={filteredProducts.length}
              handleOpenDialog={handleOpenDialog}
              allProducts={true}
            />
          </div>
        </div>

        {/* Product Listing */}
        <div className="p-4 mt-17 mb-10 ml-3">
          {listView ? (
            <ProductGridView
              products={filteredProducts}
              loading={isLoading}
              allProducts={true}
              handleOpenDialog={handleOpenDialog}
              count={filteredProducts.length}
            />
          ) : (
            <ProductListView
              products={filteredProducts}
              allProducts={true}
              isLoading={isLoading}
              handleOpenDialog={handleOpenDialog}
              count={filteredProducts.length}
            />
          )}
        </div>
      </div>

      {/* Bottom Bar for Mobile */}
      <div className="fixed bottom-0 block sm:hidden h-[10vh] w-full">
        <ProductBottomBar
          setFilterOptions={setFilterOptions}
          filterOptions={filterOptions}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </div>

      {/* Dialog for Adding/Editing Product */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="product-form-dialog"
        PaperProps={{
          style: {
            maxHeight: "95vh",
          },
        }}
      >
        <DialogContent>
          <ProductForm
            product={selectedProduct}
            onClose={handleCloseDialog}
            handleCloseDialog={handleCloseDialog}
            isEdit={!!selectedProduct}
            title={selectedProduct ? "Edit Product" : "Add New Product"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllProducts;
