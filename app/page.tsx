"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [totalRecords, setTotalRecords] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [equipoFilter, setEquipoFilter] = useState("all");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [softwareFilter, setSoftwareFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [sortColumn, setSortColumn] = useState<
    keyof SoftwareApprovalRecord | null
  >("equipo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
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
  }, [search, equipoFilter, estadoFilter, softwareFilter, locationFilter]);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadFilters = async () => {
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
      softwaresRes.ok && Array.isArray(softwaresResult) ? softwaresResult : [];
    setSoftwares(softwaresData);

    const locationsResult = await locationsRes.json();
    const locationsData =
      locationsRes.ok && Array.isArray(locationsResult) ? locationsResult : [];
    setLocations(locationsData);
    const totalRes = await fetch("/api/software-approval/total");
    const totalJson = await totalRes.json();
    if (totalRes.ok && typeof totalJson.total === "number") {
      setTotalRecords(totalJson.total);
    } else {
      setTotalRecords(null);
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

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

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

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, equipoFilter, estadoFilter, softwareFilter, locationFilter]);

  const approvedCount = data.filter((item) => item.aprobado).length;
  const unapprovedCount = data.length - approvedCount;

  const exportColumns = [
    { key: "equipo", label: "Equipo" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "software", label: "Software" },
    { key: "version", label: "Versión" },
    { key: "aprobado", label: "Estado" },
  ] as { key: keyof SoftwareApprovalRecord; label: string }[];

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="mx-auto">
        <div className="bg-background2 rounded-sm shadow-2xl overflow-hidden my-5 border border-background4">
          {/* Header */}
          <header className="text-center p-8 border-b-2 border-background4">
            <h1 className="text-4xl font-light text-texto mb-3">
              <i className="fas fa-shield-check text-blue mr-4"></i>
              Control de Software Aprobado
            </h1>
            <p className="text-texto2 text-lg mb-4">
              Verificación de software instalado vs. software aprobado por la
              empresa
            </p>
          </header>

          {/* Controls */}
          <div className="bg-background3 p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                className="px-5 py-2 bg-background4 text-texto rounded-lg font-medium transition-all hover:bg-background5 hover:shadow-lg border border-background5"
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
              value={totalRecords ?? data.length}
              color="blue"
            />
            <StatsCard
              icon="fas fa-filter"
              label="Registros filtrados"
              value={sortedData.length}
              color="blue"
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
          <div className="px-6 py-2 bg-background3 border-t border-background4">
            <div className="flex items-center justify-between text-sm text-texto2">
              <div className="flex items-center space-x-4">
                <div>
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, sortedData.length)} de {sortedData.length}{" "}
                  registros
                  {typeof totalRecords === "number" &&
                    sortedData.length !== totalRecords &&
                    ` (filtrados de ${totalRecords} totales)`}
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
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-sm border border-background4 rounded-md bg-background2 text-texto focus:outline-none focus:border-blue"
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
                  columns={exportColumns}
                />
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-background2 border border-background4 rounded-md text-texto hover:bg-background3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-chevron-left mr-1"></i>
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-texto">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-background2 border border-background4 rounded-md text-texto hover:bg-background3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      <footer className="text-center py-6 text-texto2">
        <p>&copy; 2025 Control de Software Aprobado - Creminox</p>
      </footer>
    </div>
  );
}
