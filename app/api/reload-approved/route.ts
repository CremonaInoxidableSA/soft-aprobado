import { NextResponse } from 'next/server';
import { reloadApprovedSoftware } from '@/lib/excel-utils';

export async function POST() {
  const result = await reloadApprovedSoftware();
  
  return NextResponse.json({
    message: 'Lista de software aprobado recargada exitosamente',
    ...result,
  });
}
