require("dotenv").config();

// Connect To the Database
const { Client } = require("pg");
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(function initiateDbTables() {
  client.connect();
  client
    .query(
      `CREATE TABLE IF NOT EXISTS users(
      email VARCHAR ( 255 ) UNIQUE NOT NULL,
      password VARCHAR ( 255 ) NOT NULL
      )`
    )
    .then((res) => {
      console.log(res);
      client.end();
    })
    .catch((e) => {
      console.error(e);
      client.end();
    });
})();
