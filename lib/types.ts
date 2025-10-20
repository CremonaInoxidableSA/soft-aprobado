// Tipos para el proyecto de inventario de software GLPI

export interface SoftwareRecord {
  computadora: string;
  ubicacion: string;
  software: string;
  version: string;
  categoria: string;
}

export interface SoftwareApprovalRecord extends SoftwareRecord {
  equipo: string;
  aprobado: boolean;
}

export interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export interface FilterParams {
  search?: string;
  location?: string;
  software?: string;
  equipo?: string;
  estado?: string;
}

export interface SoftwareFilter {
  pattern: RegExp;
  replacement: string;
}

export interface SoftwareFiltersConfig {
  exclude: RegExp[];
  normalize: SoftwareFilter[];
}

export interface StatsData {
  total: number;
  filtered: number;
  approved?: number;
  unapproved?: number;
}

export interface LocationData {
  ubicacion: string;
}

export interface EquipoData {
  equipo: string;
}

export interface SoftwareData {
  software: string;
}
