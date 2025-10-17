import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { SoftwareRecord } from '@/lib/types';
import { shouldExcludeSoftware, normalizeSoftwareName } from '@/lib/excel-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || 'all';
  const software = searchParams.get('software') || 'all';

  const pool = await getDbPool();
  
  let query = `
    SELECT 
      c.name AS computadora,
      l.completename AS ubicacion,
      s.name AS software,
      sv.name AS version
    FROM glpi_computers c
    INNER JOIN glpi_items_softwareversions isv ON c.id = isv.items_id AND isv.itemtype = 'Computer'
    INNER JOIN glpi_softwareversions sv ON isv.softwareversions_id = sv.id
    INNER JOIN glpi_softwares s ON sv.softwares_id = s.id
    LEFT JOIN glpi_locations l ON c.locations_id = l.id
    WHERE c.is_deleted = 0 AND c.is_template = 0
  `;
  
  const params: string[] = [];
  
  if (search) {
    query += ` AND (
      c.name LIKE ? OR 
      l.completename LIKE ? OR 
      s.name LIKE ? OR 
      sv.name LIKE ?
    )`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (location !== 'all') {
    query += ' AND l.completename = ?';
    params.push(location);
  }
  
  if (software !== 'all') {
    query += ' AND s.name = ?';
    params.push(software);
  }
  
  query += ' ORDER BY c.name, s.name';
  
  const [rows] = await pool.execute(query, params);
  const data = rows as SoftwareRecord[];
  
  // Filtrar y normalizar software
  const filteredData = data
    .filter(item => !shouldExcludeSoftware(item.software))
    .map(item => ({
      ...item,
      software: normalizeSoftwareName(item.software),
    }));
  
  return NextResponse.json(filteredData);
}
