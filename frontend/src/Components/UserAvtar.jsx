import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Avatar from "@mui/material/Avatar";
import { useSelector } from "react-redux";
import { LoginData, LogoutData } from "../Data/NavigationData";
import { useNavigate } from "react-router-dom";
import useLogOut from "../utils/Logout";

export default function OpenIconSpeedDial() {
  const { user } = useSelector((state) => state.user);
  const actions = user ? LoginData : LogoutData;
  const navigate = useNavigate();

  const userInitials = user?.fullName
    ? user.fullName.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "";

  const { logOut } = useLogOut();
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
      }}
    >
      <SpeedDial
        ariaLabel="User Actions"
        icon={<Avatar sx={{ bgcolor: "primary.main" }}>{userInitials}</Avatar>}
        sx={{
          "& .MuiSpeedDial-fab": {
            width: 50,
            height: 50,
            boxShadow: 1,
          },
          "& .MuiSpeedDial-actions": {
            paddingBottom: 0,
            marginBottom: 0,
          },
          height: "auto",
          "&.MuiSpeedDial-directionUp": {
            paddingBottom: 0,
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <SpeedDialAction
              key={action.name}
              icon={<ActionIcon />}
              tooltipTitle={action.name}
              onClick={() =>
                action.name === "Log Out"
                  ? logOut()
                  : navigate(`${action.path}`)
              }
              onMouseEnter={(e) => e.stopPropagation()}
              sx={{
                width: 50,
                height: 50,
                minHeight: "unset",
              }}
            />
          );
        })}
      </SpeedDial>
    </Box>
  );
}
