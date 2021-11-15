require("dotenv").config();
const JWT = require("jsonwebtoken");

function requiresAuth(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(401)
      .send("Unauthorized, Must send Authorization header.");
  }
  const parts = authorization.split(" ");
  if (parts.length !== 2) {
    return res.status(401).send("Malformed Token");
  }
  if (parts[0].toLowerCase() !== "bearer") {
    return res.status(401).send("Malformed Token");
  }
  const token = parts[1];
  try {
    console.log("token", token);
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).send("Invalid Token");
  }
}
module.exports = {
  requiresAuth,
};
