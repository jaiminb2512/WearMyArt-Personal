import React, { useEffect, useState } from "react";
import ApiURLS from "../Data/ApiURLS";
import { Dialog, DialogContent } from "@mui/material";
import ProductForm from "../Components/ProductComponents/ProductForm";
import ProductFilter from "../Components/ProductComponents/ProductFilter";
import ProductTopbar from "../Components/ProductComponents/ProductTopbar";
import ProductGridView from "../Components/ProductComponents/ProductGridView";
import ProductBottomBar from "../Components/ProductComponents/ProductBottomBar";
import ProductListView from "../Components/ProductComponents/ProductListView";
import { useDispatch, useSelector } from "react-redux";
import { toggleProductFormOpen } from "../Redux/OpenCloseSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import { useApiMutation } from "../utils/apiRequest";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const { FilterBarOpen, productFormOpen } = useSelector(
    (state) => state.OpenClose
  );

  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({});
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [listView, setListView] = useState(false);
  const [sortOrder, setSortOrder] = useState("lowToHigh");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
  });

  const [filterOptions, setFilterOptions] = useState({
    Size: [],
    Sleeve: [],
    CustomizeOption: [],
    Color: [],
    Price: [0, 5000],
    Sort: ["Low to High"],
    Avalibility: ["All"],
  });

  const fetchProductsMutation = useApiMutation(
    `${ApiURLS.GetAllProduct.url}?page=${page}&limit=10`,
    ApiURLS.GetAllProduct.method
  );

  const fetchProducts = async (pageNum, reset = false) => {
    try {
      const result = await fetchProductsMutation.mutateAsync({
        ...filterOptions,
        sortOrder,
        showToastMessage: pageNum === 1,
      });

      const newProducts = result?.products || [];

      if (result?.pagination) {
        setPagination(result.pagination);
      }

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      if (result?.pagination) {
        setHasMore(pageNum < result.pagination.totalPages);
      } else {
        setHasMore(newProducts.length >= 10);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, page === 1);
  }, [page]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, true);
  }, [filterOptions, sortOrder]);

  useEffect(() => {
    if (updatedProduct && Object.keys(updatedProduct).length > 0) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
    }
  }, [updatedProduct]);

  useEffect(() => {
    if (newProduct && Object.keys(newProduct).length > 0) {
      setProducts((prevProducts) => [newProduct, ...prevProducts]);
    }
  }, [newProduct]);

  const loadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const navigate = useNavigate()

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product);
    navigate('/add-product')
    // dispatch(toggleProductFormOpen(true));
  };

  const handleCloseDialog = () => {
    dispatch(toggleProductFormOpen(false));
  };

  const isLoading = fetchProductsMutation.isLoading && products.length === 0;

  return (
    <div className="flex h-screen overflow-x-hidden">
      {FilterBarOpen && (
        <div
          className={`fixed hidden h-screen overflow-y-auto scrollbar-hide border-r transition-all duration-300
          ${FilterBarOpen ? "lg:w-[25vw] xl:w-[20vw] lg:block" : "w-0 sm:w-0"}`}
        >
          <div className="pl-[2vw] pt-[2vh] pr-5">
            <ProductFilter
              setFilterOptions={setFilterOptions}
              filterOptions={filterOptions}
              setSortOrder={setSortOrder}
              allowColumnSelection={true}
              allProducts={true}
            />
          </div>
        </div>
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300
        ${FilterBarOpen ? "lg:ml-[25vw] xl:ml-[20vw]" : "ml-0"}`}
      >
        <div className="sticky top-0 z-20 bg-white shadow-2xl w-full transition-all duration-300">
          <div className="flex gap-1 items-center ml-2 backdrop-blur-3xl pt-3 pb-2 sm:h-15 w-full">
            <ProductTopbar
              listView={listView}
              setListView={setListView}
              count={pagination.totalProducts}
              handleOpenDialog={handleOpenDialog}
            />
          </div>
        </div>

        <div
          className="p-4 mb-20 ml-3 overflow-y-auto scrollbar-hide"
          id="scrollableDiv"
          style={{ height: "calc(100vh - 100px)" }}
        >
          <InfiniteScroll
            dataLength={products.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            {listView ? (
              <ProductGridView
                products={products}
                loading={isLoading}
                handleOpenDialog={handleOpenDialog}
                count={pagination.totalProducts}
              />
            ) : (
              <ProductListView
                products={products}
                isLoading={isLoading}
                handleOpenDialog={handleOpenDialog}
                count={pagination.totalProducts}
              />
            )}
          </InfiniteScroll>
        </div>
      </div>

      <div className="fixed bottom-0 block lg:hidden h-[7vh] w-full bg-gray-100 z-30">
        <ProductBottomBar
          setFilterOptions={setFilterOptions}
          filterOptions={filterOptions}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </div>

      <Dialog
        open={productFormOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="product-form-dialog"
        PaperProps={{ style: { maxHeight: "95vh" } }}
      >
        <DialogContent>
          <ProductForm
            product={selectedProduct}
            onClose={handleCloseDialog}
            handleCloseDialog={handleCloseDialog}
            isEdit={!!selectedProduct}
            setNewProduct={setNewProduct}
            setUpdatedProduct={setUpdatedProduct}
            title={selectedProduct ? "Edit Product" : "Add New Product"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllProducts;
