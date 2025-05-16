import jwt from "jsonwebtoken";

export const generateAndSetTokens = (_id, res) => {
  const refreshToken = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  const Options = {
    httpOnly: true,
    secure: true,
  };

  res.cookie("refreshToken", refreshToken, Options);

  return { refreshToken };
};
