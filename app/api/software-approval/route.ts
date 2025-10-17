import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { SoftwareApprovalRecord } from '@/lib/types';
import { 
  shouldExcludeSoftware, 
  normalizeSoftwareName,
  isSoftwareApproved 
} from '@/lib/excel-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const equipo = searchParams.get('equipo') || 'all';
    const estado = searchParams.get('estado') || 'all';
    const software = searchParams.get('software') || 'all';

    const pool = await getDbPool();
    
    let query = `
      SELECT 
        c.name AS equipo,
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
        s.name LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (equipo !== 'all') {
      query += ' AND c.name = ?';
      params.push(equipo);
    }
    
    if (software !== 'all') {
      query += ' AND s.name = ?';
      params.push(software);
    }
    
    query += ' ORDER BY c.name, s.name';
    
    const [rows] = await pool.execute(query, params);
    let data = rows as SoftwareApprovalRecord[];
    
    // Filtrar, normalizar y verificar aprobación
    data = data
      .filter(item => !shouldExcludeSoftware(item.software))
      .map(item => {
        const normalizedSoftware = normalizeSoftwareName(item.software);
        return {
          ...item,
          software: normalizedSoftware,
          aprobado: isSoftwareApproved(normalizedSoftware),
        };
      });
    
    // Filtrar por estado de aprobación
    if (estado === 'aprobado') {
      data = data.filter(item => item.aprobado);
    } else if (estado === 'desaprobado') {
      data = data.filter(item => !item.aprobado);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching software approval data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de aprobación de software' },
      { status: 500 }
    );
  }
}
