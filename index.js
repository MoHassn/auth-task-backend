require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const JWT = require("jsonwebtoken");
const app = express();

app.use(bodyParser.json());
const { pool, createUser, findUserByEmail, comparePassword } = require("./db");
const { requiresAuth } = require("./middlewares");

(function initiateDbTables() {
  pool
    .query(
      `CREATE TABLE IF NOT EXISTS users(
      email VARCHAR ( 255 ) UNIQUE NOT NULL,
      password VARCHAR ( 255 ) NOT NULL
      )`
    )
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.error(e);
    });
})();

app.get("/", requiresAuth, (req, res) => {
  res.send("Hello World!");
});

app.post("/register", async (req, res) => {
  console.log("body", req.body);
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send("Email is required");
  }
  if (!password) {
    return res.status(400).send("Password is required");
  }

  const user = await findUserByEmail(email);
  if (user) {
    return res.status(400).send("User already exists");
  }

  const newUser = await createUser(email, password);
  res.send(generateJWT({ email: newUser.email }));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send("Email is required");
  }
  if (!password) {
    return res.status(400).send("Password is required");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(400).send("User does not exist");
  }

  if (!(await comparePassword(password, user.password))) {
    return res.status(400).send("Password is incorrect");
  }

  res.send(generateJWT({ email: user.email }));
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

function generateJWT(user) {
  const jwt = JWT.sign(user, process.env.JWT_SECRET);
  return jwt;
}
