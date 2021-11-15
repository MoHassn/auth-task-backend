require("dotenv").config();

// Connect To the Database
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const findUserByEmail = async (email) => {
  const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return user.rows[0];
};

const createUser = async (email, password) => {
  try {
    const user = await pool.query(
      `INSERT INTO users (email, password) VALUES ('${email}', '${password}') RETURNING *`
    );
    return user.rows[0];
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  pool,
  createUser,
  findUserByEmail,
};
