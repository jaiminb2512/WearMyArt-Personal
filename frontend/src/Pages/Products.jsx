import React, { useState, useMemo } from "react";
import { useFetchData } from "../utils/apiRequest";
import ApiURLS from "../Data/ApiURLS";
import { ProductFilterData } from "../Data/FilterData";
import ProductListView from "../Components/ProductComponents/ProductListView";
import ProductFilter from "../Components/ProductComponents/ProductFilter";
import ProductTopbar from "../Components/ProductComponents/ProductTopbar";
import ProductGridView from "../Components/ProductComponents/ProductGridView";
import ProductBottomBar from "../Components/ProductComponents/ProductBottomBar";
import { useSelector } from "react-redux";

const Products = () => {
  const { FilterBarOpen } = useSelector((state) => state.OpenClose);
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

  const { data: products = [], isLoading } = useFetchData(
    "Products",
    ApiURLS.GetAllActiveProducts.url,
    ApiURLS.GetAllActiveProducts.method,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const isPriceInRange = (price, range) => {
    if (!range) return true;
    if (range === "0-499") return price >= 0 && price <= 499;
    if (range === "499-999") return price >= 499 && price <= 999;
    if (range === "999-1999") return price >= 999 && price <= 1999;
    if (range === "1999+") return price >= 1999;
    return true;
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const sizeMatch =
          !filterOptions.Size.length ||
          filterOptions.Size.includes(product.Size);
        const sleeveMatch =
          !filterOptions.Sleeve.length ||
          filterOptions.Sleeve.includes(product.Sleeve);
        const customizeMatch =
          !filterOptions.CustomizeOption.length ||
          filterOptions.CustomizeOption.includes(product.CustomizeOption);
        const colorMatch =
          !filterOptions.Color.length ||
          filterOptions.Color.includes(product.Color);
        const priceMatch =
          !filterOptions.Price.length ||
          isPriceInRange(product.Price, filterOptions.Price[0]);
        return (
          sizeMatch && sleeveMatch && customizeMatch && colorMatch && priceMatch
        );
      })
      .sort((a, b) =>
        sortOrder === "lowToHigh" ? a.Price - b.Price : b.Price - a.Price
      );
  }, [filterOptions, products, sortOrder]);

  return (
    <div className="flex h-screen">
      <div
        className={`fixed top-17 h-screen overflow-y-auto scrollbar-hide transition-all duration-300
      ${
        FilterBarOpen ? "sm:block w-[35vw] lg:w-[25vw] border-r" : "w-0 sm:w-0"
      }`}
      >
        {FilterBarOpen && (
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
        )}
      </div>

      <div
        className={`flex-1 flex flex-col overflow-y-scroll scrollbar-hide transition-all duration-300
      ${FilterBarOpen ? "ml-[35vw] lg:ml-[25vw] xl:ml-[25vw]" : "ml-0"}`}
      >
        <div className="fixed top-15 w-full z-20 bg-gray-100 shadow-2xl z-[999]">
          <div className="flex gap-1 items-center w-full sm:w-[80vw] ml-2 backdrop-blur-3xl pt-3 pb-2 h-15 ">
            <ProductTopbar
              listView={listView}
              setListView={setListView}
              count={filteredProducts.length}
            />
          </div>
        </div>
        <div className="p-4 mt-17 mb-10 sm:mb-0">
          {listView ? (
            <ProductGridView
              products={filteredProducts}
              loading={isLoading}
              count={filteredProducts.length}
            />
          ) : (
            <ProductListView
              products={filteredProducts}
              isLoading={isLoading}
              count={filteredProducts.length}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 block sm:hidden h-[fit-content] w-full">
        <ProductBottomBar
          ProductFilterData={ProductFilterData}
          setFilterOptions={setFilterOptions}
          filterOptions={filterOptions}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
};

export default Products;
