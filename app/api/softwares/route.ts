import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { SoftwareData } from '@/lib/types';
import { shouldExcludeSoftware, normalizeSoftwareName } from '@/lib/excel-utils';

export async function GET() {
  try {
    const pool = await getDbPool();
    
    const query = `
      SELECT DISTINCT s.name AS software
      FROM glpi_softwares s
      INNER JOIN glpi_softwareversions sv ON s.id = sv.softwares_id
      INNER JOIN glpi_items_softwareversions isv ON sv.id = isv.softwareversions_id
      LEFT JOIN glpi_softwarecategories sc ON s.softwarecategories_id = sc.id
      WHERE isv.itemtype = 'Computer'
          AND (sc.name IS NULL OR sc.name NOT IN ('system', 'update', 'system_update'))
      ORDER BY s.name
    `;
    
    const [rows] = await pool.execute(query);
    const data = rows as SoftwareData[];
    
    // Filtrar y normalizar software
    const filteredData = data
      .filter(item => !shouldExcludeSoftware(item.software))
      .map(item => ({
        software: normalizeSoftwareName(item.software),
      }))
      .filter((item, index, self) => 
        index === self.findIndex(t => t.software === item.software)
      )
      .sort((a, b) => a.software.localeCompare(b.software, 'es', { sensitivity: 'base' }));
    
    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching softwares data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de softwares' },
      { status: 500 }
    );
  }
}
