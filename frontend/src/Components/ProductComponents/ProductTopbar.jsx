import React from "react";
import { Button } from "@mui/material";
import { FaTableCellsLarge } from "react-icons/fa6";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import { useDispatch, useSelector } from "react-redux";
import { toggleFilterBar } from "../../Redux/OpenCloseSlice";
import MTooltip from "../MTooltip";
import { useLocation } from "react-router-dom";

const ProductTopbar = ({ setListView, listView, count, handleOpenDialog }) => {
  const { FilterBarOpen } = useSelector((state) => state.OpenClose);
  const { user } = useSelector((state) => state.user);
  let isAdmin = user?.isAdmin || false;
  const location = useLocation();
  const allProducts = location.pathname.includes("/all-products");
  const dispatch = useDispatch();

  return (
    <div className="flex w-full items-center justify-between px-4 sm:px-6 py-2">
      <div className="flex items-center gap-4 ">
        <MTooltip title={FilterBarOpen ? "Close Filter" : "Open Filter"}>
          <div
            className="p-2 items-center justify-center w-12 h-10 cursor-pointer bg-gray-200 rounded hidden md:block "
            onClick={() => dispatch(toggleFilterBar())}
          >
            {FilterBarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </div>
        </MTooltip>

        <div className="relative flex border rounded-lg overflow-hidden bg-gray-200 w-24">
          <div
            className="absolute top-0 bottom-0 w-12 bg-gray-400 transition-all duration-300 rounded-lg"
            style={{
              transform: listView ? "translateX(48px)" : "translateX(0px)",
            }}
          ></div>

          <MTooltip title="List View">
            <button
              className={`p-2 flex items-center justify-center w-12 h-10 z-10 cursor-pointer ${
                !listView ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setListView(false)}
            >
              <FaTableCellsLarge className="text-lg" />
            </button>
          </MTooltip>

          <MTooltip title="Grid View">
            <button
              className={`p-2 flex items-center justify-center w-12 h-10 z-10 cursor-pointer ${
                listView ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setListView(true)}
            >
              <MenuIcon className="text-lg" />
            </button>
          </MTooltip>
        </div>

        {isAdmin && allProducts && (
          <MTooltip title="Add Product">
            <Button
              variant="contained"
              className="whitespace-nowrap"
              onClick={handleOpenDialog}
            >
              Add Product
            </Button>
          </MTooltip>
        )}
      </div>
    </div>
  );
};

export default ProductTopbar;
