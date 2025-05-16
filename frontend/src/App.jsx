import React, { useState, useMemo, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme, lightTheme } from "./Theme/theme";
import { CssBaseline, Box } from "@mui/material";

import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import UserAvatar from "./Components/UserAvtar";
import ToastNotification from "./Components/ToastNotification";

import Home from "./Pages/Home";
import Products from "./Pages/Products";
import CustomizeProduct from "./Pages/CustomizeProduct";
import Profile from "./Pages/Profile";
import AllProducts from "./Pages/AllProducts";
import Errorpage from "./Pages/Errorpage";
import OrderSuccess from "./Pages/OrderSuccess";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AllOrders from "./Pages/AllOrders";
import AllUsers from "./Pages/AllUsers";
import Auth from "./Pages/Auth";
import Orders from "./Pages/Orders";
import Cart from "./Pages/Cart";
import { toggleSmScreen } from "./Redux/OpenCloseSlice";
import OrderDetails from "./Pages/OrderDetails";
import ApiURLS from "./Data/ApiURLS";
import { useApiMutation } from "./utils/apiRequest";
import { login } from "./Redux/UserSlice";
import CheckOut from "./Pages/CheckOut";
import CompleteOrder from "./Components/PurchaseComponents/CompleteOrder";
import ConfirmOrder from "./Components/CustomizeTShirt/ConfirmOrder";
import CustomizationOptions from "./Pages/CustomizationOptions";
import AuthRoute from "./Components/AuthRoute";
import Dashboard from "./Pages/Dashboard";
import Popup from "./Components/PopUp";
import AddProduct from "./Pages/AddProduct";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const autoLoginMutation = useApiMutation(
    ApiURLS.AutoLogin.url,
    ApiURLS.AutoLogin.method,
    { showToastMessage: false }
  );

  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [intendedPath, setIntendedPath] = useState(null);

  useEffect(() => {
    if (
      !user &&
      !intendedPath &&
      location.pathname !== "/login" &&
      location.pathname !== "/register"
    ) {
      setIntendedPath(location.pathname);
    }
  }, []);

  useEffect(() => {
    const autoLogin = async () => {
      const userData = await autoLoginMutation.mutateAsync({});
      dispatch(login(userData.user));

      if (intendedPath && intendedPath !== "/") {
        navigate(intendedPath);
      }
    };

    if (!user) {
      autoLogin();
    }
  }, [intendedPath]);

  const showSidebar = location.pathname.includes("/dashboard");

  const { SmScreen, HideText, FilterBarOpen } = useSelector(
    (state) => state.OpenClose
  );
  let sidebarWidth = showSidebar ? (HideText ? 60 : 240) : 0;

  useEffect(() => {
    if (user?.isAdmin) {
      dispatch(toggleSmScreen(true));
    } else {
      dispatch(toggleSmScreen(false));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth < 768) {
        dispatch(toggleSmScreen(true));
      } else {
        dispatch(toggleSmScreen(false));
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  sidebarWidth = SmScreen ? 0 : sidebarWidth;

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        {showSidebar && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: "margin 0.3s ease",
          }}
          className={`mt-15 ${
            sidebarWidth === 60
              ? "ml-[60px]"
              : sidebarWidth === 240
              ? FilterBarOpen
                ? "ml-0"
                : "ml-0 lg:ml-[25vw] xl:ml-[20vw]"
              : "ml-0"
          }`}
        >
          <Routes>
            <Route element={<AuthRoute role="guest" />}>
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/activate-user" element={<Auth />} />
              <Route path="/forgot-password" element={<Auth />} />
            </Route>

            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />

            <Route element={<AuthRoute role="customer" />}>
              <Route path="/confirm-order" element={<ConfirmOrder />} />
              <Route path="/dashboard/checkout" element={<CheckOut />} />
              <Route
                path="/dashboard/complete-order"
                element={<CompleteOrder />}
              />
              <Route
                path="/dashboard/order-success"
                element={<OrderSuccess />}
              />

              <Route path="/customize-product" element={<CustomizeProduct />} />
              <Route path="/dashboard/orders" element={<Orders />} />
              <Route path="/dashboard/cart" element={<Cart />} />
            </Route>

            <Route element={<AuthRoute role="admin" />}>
              <Route path="/dashboard/all-products" element={<AllProducts />} />
              <Route path="/dashboard/all-orders" element={<AllOrders />} />
              <Route path="/dashboard/all-users" element={<AllUsers />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route
                path="/dashboard/customization-options"
                element={<CustomizationOptions />}
              />
              <Route
                path="/dashboard/order-details"
                element={<OrderDetails />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<AuthRoute />}>
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Errorpage />} />
          </Routes>
        </Box>
      </Box>
      <ToastNotification />
      <Popup />
      <UserAvatar />
    </>
  );
};

function App() {
  const mode = useSelector((state) => state.theme.mode);

  const theme = useMemo(
    () => (mode === "dark" ? darkTheme : lightTheme),
    [mode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppLayout />
          {/* <ReactQueryDevtools /> */}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
