"use client";

import { useState, useEffect } from "react";
import { SoftwareApprovalRecord, EquipoData, SoftwareData } from "@/lib/types";
import ApprovalTable from "@/components/ApprovalTable";
import SearchBox from "@/components/SearchBox";
import FilterSelect from "@/components/FilterSelect";
import ExportDropdown from "@/components/ExportDropdown";
import StatsCard from "@/components/StatsCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AprobadoPage() {
  const [data, setData] = useState<SoftwareApprovalRecord[]>([]);
  const [equipos, setEquipos] = useState<EquipoData[]>([]);
  const [softwares, setSoftwares] = useState<SoftwareData[]>([]);
  const [locations, setLocations] = useState<{ ubicacion: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [equipoFilter, setEquipoFilter] = useState("all");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [softwareFilter, setSoftwareFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Ordenamiento
  const [sortColumn, setSortColumn] = useState<
    keyof SoftwareApprovalRecord | null
  >("equipo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cargar datos iniciales
  useEffect(() => {
    loadFilters();
  }, []);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadData();
  }, [search, equipoFilter, estadoFilter, softwareFilter, locationFilter]);

  const loadFilters = async () => {
    try {
      const [equiposRes, softwaresRes, locationsRes] = await Promise.all([
        fetch("/api/equipos"),
        fetch("/api/softwares"),
        fetch("/api/locations"),
      ]);

      const equiposResult = await equiposRes.json();
      const equiposData =
        equiposRes.ok && Array.isArray(equiposResult) ? equiposResult : [];
      setEquipos(equiposData);

      const softwaresResult = await softwaresRes.json();
      const softwaresData =
        softwaresRes.ok && Array.isArray(softwaresResult)
          ? softwaresResult
          : [];
      setSoftwares(softwaresData);

      const locationsResult = await locationsRes.json();
      const locationsData =
        locationsRes.ok && Array.isArray(locationsResult)
          ? locationsResult
          : [];
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading filters:", error);
      setEquipos([]);
      setSoftwares([]);
      setLocations([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        equipo: equipoFilter,
        estado: estadoFilter,
        software: softwareFilter,
        ubicacion: locationFilter,
      });

      const response = await fetch(`/api/software-approval?${params}`);
      const result = await response.json();

      const data = response.ok && Array.isArray(result) ? result : [];
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof SoftwareApprovalRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleReset = () => {
    setSearch("");
    setEquipoFilter("all");
    setEstadoFilter("all");
    setSoftwareFilter("all");
    setLocationFilter("all");
  };

  // Ordenar datos
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    // Manejar undefined/null
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Manejar booleanos
    if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      if (aVal === bVal) return 0;
      return (aVal ? 1 : 0) > (bVal ? 1 : 0)
        ? sortDirection === "asc"
          ? 1
          : -1
        : sortDirection === "asc"
        ? -1
        : 1;
    }

    // Manejar strings y números
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, equipoFilter, estadoFilter, softwareFilter, locationFilter]);

  // Calcular estadísticas
  const approvedCount = data.filter((item) => item.aprobado).length;
  const unapprovedCount = data.length - approvedCount;

  const exportColumns = [
    { key: "equipo", label: "Equipo" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "software", label: "Software" },
    { key: "version", label: "Versión" },
    { key: "aprobado", label: "Estado" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-red-700 p-5">
      <div className="mx-auto">
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden my-5">
          {/* Header */}
          <header className="text-center p-8 border-b-2 border-gray-100">
            <h1 className="text-4xl font-light text-gray-800 mb-3">
              <i className="fas fa-shield-check text-blue-500 mr-4"></i>
              Control de Software Aprobado
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Verificación de software instalado vs. software aprobado por la
              empresa
            </p>
          </header>

          {/* Controls */}
          <div className="bg-gray-50 p-6 text-black">
            {/* Search */}
            <div className="mb-6">
              <SearchBox
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Buscar por equipo o software..."
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end text-black">
              <FilterSelect
                id="equipoFilter"
                label="Equipo"
                icon="fas fa-desktop"
                value={equipoFilter}
                onChange={setEquipoFilter}
                options={[
                  { value: "all", label: "Todos los equipos" },
                  ...equipos.map((eq) => ({
                    value: eq.equipo,
                    label: eq.equipo,
                  })),
                ]}
              />

              <FilterSelect
                id="locationFilter"
                label="Ubicación"
                icon="fas fa-map-marker-alt"
                value={locationFilter}
                onChange={setLocationFilter}
                options={[
                  { value: "all", label: "Todas las ubicaciones" },
                  ...locations.map((l) => ({
                    value: l.ubicacion,
                    label: l.ubicacion,
                  })),
                ]}
              />

              <FilterSelect
                id="softwareFilter"
                label="Software"
                icon="fas fa-puzzle-piece"
                value={softwareFilter}
                onChange={setSoftwareFilter}
                options={[
                  { value: "all", label: "Todo el software" },
                  ...softwares.map((sw) => ({
                    value: sw.software,
                    label: sw.software,
                  })),
                ]}
              />

              <FilterSelect
                id="estadoFilter"
                label="Estado"
                icon="fas fa-shield-check"
                value={estadoFilter}
                onChange={setEstadoFilter}
                options={[
                  { value: "all", label: "Todos" },
                  { value: "aprobado", label: "Aprobados" },
                  { value: "desaprobado", label: "No Aprobados" },
                ]}
              />

              <button
                onClick={handleReset}
                className="px-5 py-2 bg-gray-600 text-white rounded-lg font-medium transition-all hover:bg-gray-700 hover:shadow-lg"
              >
                <i className="fas fa-undo mr-2"></i>
                Resetear Filtros
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <StatsCard
              icon="fas fa-list"
              label="Total de registros"
              value={data.length}
              color="blue"
            />
            <StatsCard
              icon="fas fa-filter"
              label="Registros filtrados"
              value={sortedData.length}
              color="purple"
            />
            <StatsCard
              icon="fas fa-check-circle"
              label="Aprobados"
              value={approvedCount}
              color="green"
            />
            <StatsCard
              icon="fas fa-exclamation-triangle"
              label="Desaprobados"
              value={unapprovedCount}
              color="red"
            />
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <div className="flex items-center space-x-4">
                <div>
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, sortedData.length)} de {sortedData.length}{" "}
                  registros
                  {sortedData.length !== data.length &&
                    ` (filtrados de ${data.length} totales)`}
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-sm">
                    Filas por página:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ExportDropdown
                  rows={paginatedData}
                  allRows={sortedData}
                  columns={exportColumns as any}
                />
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left mr-1"></i>
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <ApprovalTable
                data={paginatedData}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-6 text-white">
        <p>&copy; 2025 Control de Software Aprobado - Cremona Inoxidable SA</p>
      </footer>
    </div>
  );
}
