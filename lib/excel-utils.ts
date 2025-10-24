import { readFile, read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { SOFTWARE_FILTERS } from './software-filters.config';
import { ApprovedSoftwareEntry, ApprovedSoftwareHierarchy } from './types';

// Ruta al archivo Excel de software aprobado
const EXCEL_PATH = path.join(process.cwd(), 'data', 'RP_Software_Aprobado.xlsx');

// Cache para software aprobado con jerarquía
let approvedSoftwareCache: string[] = [];
let approvedSoftwareHierarchy: ApprovedSoftwareHierarchy = {
  general: [],
  areas: new Map(),
  puestos: new Map(),
};
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
  
  let isExcluded = false;
  for (const pattern of SOFTWARE_FILTERS.exclude) {
    if (pattern.test(name)) {
      isExcluded = true;
      break;
    }
  }
  
  if (!isExcluded) return false;
  
  // Si está excluido, verificar si debe incluirse
  if (SOFTWARE_FILTERS.include) {
    for (const pattern of SOFTWARE_FILTERS.include) {
      if (pattern.test(name)) {
        return false; // Incluir si coincide con patrón de inclusión
      }
    }
  }
  
  return true; // Excluir si no coincide con inclusión
}

// Función para leer el Excel de software aprobado con jerarquía
export async function readApprovedSoftware(): Promise<string[]> {
    try {
        console.log('📖 Intentando leer archivo Excel de software aprobado...');
        console.log(`   Ruta: ${EXCEL_PATH}`);

        // Verificar si el archivo existe antes de intentar leerlo
        if (!fs.existsSync(EXCEL_PATH)) {
            console.warn(`❌ Approved software Excel file not found at: ${EXCEL_PATH}`);
            console.warn('Please ensure the file exists and OneDrive is synchronized.');
            approvedSoftwareCache = [];
            approvedSoftwareHierarchy = {
              general: [],
              areas: new Map(),
              puestos: new Map(),
            };
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
            const fileBuffer = fs.readFileSync(EXCEL_PATH);
            workbook = read(fileBuffer, { type: 'buffer' });
        }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convertir la hoja a un array de arrays (filas)
        const data = utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        
        console.log(`📋 Hoja "${sheetName}" cargada con ${data.length} filas`);
        
        // Índices de columnas: A=0, B=1, C=2
        const areaColumnIndex = 0;
        const puestoColumnIndex = 1;
        const softwareColumnIndex = 2;
        
        // Reiniciar la jerarquía
        approvedSoftwareHierarchy = {
          general: [],
          areas: new Map(),
          puestos: new Map(),
        };
        
        const allSoftware = new Set<string>();
        
        // Procesar las filas. Comenzar desde 0 y saltar filas de cabecera o vacías
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const area = row[areaColumnIndex];
          const puesto = row[puestoColumnIndex];
          const software = row[softwareColumnIndex];
          
          // Saltar filas de cabecera o sin software válido
          if (!software || typeof software !== 'string' || !software.trim()) {
            continue;
          }
          
          const softwareTrimmed = software.trim();
          
          // Saltar si es una cabecera
          if (softwareTrimmed.toLowerCase() === 'software' || 
              softwareTrimmed.toLowerCase().includes('inventario')) {
            continue;
          }
          
          const normalizedSoftware = normalizeSoftwareName(softwareTrimmed);
          allSoftware.add(normalizedSoftware);
          
          const areaStr = area && typeof area === 'string' ? area.trim() : '';
          const puestoStr = puesto && typeof puesto === 'string' ? puesto.trim() : '';
          
          // Saltar si el área es cabecera
          if (areaStr.toLowerCase().includes('area') && areaStr.toLowerCase().includes('rol')) {
            continue;
          }
          
          // Normalizar área y puesto para las keys (sin tildes, sin espacios extra, minúsculas)
          const areaNormalized = normalizeForComparison(areaStr).replace(/\s+/g, '_');
          const puestoNormalized = normalizeForComparison(puestoStr).replace(/\s+/g, '_');
          
          console.log(`  Fila ${i+1}: area="${areaStr}" (norm: "${areaNormalized}"), puesto="${puestoStr}" (norm: "${puestoNormalized}"), software="${softwareTrimmed}"`);
          
          // Determinar la clasificación según la jerarquía
          if (!areaStr || areaNormalized === 'general') {
            // Software de General - disponible para todos
            approvedSoftwareHierarchy.general.push(normalizedSoftware);
          } else if (!puestoStr) {
            // Software de área específica (sin puesto)
            if (!approvedSoftwareHierarchy.areas.has(areaNormalized)) {
              approvedSoftwareHierarchy.areas.set(areaNormalized, []);
            }
            approvedSoftwareHierarchy.areas.get(areaNormalized)!.push(normalizedSoftware);
          } else {
            // Software de puesto específico
            const puestoKey = `${areaNormalized}_${puestoNormalized}`;
            if (!approvedSoftwareHierarchy.puestos.has(puestoKey)) {
              approvedSoftwareHierarchy.puestos.set(puestoKey, {
                area: areaNormalized,
                software: [],
              });
            }
            approvedSoftwareHierarchy.puestos.get(puestoKey)!.software.push(normalizedSoftware);
          }
        }
        
        // Eliminar duplicados en cada categoría
        approvedSoftwareHierarchy.general = [...new Set(approvedSoftwareHierarchy.general)];
        approvedSoftwareHierarchy.areas.forEach((software, area) => {
          approvedSoftwareHierarchy.areas.set(area, [...new Set(software)]);
        });
        approvedSoftwareHierarchy.puestos.forEach((data, puesto) => {
          data.software = [...new Set(data.software)];
        });
        
        approvedSoftwareCache = [...allSoftware];
        lastExcelRead = new Date();
        
        console.log(`✅ Excel procesado correctamente:`);
        console.log(`   - Software general: ${approvedSoftwareHierarchy.general.length}`);
        console.log(`   - Áreas: ${approvedSoftwareHierarchy.areas.size}`);
        console.log(`   - Puestos específicos: ${approvedSoftwareHierarchy.puestos.size}`);
        console.log(`   - Total único de software: ${approvedSoftwareCache.length}`);
        
        return approvedSoftwareCache;
    } catch (error) {
        console.error('Error reading approved software Excel file:', error);
        approvedSoftwareCache = [];
        approvedSoftwareHierarchy = {
          general: [],
          areas: new Map(),
          puestos: new Map(),
        };
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

// Función para normalizar texto para comparación (eliminar tildes, espacios extras, convertir a minúsculas)
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

// Función para extraer área y puesto de la ubicación GLPI
// La ubicación de GLPI viene como texto que puede contener el área o puesto
// Necesitamos buscar coincidencias con las áreas y puestos del Excel
function parseLocation(ubicacion: string): { area: string; puesto: string } {
  if (!ubicacion) {
    return { area: '', puesto: '' };
  }
  
  const ubicacionNormalized = normalizeForComparison(ubicacion).replace(/\s+/g, '_');
  
  // Primero intentar encontrar coincidencias con puestos específicos
  // Los puestos son más específicos, así que tienen prioridad
  let bestMatch: { area: string; puesto: string } | null = null;
  let bestMatchLength = 0;
  
  for (const [puestoKey, puestoData] of approvedSoftwareHierarchy.puestos.entries()) {
    // El puestoKey es "area_puesto" (ambos normalizados)
    const [area, puesto] = puestoKey.split('_');
    
    // Verificar si la ubicación contiene el nombre del puesto
    // Buscamos la coincidencia más larga para ser más específicos
    if (ubicacionNormalized.includes(puesto) && puesto.length > bestMatchLength) {
      bestMatch = { area, puesto };
      bestMatchLength = puesto.length;
    }
  }
  
  if (bestMatch) {
    return bestMatch;
  }
  
  // Si no se encontró un puesto específico, buscar el área
  bestMatchLength = 0;
  let bestArea = '';
  
  for (const [area] of approvedSoftwareHierarchy.areas.entries()) {
    if (ubicacionNormalized.includes(area) && area.length > bestMatchLength) {
      bestArea = area;
      bestMatchLength = area.length;
    }
  }
  
  if (bestArea) {
    return { area: bestArea, puesto: '' };
  }
  
  return { area: '', puesto: '' };
}

// Función para verificar si un software está aprobado para una ubicación específica
// Implementa la lógica de herencia: General -> Área -> Puesto
export function isSoftwareApprovedForLocation(softwareName: string, ubicacion: string): boolean {
  const normalized = normalizeSoftwareName(softwareName);
  
  // Función auxiliar para comparar software (más flexible)
  const matchesSoftware = (approvedSoftware: string): boolean => {
    const normalizedApproved = approvedSoftware.toLowerCase().trim();
    const normalizedInput = normalized.toLowerCase().trim();
    
    // Coincidencia exacta
    if (normalizedApproved === normalizedInput) return true;
    
    // El software aprobado contiene el buscado o viceversa
    if (normalizedInput.includes(normalizedApproved) || normalizedApproved.includes(normalizedInput)) {
      return true;
    }
    
    // Coincidencia parcial para casos como "Adobe Illustrator CC 2015" vs "Adobe Illustrator"
    const approvedWords = normalizedApproved.split(/\s+/);
    const inputWords = normalizedInput.split(/\s+/);
    
    // Si todas las palabras del software aprobado están en el input, es match
    const allApprovedWordsInInput = approvedWords.every(word => 
      inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))
    );
    
    if (allApprovedWordsInInput && approvedWords.length >= 2) return true;
    
    // Si todas las palabras del input están en el aprobado, es match
    const allInputWordsInApproved = inputWords.every(word => 
      approvedWords.some(approvedWord => approvedWord.includes(word) || word.includes(approvedWord))
    );
    
    if (allInputWordsInApproved && inputWords.length >= 2) return true;
    
    return false;
  };
  
  // 1. Verificar en software General (heredado por todos)
  if (approvedSoftwareHierarchy.general.some(matchesSoftware)) {
    return true;
  }
  
  // Parsear la ubicación para obtener área y puesto
  const { area, puesto } = parseLocation(ubicacion);
  
  // Si no hay área definida, solo verificar General
  if (!area) {
    return false;
  }
  
  // 2. Verificar en software del Área (heredado por todos en el área)
  const areaSoftware = approvedSoftwareHierarchy.areas.get(area);
  if (areaSoftware && areaSoftware.some(matchesSoftware)) {
    return true;
  }
  
  // Si no hay puesto específico, solo verificar General + Área
  if (!puesto) {
    return false;
  }
  
  // 3. Verificar en software específico del Puesto
  const puestoKey = `${area}_${puesto}`;
  const puestoData = approvedSoftwareHierarchy.puestos.get(puestoKey);
  if (puestoData) {
    // El puesto hereda su propio software
    if (puestoData.software.some(matchesSoftware)) {
      return true;
    }
    
    // IMPORTANTE: El puesto también hereda el software del área padre
    // Por ejemplo, "Coordinacion Administracion CR" hereda de "Administracion CR"
    const areaPadre = puestoData.area;
    const areaPadreSoftware = approvedSoftwareHierarchy.areas.get(areaPadre);
    if (areaPadreSoftware && areaPadreSoftware.some(matchesSoftware)) {
      return true;
    }
  }
  
  return false;
}

// Obtener cache de software aprobado
export function getApprovedSoftwareCache(): string[] {
  return approvedSoftwareCache;
}

// Obtener jerarquía completa de software aprobado (para depuración)
export function getApprovedSoftwareHierarchy() {
  return {
    general: approvedSoftwareHierarchy.general,
    areas: Object.fromEntries(approvedSoftwareHierarchy.areas),
    puestos: Object.fromEntries(
      Array.from(approvedSoftwareHierarchy.puestos.entries()).map(([key, value]) => [
        key,
        value,
      ])
    ),
  };
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
