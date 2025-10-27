import mysql from "mysql2/promise";
import { DbConfig } from "./types";

let pool: mysql.Pool | null = null;

export const dbConfig: DbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "glpi",
  port: parseInt(process.env.DB_PORT || "3306"),
};

export async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    try {
      const connection = await pool.getConnection();
      connection.release();
    } catch (error) {
      throw error;
    }
  }

  return pool;
}

export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
