import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Typography,
  Stack,
  Divider,
  TextField,
  Switch,
  CircularProgress,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Email,
  Person,
  Edit,
  Save,
  Block,
  CheckCircle,
} from "@mui/icons-material";
import MTooltipButton from "../Components/MTooltipButton";
import { useNavigate } from "react-router-dom";
import { useApiMutation } from "../utils/apiRequest";
import ApiURLS from "../Data/ApiURLS";
import KeyIcon from "@mui/icons-material/Key";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useConfirmationPopup } from "../utils/useEntityMutations";
import useLogOut from "../utils/Logout";

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useSelector((state) => state.user);
  const [isUserActive, setIsUserActive] = useState(user?.isActive ?? true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "Unknown User");
  const [error, setError] = useState(null);

  const showConfirmation = useConfirmationPopup();
  const { logOut } = useLogOut();

  const deactivateUserMutation = useApiMutation(
    ApiURLS.DeActivateUser.url,
    ApiURLS.DeActivateUser.method
  );

  const handleToggleUserStatus = () => {
    if (isUserActive) {
      showConfirmation({
        title: "Deactivate Account",
        message:
          "Are you sure you want to deactivate your account? You won't be able to use the service until it's reactivated.",
        onConfirm: handleDeactivateUser,
        confirmText: "Deactivate",
        confirmColor: "error",
      });
    } else {
      setIsUserActive(true);
    }
  };

  const handleDeactivateUser = async () => {
    await deactivateUserMutation.mutateAsync({});
    setIsUserActive(false);
    logOut();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFullName(user?.fullName || "Unknown User");
  };

  const UpdateUserMutation = useApiMutation(
    ApiURLS.UpdateUser.url,
    ApiURLS.UpdateUser.method
  );

  const handleSave = async () => {
    await UpdateUserMutation.mutateAsync({ fullName: fullName });
    setIsEditing(false);
    setError(null);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const initials = user?.fullName ? getInitials(user.fullName) : "U";

  const navigate = useNavigate();

  const handleMyOrder = () => {
    navigate("/dashboard/orders");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  useEffect(() => {
    if (user) {
      setIsUserActive(user.isActive ?? true);
      setFullName(user.fullName || "Unknown User");
    }
  }, [user]);

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        p: isMobile ? 2 : 4,
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 3,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: isMobile ? "100%" : "30%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar
            sx={{
              width: 150,
              height: 150,
              bgcolor: "primary.main",
              fontSize: 48,
              fontWeight: "bold",
              mb: 2,
            }}
          >
            {initials}
          </Avatar>
          {user?.isAdmin && (
            <Typography variant="subtitle1" color="error" fontWeight="bold">
              Administrator
            </Typography>
          )}
        </Box>

        <Box sx={{ width: isMobile ? "100%" : "70%" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider />
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Person color="primary" />
              {isEditing ? (
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <TextField
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    label="Full Name"
                  />
                </Box>
              ) : (
                <Typography variant="subtitle1">{fullName}</Typography>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Email color="primary" />
              <Typography variant="body1" color="text.secondary">
                {user?.email || "No email provided"}
              </Typography>
            </Box>

            {isEditing && (
              <Box display="flex" gap={2} justifyContent="flex-end">
                <MTooltipButton
                  title="Cancel"
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </MTooltipButton>
                <MTooltipButton
                  title="Save"
                  variant="contained"
                  color="primary"
                  startIcon={
                    UpdateUserMutation.isPending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
                  onClick={handleSave}
                  disabled={UpdateUserMutation.isPending}
                >
                  Save
                </MTooltipButton>
              </Box>
            )}

            <Box>
              <Typography variant="h6" gutterBottom>
                Account Status
              </Typography>
              <Divider />
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {isUserActive ? (
                  <CheckCircle color="success" />
                ) : (
                  <Block color="error" />
                )}
                <Typography variant="body1">
                  {isUserActive ? "Active" : "Deactivated"}
                </Typography>
              </Stack>
              <Switch
                checked={isUserActive}
                onChange={handleToggleUserStatus}
                disabled={deactivateUserMutation.isPending}
                color={isUserActive ? "success" : "error"}
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Divider />
            </Box>

            <Box
              display="flex"
              gap={2}
              flexDirection={isMobile ? "column" : "row"}
              flexWrap="wrap"
            >
              {!isEditing && (
                <MTooltipButton
                  title="Edit Profile"
                  variant="outlined"
                  color="primary"
                  fullWidth={isMobile}
                  startIcon={<Edit />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </MTooltipButton>
              )}
              <MTooltipButton
                title="Change Password"
                variant="outlined"
                color="primary"
                fullWidth={isMobile}
                startIcon={<KeyIcon />}
                onClick={handleChangePassword}
              >
                Change Password
              </MTooltipButton>
              {!user?.isAdmin && (
                <MTooltipButton
                  title="My Orders"
                  variant="outlined"
                  color="primary"
                  fullWidth={isMobile}
                  startIcon={<ViewListIcon />}
                  onClick={handleMyOrder}
                >
                  My Orders
                </MTooltipButton>
              )}
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
