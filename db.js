require("dotenv").config();
const bcrypt = require("bcrypt");

// Connect To the Database
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const generateHash = async (password) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const comparePassword = async (password, hash) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

const findUserByEmail = async (email) => {
  const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return user.rows[0];
};

const createUser = async (email, password) => {
  try {
    const hash = await generateHash(password);
    const user = await pool.query(
      `INSERT INTO users (email, password) VALUES ('${email}', '${hash}') RETURNING *`
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
  comparePassword,
};
