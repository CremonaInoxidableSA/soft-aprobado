import { NextResponse } from "next/server";
import {
  readApprovedSoftware,
  getApprovedSoftwareCache,
} from "@/lib/excel-utils";

// Función de prueba que simula parseLocation y isSoftwareApprovedForLocation con logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ubicacion = searchParams.get("ubicacion") || "Marketing";
  const software = searchParams.get("software") || "Adobe Illustrator CC 2015";

  if (getApprovedSoftwareCache().length === 0) {
    await readApprovedSoftware();
  }

  // Importar las funciones internas para debugging
  const { getApprovedSoftwareHierarchy, isSoftwareApprovedForLocation } =
    await import("@/lib/excel-utils");

  const hierarchy = getApprovedSoftwareHierarchy();

  // Normalizar la ubicación como lo hace parseLocation
  function normalizeForComparison(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const ubicacionNormalized = normalizeForComparison(ubicacion).replace(
    /\s+/g,
    "_",
  );

  // Buscar coincidencias de puesto
  const puestosMatches = [];
  for (const [puestoKey, puestoData] of Object.entries(hierarchy.puestos)) {
    const [area, puesto] = puestoKey.split("_");
    if (ubicacionNormalized.includes(puesto)) {
      puestosMatches.push({
        puestoKey,
        area,
        puesto,
        puestoLength: puesto.length,
        softwareCount: (puestoData as { software: string[] }).software.length,
        software: (puestoData as { software: string[] }).software,
      });
    }
  }

  // Buscar coincidencias de área
  const areasMatches = [];
  for (const [area, areaSoftware] of Object.entries(hierarchy.areas)) {
    if (ubicacionNormalized.includes(area)) {
      areasMatches.push({
        area,
        areaLength: area.length,
        softwareCount: (areaSoftware as string[]).length,
        software: areaSoftware,
      });
    }
  }

  // Resultado de la función real
  const aprobado = isSoftwareApprovedForLocation(software, ubicacion);

  return NextResponse.json({
    input: {
      ubicacion,
      software,
    },
    normalized: {
      ubicacionNormalized,
    },
    matches: {
      puestos: puestosMatches,
      areas: areasMatches,
    },
    resultado: {
      aprobado,
    },
    hierarchy: {
      generalCount: hierarchy.general.length,
      generalSoftware: hierarchy.general,
      areasKeys: Object.keys(hierarchy.areas),
      puestosKeys: Object.keys(hierarchy.puestos),
    },
  });
}
