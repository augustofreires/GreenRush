import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "greenrushapp",
  password: "greenrush2024app",
  database: "greenrush",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
