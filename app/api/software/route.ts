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
      sv.name AS version,
      sc.name AS categoria
    FROM glpi_items_softwareversions isv
    JOIN glpi_computers c
        ON isv.items_id = c.id
        AND isv.itemtype = 'Computer'
    JOIN glpi_softwareversions sv
        ON isv.softwareversions_id = sv.id
    JOIN glpi_softwares s
        ON sv.softwares_id = s.id
    LEFT JOIN glpi_locations l
        ON c.locations_id = l.id
    LEFT JOIN glpi_softwarecategories sc
        ON s.softwarecategories_id = sc.id
    WHERE c.is_deleted = 0 AND c.is_template = 0
        AND (sc.name IS NULL OR sc.name NOT IN ('system', 'update', 'system_update'))
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
  
  query += ' ORDER BY l.completename, c.name, s.name';
  
  const [rows] = await pool.execute(query, params);
  const data = rows as SoftwareRecord[];
  
  // Filtrar y normalizar software
  const filteredData = data
    .filter(item => !shouldExcludeSoftware(item.software))
    .map(item => ({
      ...item,
      software: normalizeSoftwareName(item.software),
    }));
  
  // Eliminar duplicados por computadora + software
  const uniqueData = Array.from(
    filteredData.reduce((map, item) => {
      const key = `${item.computadora}-${item.software}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
      return map;
    }, new Map<string, SoftwareRecord>())
    .values()
  );
  
  return NextResponse.json(uniqueData);
}
