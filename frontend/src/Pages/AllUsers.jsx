import React, { useEffect, useState } from "react";
import ApiURLS from "../Data/ApiURLS";
import { useFetchData } from "../utils/apiRequest";
import { Block, LockOpen, CheckCircle, Cancel } from "@mui/icons-material";
import { useUserMutations } from "../utils/useEntityMutations";
import MTooltipButton from "../Components/MTooltipButton";
import { IconButton, CircularProgress, Pagination } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { lightTheme } from "../Theme/theme";

const AllUsers = () => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const limit = 9;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const queryKey = ["AllUsers", page];

  const { data: apiResponse, isLoading } = useFetchData(
    queryKey,
    `${ApiURLS.GetAllUser.url}?page=${page}&limit=${limit}`,
    ApiURLS.GetAllUser.method,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      showToastMessage: page === 1,
    }
  );

  useEffect(() => {
    if (apiResponse) {
      setUsers(apiResponse?.AllUser || []);

      const pagination = apiResponse?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalUsers(pagination.total || 0);
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    return () => {
      setPage(1);
      setUsers([]);
      setExpandedRows({});
    };
  }, []);

  const {
    handleBlockUser,
    handleUnBlockUser,
    isLoading: isMutationLoading,
  } = useUserMutations((userId, isBlocked) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, isBlocked } : user
      )
    );
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    setExpandedRows({});
    window.scrollTo(0, 0);
  };

  const toggleRowExpansion = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4 ml-[3vw]">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>

      {totalUsers > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          Showing users {(page - 1) * limit + 1}-
          {Math.min(page * limit, totalUsers)} of {totalUsers}
        </p>
      )}

      <div className="shadow rounded-lg overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Full Name
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Joined Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <React.Fragment key={user._id}>
                <tr className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{user.fullName}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm">
                    {user.email}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      {user.isActive ? "Active" : "Inactive"}
                      {user.isActive ? (
                        <CheckCircle
                          className="text-green-500 ml-1"
                          fontSize="small"
                        />
                      ) : (
                        <Cancel
                          className="text-red-500 ml-1"
                          fontSize="small"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm flex items-center space-x-2">
                    {isMobile ? (
                      <>
                        <IconButton
                          color={user.isBlocked ? "primary" : "error"}
                          onClick={() =>
                            user.isBlocked
                              ? handleUnBlockUser(user)
                              : handleBlockUser(user)
                          }
                          size="small"
                          disabled={isMutationLoading}
                        >
                          {user.isBlocked ? <LockOpen /> : <Block />}
                        </IconButton>
                        <button
                          className="text-sm font-medium flex items-center"
                          onClick={() => toggleRowExpansion(user._id)}
                          aria-label={
                            expandedRows[user._id]
                              ? "Hide Details"
                              : "Show Details"
                          }
                        >
                          {expandedRows[user._id] ? (
                            <KeyboardArrowUpIcon size={20} />
                          ) : (
                            <KeyboardArrowDownIcon size={20} />
                          )}
                        </button>
                      </>
                    ) : (
                      <MTooltipButton
                        variant="contained"
                        size="small"
                        color={user.isBlocked ? "primary" : "error"}
                        startIcon={user.isBlocked ? <LockOpen /> : <Block />}
                        onClick={() =>
                          user.isBlocked
                            ? handleUnBlockUser(user)
                            : handleBlockUser(user)
                        }
                        disabled={isMutationLoading}
                        tittle={user.isBlocked ? "Unblock User" : "Block User"}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </MTooltipButton>
                    )}
                  </td>
                </tr>
                {isMobile && expandedRows[user._id] && (
                  <tr className="bg-green-100">
                    <td colSpan={5} className="px-4 py-2">
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-semibold">Email:</span>
                          {user.Email}
                        </div>
                        <div>
                          <span className="font-semibold">Joined Date:</span>
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center p-4">
          <p>No users found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <ThemeProvider theme={lightTheme}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
              siblingCount={isMobile ? 0 : 1}
              className="pagination"
              variant="outlined"
              shape="rounded"
            />
          </ThemeProvider>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
