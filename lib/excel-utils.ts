import { readFile, utils } from 'xlsx';
import fs from 'fs';
import { SOFTWARE_FILTERS } from './software-filters.config';

// Ruta al archivo Excel de software aprobado
const EXCEL_PATH = process.env.EXCEL_PATH || 
  './public/RP_Software_Aprobado.xlsx';

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
export function readApprovedSoftware(): string[] {
    try {
        const workbook = readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = utils.sheet_to_json(sheet) as Record<string, any>[];
        
        // Buscar la columna "Software"
        let softwareColumn: string | null = null;
        
        if (data.length > 0) {
          const firstRow = data[0];
          
          // Primero verificar si __EMPTY_1 contiene "Software"
          if (firstRow['__EMPTY_1'] === 'Software') {
            softwareColumn = '__EMPTY_1';
          } else {
            // Buscar columna que contenga "Software" en el nombre o valor
            softwareColumn = Object.keys(firstRow).find(key => 
              key.toLowerCase().includes('software') || 
              (typeof firstRow[key] === 'string' && firstRow[key].toLowerCase() === 'software')
            ) || null;
          }
        }
        
        if (!softwareColumn) {
          return [];
        }
        
        // Extraer la columna "Software" y normalizar
        // Saltar la primera fila si es encabezado
        const startRow = data[0][softwareColumn] === 'Software' ? 1 : 0;
        
        const approvedList = data
          .slice(startRow)
          .map(row => row[softwareColumn!])
          .filter(software => 
            software && 
            typeof software === 'string' && 
            software.trim() &&
            software.toLowerCase() !== 'software'
          )
          .map(software => normalizeSoftwareName(software.trim()));
        
        approvedSoftwareCache = [...new Set(approvedList)]; // Eliminar duplicados
        lastExcelRead = new Date();
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
export function reloadApprovedSoftware(): { success: boolean; count: number; lastRead: Date } {
  const software = readApprovedSoftware();
  return {
    success: true,
    count: software.length,
    lastRead: lastExcelRead!,
  };
}

// Inicializar cache al importar el módulo
try {
  if (approvedSoftwareCache.length === 0) {
    readApprovedSoftware();
  }
} catch (error) {
  console.error('Error initializing approved software cache:', error);
}
