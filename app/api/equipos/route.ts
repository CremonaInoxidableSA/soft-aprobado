import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { EquipoData } from "@/lib/types";

export async function GET() {
  const pool = await getDbPool();

  const query = `
    SELECT DISTINCT c.name AS equipo
    FROM glpi_computers c
    WHERE c.is_deleted = 0 AND c.is_template = 0
    ORDER BY c.name
  `;

  const [rows] = await pool.execute(query);
  const data = rows as EquipoData[];

  return NextResponse.json(data);
}
