const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
const { pool, createUser, findUserByEmail } = require("./db");

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

app.get("/", (req, res) => {
  res.send("Hello World!");
  createUser("test", "hd");
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
  res.send(newUser);
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

  if (user.password !== password) {
    return res.status(400).send("Password is incorrect");
  }

  res.send(user);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
