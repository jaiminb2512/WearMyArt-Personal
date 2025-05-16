import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/UserSlice";
import ApiURLS from "../../Data/ApiURLS";
import { useApiMutation } from "../../utils/apiRequest";
import {
  Button,
  TextField,
  IconButton,
  Container,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { IoEyeOutline } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import { useConfirmationPopup } from "../../utils/useEntityMutations.js";

const steps = ["Register", "OTP Verification"];

const RegisterForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    OTP: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    OTP: "",
    Terms: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showConfirmation = useConfirmationPopup();

  const registerMutation = useApiMutation(
    ApiURLS.Register.url,
    ApiURLS.Register.method
  );
  const activateUserMutation = useApiMutation(
    ApiURLS.VerifyActivationOTP.url,
    ApiURLS.VerifyActivationOTP.method
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const handleCheckbox = (e) => {
    setErrors((prevData) => ({
      ...prevData,
      Terms: "",
    }));
    setAgreeTerms(e.target.checked);
  };

  const validateForm = () => {
    let formValid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      OTP: "",
      Terms: "",
    };

    if (activeStep === 0) {
      if (registerData.fullName.length < 3) {
        newErrors.fullName = "fullName must be at least 6 characters long";
        formValid = false;
      }
      const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!EmailRegex.test(registerData.email)) {
        newErrors.email = "Invalid email format";
        formValid = false;
      }

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

      if (!passwordRegex.test(registerData.password)) {
        newErrors.password =
          "password must be 8-16 characters, include 1 uppercase letter, 1 number, and 1 special character";
        formValid = false;
      }
      if (!agreeTerms) {
        newErrors.Terms = "You must agree to the terms and conditions";
        formValid = false;
      }
    } else {
      if (!registerData.OTP) {
        newErrors.OTP = "Enter the OTP sent to your email";
        formValid = false;
      }
    }
    setErrors(newErrors);
    return formValid;
  };

  const handleActivateAccount = () => {
    sessionStorage.setItem("activationEmail", registerData.email);
    navigate("/activate-user");
  };

  const handleDifferentAccount = () => {
    setRegisterData({
      fullName: "",
      email: "",
      password: "",
      OTP: "",
    });
    setErrors({ fullName: "", email: "", password: "", OTP: "", Terms: "" });
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      if (activeStep === 0) {
        try {
          await registerMutation.mutateAsync(registerData);
          setActiveStep(1);
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
      } else {
        const otpNumber = parseInt(registerData.OTP, 10);
        if (isNaN(otpNumber)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            OTP: "Invalid OTP format",
          }));
          return;
        }

        const response = await activateUserMutation.mutateAsync({
          email: registerData.email,
          OTP: registerData.OTP,
        });

        dispatch(login(response.user));
        navigate("/");
      }
    } catch (error) {
      console.error("Registration or OTP verification error:", error);
    }
  };

  return (
    <Container component="main">
      <div className="w-full">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form className="mt-[25px] flex flex-col gap-2">
          {activeStep === 0 ? (
            <>
              <TextField
                label="Full Name"
                variant="standard"
                name="fullName"
                value={registerData.fullName}
                onChange={onChange}
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
              <TextField
                label="Email"
                variant="standard"
                name="email"
                type="email"
                value={registerData.email}
                onChange={onChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Password"
                variant="standard"
                name="password"
                type={showPassword ? "text" : "password"}
                value={registerData.password}
                onChange={onChange}
                fullWidth
                error={!!errors.password}
                helperText={errors.password}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => handleCheckbox(e)}
                  />
                }
                label="I agree to the Terms and Conditions"
              />
              {errors.Terms && <p style={{ color: "red" }}>{errors.Terms}</p>}
            </>
          ) : (
            <TextField
              label="Enter OTP"
              variant="standard"
              name="OTP"
              value={registerData.OTP}
              onChange={onChange}
              fullWidth
              error={!!errors.OTP}
              helperText={errors.OTP}
            />
          )}

          <Button
            onClick={handleNext}
            variant="contained"
            color="success"
            fullWidth
            disabled={
              registerMutation.isLoading || activateUserMutation.isLoading
            }
          >
            {activeStep === 0 ? "Next" : "Verify & Register"}
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default RegisterForm;
