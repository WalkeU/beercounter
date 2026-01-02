const jwt = require("jsonwebtoken")

const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

const generateToken = (userId, username) => {
  return jwt.sign({ id: userId, username }, process.env.JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRY_SECONDS}s`,
  })
}

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_EXPIRY_SECONDS * 1000,
  })
}

module.exports = {
  generateToken,
  setTokenCookie,
}
