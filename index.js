require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const JWT = require("jsonwebtoken");
const app = express();

app.use(bodyParser.json());
app.use(cors());
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
  res.status(200).send(JSON.stringify({ code: 200, message: "Hello World!" }));
});

app.post("/register", async (req, res) => {
  console.log("body", req.body);
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .send(JSON.stringify({ code: 400, message: "Email is required" }));
  }
  if (!password) {
    return res
      .status(400)
      .send(JSON.stringify({ code: 400, message: "Password is required" }));
  }

  const user = await findUserByEmail(email);
  if (user) {
    return res
      .status(400)
      .send(JSON.stringify({ code: 400, message: "User already exists" }));
  }

  const newUser = await createUser(email, password);
  const token = generateJWT({ email: newUser.email });
  res.send(JSON.stringify({ code: 200, token }));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .send(JSON.stringify({ code: 400, message: "Email is required" }));
  }
  if (!password) {
    return res
      .status(400)
      .send(JSON.stringify({ code: 400, message: "Password is required" }));
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res
      .status(403)
      .send(
        JSON.stringify(
          JSON.stringify({ code: 403, message: "User does not exist" })
        )
      );
  }

  if (!(await comparePassword(password, user.password))) {
    return res
      .status(403)
      .send(
        JSON.stringify(
          JSON.stringify({ code: 403, message: "Password is incorrect" })
        )
      );
  }
  const token = generateJWT({ email: user.email });
  res.status(200).send(JSON.stringify({ code: 200, token }));
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

function generateJWT(user) {
  const jwt = JWT.sign(user, process.env.JWT_SECRET);
  return jwt;
}
