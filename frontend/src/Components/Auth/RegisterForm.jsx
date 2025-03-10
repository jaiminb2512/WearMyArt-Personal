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
  Paper,
  Typography,
  Box,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { IoEyeOutline } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";

const steps = ["Register", "OTP Verification"];

const RegisterForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registerData, setRegisterData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    OTP: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    FullName: "",
    Email: "",
    Password: "",
    OTP: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const registerMutation = useApiMutation(
    ApiURLS.Register.url,
    ApiURLS.Register.method
  );
  const activateUserMutation = useApiMutation(
    ApiURLS.ActivateUser.url,
    ApiURLS.ActivateUser.method
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let formValid = true;
    const newErrors = { FullName: "", Email: "", Password: "", OTP: "" };

    if (activeStep === 0) {
      if (registerData.FullName.length < 6) {
        newErrors.FullName = "FullName must be at least 6 characters long";
        formValid = false;
      }
      const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!EmailRegex.test(registerData.Email)) {
        newErrors.Email = "Invalid Email format";
        formValid = false;
      }
      if (registerData.Password.length < 6) {
        newErrors.Password = "Password must be at least 6 characters long";
        formValid = false;
      }
    } else {
      if (!registerData.OTP) {
        newErrors.OTP = "Enter the OTP sent to your Email";
        formValid = false;
      }
    }
    setErrors(newErrors);
    return formValid;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      if (activeStep === 0) {
        await registerMutation.mutateAsync(registerData);
        setActiveStep(1);
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
          Email: registerData.Email,
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
    <div>
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{ padding: 4, marginTop: 8 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            component="form"
            className="mt-[25px]"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {activeStep === 0 ? (
              <>
                <TextField
                  label="FullName"
                  variant="standard"
                  name="FullName"
                  value={registerData.FullName}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.FullName}
                  helperText={errors.FullName}
                />
                <TextField
                  label="Email"
                  variant="standard"
                  name="Email"
                  type="Email"
                  value={registerData.Email}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.Email}
                  helperText={errors.Email}
                />
                <TextField
                  label="Password"
                  variant="standard"
                  name="Password"
                  type={showPassword ? "text" : "Password"}
                  value={registerData.Password}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.Password}
                  helperText={errors.Password}
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
              color="primary"
              fullWidth
              disabled={
                registerMutation.isLoading || activateUserMutation.isLoading
              }
            >
              {activeStep === 0 ? "Next" : "Verify & Register"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default RegisterForm;
