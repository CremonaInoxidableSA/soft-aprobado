import { NextResponse } from 'next/server';
import { getApprovedSoftwareCache, getLastExcelRead } from '@/lib/excel-utils';

export async function GET() {
  const approvedList = getApprovedSoftwareCache();
  const lastRead = getLastExcelRead();
  
  return NextResponse.json({
    software: approvedList,
    count: approvedList.length,
    lastRead: lastRead,
  });
}
