import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { SoftwareApprovalRecord } from '@/lib/types';
import { 
  shouldExcludeSoftware, 
  normalizeSoftwareName,
  isSoftwareApproved,
  readApprovedSoftware,
  getApprovedSoftwareCache
} from '@/lib/excel-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const equipo = searchParams.get('equipo') || 'all';
    const estado = searchParams.get('estado') || 'all';
    const software = searchParams.get('software') || 'all';

    // Inicializar cache de software aprobado si está vacío
    if (getApprovedSoftwareCache().length === 0) {
      console.log('🔄 Inicializando cache de software aprobado desde API...');
      await readApprovedSoftware();
      console.log('✅ Cache inicializado con', getApprovedSoftwareCache().length, 'elementos');
    }

    const pool = await getDbPool();
    
    let query = `
      SELECT 
        c.name AS equipo,
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
    
    query += ' ORDER BY l.completename, c.name, s.name';
    
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
    
    // Eliminar duplicados por computadora + software
    data = Array.from(
      data.reduce((map, item) => {
        const key = `${item.computadora}-${item.software}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
        return map;
      }, new Map<string, SoftwareApprovalRecord>())
      .values()
    );
    
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
