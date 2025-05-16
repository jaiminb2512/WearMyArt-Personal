import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IoEyeOutline } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import ApiURLS from "../../Data/ApiURLS.js";
import {
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Container,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { login } from "../../Redux/UserSlice.js";
import { useApiMutation } from "../../utils/apiRequest.js";
import { useConfirmationPopup } from "../../utils/useEntityMutations.js";

const LoginForm = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    OTP: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "", OTP: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpButtonDisabled, setIsOtpButtonDisabled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showConfirmation = useConfirmationPopup();

  const loginMutation = useApiMutation(ApiURLS.Login.url, ApiURLS.Login.method);
  const sendOtpMutation = useApiMutation(
    ApiURLS.SendingMailForLogin.url,
    ApiURLS.SendingMailForLogin.method
  );

  const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const onChange = (e) => {
    const { name, value } = e.target;
    setErrors((prevData) => ({ ...prevData, [name]: "" }));
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    let formValid = true;
    const newErrors = { email: "", password: "", OTP: "" };

    if (!EmailRegex.test(loginData.email)) {
      newErrors.email = "Invalid email format";
      formValid = false;
    }

    if (!isOtpSent && loginData.password.length < 6) {
      newErrors.password = "password must be at least 6 characters long";
      formValid = false;
    }

    if (isOtpSent && !loginData.OTP) {
      newErrors.OTP = "Enter the OTP sent to your email";
      formValid = false;
    }

    setErrors(newErrors);
    return formValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let requestData = { email: loginData.email };
    if (isOtpSent) {
      requestData.OTP = loginData.OTP;
    } else {
      requestData.password = loginData.password;
    }

    try {
      const userData = await loginMutation.mutateAsync(requestData);
      if (userData) {
        dispatch(login(userData.user));
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        showConfirmation({
          title: "Activate Account",
          message:
            "Your account has been deactivated. Would you like to reactivate your account or login with a different account?",
          onConfirm: handleActivateAccount,
          confirmText: "Activate User",
          confirmColor: "success",
          cancelText: "Use Different Account",
          cancelClick: handleDifferentAccount,
        });
      } else {
        console.error("Login failed", error);
      }
    }
  };

  const handleSendOtp = async () => {
    if (!EmailRegex.test(loginData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Enter a valid email",
      }));
      return;
    }

    setIsOtpButtonDisabled(true);
    try {
      await sendOtpMutation.mutateAsync({ email: loginData.email });
      setIsOtpSent(true);
      setIsOtpButtonDisabled(false);
    } catch (error) {
      setIsOtpButtonDisabled(false);

      if (error.response && error.response.status === 403) {
        showConfirmation({
          title: "Activate Account",
          message:
            "Your account has been deactivated. Would you like to reactivate your account or login with a different account?",
          onConfirm: handleActivateAccount,
          confirmText: "Activate User",
          confirmColor: "success",
          cancelText: "Use Different Account",
          cancelClick: handleDifferentAccount,
        });
      } else {
        console.error("Send OTP failed", error);
      }
    }
  };

  const handleActivateAccount = () => {
    sessionStorage.setItem("activationEmail", loginData.email);
    navigate("/activate-user");
  };

  const handleDifferentAccount = () => {
    setLoginData({
      email: "",
      password: "",
      OTP: "",
    });
    setErrors({ email: "", password: "", OTP: "" });
    setIsOtpSent(false);
  };

  return (
    <Container component="main">
      <div className="w-full">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          className="text-green-500"
        >
          Login
        </Typography>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-2">
          <div className="mb-4">
            <TextField
              label="Email"
              type="email"
              name="email"
              value={loginData.email}
              onChange={onChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              variant="standard"
            />
          </div>

          {!isOtpSent ? (
            <div>
              <div className="mb-6">
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <IoEyeOutline /> : <FaEyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="flex justify-between items-center flex-wrap">
                <FormControlLabel control={<Checkbox />} label="Remember me" />
                <Typography
                  variant="body2"
                  align="right"
                  onClick={() => {
                    navigate("/forgot-password");
                  }}
                >
                  <span className="text-green-500 cursor-pointer">
                    Forgot password ?
                  </span>
                </Typography>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <TextField
                label="OTP"
                type="text"
                name="OTP"
                value={loginData.OTP}
                onChange={onChange}
                fullWidth
                error={!!errors.OTP}
                helperText={errors.OTP}
                variant="filled"
              />
            </div>
          )}

          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loginMutation.isPending}
          >
            {isOtpSent ? "Verify OTP & Login" : "Login"}
          </Button>

          {!isOtpSent && (
            <Button
              variant="outlined"
              color="success"
              fullWidth
              onClick={handleSendOtp}
              disabled={isOtpButtonDisabled || sendOtpMutation.isPending}
              sx={{ mt: 2 }}
            >
              Login Using OTP
            </Button>
          )}
        </form>
      </div>
    </Container>
  );
};

export default LoginForm;
