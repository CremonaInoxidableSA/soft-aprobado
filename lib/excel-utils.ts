import { readFile, read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { SOFTWARE_FILTERS } from './software-filters.config';

// Ruta al archivo Excel de software aprobado
const EXCEL_PATH = path.join(process.cwd(), 'data', 'uploads', 'RP_Software_Aprobado.xlsx');

// Cache para software aprobado
let approvedSoftwareCache: string[] = [];
let lastExcelRead: Date | null = null;

// Función para normalizar nombres de software
export function normalizeSoftwareName(name: string): string {
  if (!name) return name;
  
  let normalized = name;
  
  // Aplicar reglas de normalización
  for (const rule of SOFTWARE_FILTERS.normalize) {
    normalized = normalized.replace(rule.pattern, rule.replacement);
  }
  
  return normalized.trim();
}

// Función para verificar si un software debe ser excluido
export function shouldExcludeSoftware(name: string): boolean {
  if (!name) return true;
  
  for (const pattern of SOFTWARE_FILTERS.exclude) {
    if (pattern.test(name)) {
      return true;
    }
  }
  
  return false;
}

// Función para leer el Excel de software aprobado
export async function readApprovedSoftware(): Promise<string[]> {
    try {
        console.log('📖 Intentando leer archivo Excel de software aprobado...');

        // Verificar si el archivo existe antes de intentar leerlo
        if (!fs.existsSync(EXCEL_PATH)) {
            console.warn(`❌ Approved software Excel file not found at: ${EXCEL_PATH}`);
            console.warn('Please ensure the file exists and OneDrive is synchronized.');
            approvedSoftwareCache = [];
            lastExcelRead = null;
            return [];
        }

        console.log('✅ Archivo Excel encontrado, procediendo a leer...');

        let workbook;
        if (EXCEL_PATH.startsWith('http')) {
            const response = await fetch(EXCEL_PATH);
            if (!response.ok) {
                throw new Error(`Failed to fetch Excel: ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            workbook = read(buffer);
        } else {
            workbook = readFile(EXCEL_PATH);
        }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convertir la hoja a un array de arrays (filas)
        const data = utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        
        console.log(`📋 Hoja "${sheetName}" cargada con ${data.length} filas`);
        
        // La columna C es el índice 2 (A=0, B=1, C=2)
        const softwareColumnIndex = 2;
        
        // Extraer la columna C, saltando las primeras 3 filas (encabezados)
        // y tomando desde la fila 4 en adelante
        const approvedList = data
          .slice(3) // Saltar las primeras 3 filas (título, fila vacía, encabezados)
          .map(row => row[softwareColumnIndex]) // Obtener el valor de la columna C
          .filter(software => 
            software && 
            typeof software === 'string' && 
            software.trim() &&
            software.toLowerCase() !== 'software'
          )
          .map(software => normalizeSoftwareName((software as string).trim()));
        
        approvedSoftwareCache = [...new Set(approvedList)]; // Eliminar duplicados
        lastExcelRead = new Date();
        
        console.log(`✅ Excel procesado correctamente. Encontrados ${approvedSoftwareCache.length} elementos únicos de software aprobado`);
        
        return approvedSoftwareCache;
    } catch (error) {
        console.error('Error reading approved software Excel file:', error);
        approvedSoftwareCache = [];
        lastExcelRead = null;
        return [];
    }
}

// Función para verificar si un software está aprobado
export function isSoftwareApproved(softwareName: string): boolean {
  const normalized = normalizeSoftwareName(softwareName);
  return approvedSoftwareCache.some(approved => 
    normalized.toLowerCase() === approved.toLowerCase() ||
    normalized.toLowerCase().includes(approved.toLowerCase()) ||
    approved.toLowerCase().includes(normalized.toLowerCase())
  );
}

// Obtener cache de software aprobado
export function getApprovedSoftwareCache(): string[] {
  return approvedSoftwareCache;
}

// Obtener última fecha de lectura del Excel
export function getLastExcelRead(): Date | null {
  return lastExcelRead;
}

// Recargar software aprobado
export async function reloadApprovedSoftware(): Promise<{ success: boolean; count: number; lastRead: Date }> {
  const software = await readApprovedSoftware();
  return {
    success: true,
    count: software.length,
    lastRead: lastExcelRead!,
  };
}

// Inicializar cache al importar el módulo
// Nota: En Next.js, la inicialización asíncrona puede no ejecutarse correctamente
// La inicialización se hará explícitamente desde las APIs que lo necesiten
console.log('📦 Módulo excel-utils cargado. Cache inicial vacío:', approvedSoftwareCache.length);
