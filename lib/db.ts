import mysql from "mysql2/promise";
import { DbConfig } from "./types";

let pool: mysql.Pool | null = null;

// Configuración de la base de datos desde variables de entorno
export const dbConfig: DbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "glpi",
  port: parseInt(process.env.DB_PORT || "3306"),
};

// Crear pool de conexiones
export async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    try {
      const connection = await pool.getConnection();
      connection.release();
    } catch (error) {
      throw error;
    }
  }

  return pool;
}

// Cerrar pool de conexiones (útil para testing)
export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
