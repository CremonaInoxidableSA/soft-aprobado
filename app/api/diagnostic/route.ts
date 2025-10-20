import { NextResponse } from 'next/server';
import { getApprovedSoftwareCache, getLastExcelRead, isSoftwareApproved } from '@/lib/excel-utils';

export async function GET() {
  try {
    const cache = getApprovedSoftwareCache();
    const lastRead = getLastExcelRead();

    // Probar algunos softwares comunes
    const testSoftwares = [
      'Microsoft Office',
      'Chrome',
      'AutoCAD',
      'Kaspersky',
      'Adobe Reader',
      'Visual Studio Code'
    ];

    const testResults = testSoftwares.map(software => ({
      software,
      aprobado: isSoftwareApproved(software),
      normalized: software.toLowerCase()
    }));

    return NextResponse.json({
      cacheStatus: {
        length: cache.length,
        lastRead: lastRead?.toISOString() || null,
        hasData: cache.length > 0
      },
      approvedSoftware: cache.slice(0, 10), // Primeros 10 elementos
      testResults,
      allApproved: cache
    });
  } catch (error) {
    console.error('Error in diagnostic endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}