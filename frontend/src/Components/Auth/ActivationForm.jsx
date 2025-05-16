import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiURLS from "../../Data/ApiURLS";
import { useApiMutation } from "../../utils/apiRequest";
import {
  TextField,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from "@mui/material";
import MTooltipButton from "../MTooltipButton";

const steps = ["Enter email", "Verify OTP"];

const ActivationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activationData, setActivationData] = useState({
    email: "",
    OTP: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    OTP: "",
  });

  const navigate = useNavigate();

  const sendingMailMutation = useApiMutation(
    ApiURLS.SendingMailForActivate.url,
    ApiURLS.SendingMailForActivate.method
  );
  const verifyOTPMutation = useApiMutation(
    ApiURLS.VerifyActivationOTP.url,
    ApiURLS.VerifyActivationOTP.method
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setActivationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevData) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let formValid = true;
    const newErrors = {
      email: "",
      OTP: "",
    };

    if (activeStep === 0) {
      const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!EmailRegex.test(activationData.email)) {
        newErrors.email = "Invalid email format";
        formValid = false;
      }
    } else {
      if (!activationData.OTP) {
        newErrors.OTP = "Enter the OTP sent to your email";
        formValid = false;
      }
    }
    setErrors(newErrors);
    return formValid;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    if (activeStep === 0) {
      await sendingMailMutation.mutateAsync({ email: activationData.email });
      setActiveStep(1);
    } else {
      const response = await verifyOTPMutation.mutateAsync({
        email: activationData.email,
        OTP: activationData.OTP,
      });

      navigate("/login");
    }
  };

  return (
    <Container component="main">
      <div className="w-full mt-8">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="mt-8">
          {activeStep === 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Enter your email to receive an activation OTP
              </Typography>
              <TextField
                label="Email"
                variant="standard"
                name="email"
                type="email"
                value={activationData.email}
                onChange={onChange}
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email}
              />
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Enter the OTP sent to {activationData.email}
              </Typography>
              <TextField
                label="OTP"
                variant="standard"
                name="OTP"
                value={activationData.OTP}
                onChange={onChange}
                fullWidth
                margin="normal"
                error={!!errors.OTP}
                helperText={errors.OTP}
              />
            </>
          )}

          <div className="mt-4">
            <MTooltipButton
              title={activeStep === 0 ? "Send OTP" : "Verify OTP"}
              onClick={handleNext}
              variant="contained"
              color="success"
              className="w-full"
              disabled={
                sendingMailMutation.isLoading || verifyOTPMutation.isLoading
              }
            >
              {activeStep === 0 ? "Send OTP" : "Verify OTP"}
            </MTooltipButton>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ActivationForm;
