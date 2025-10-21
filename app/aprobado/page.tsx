"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SoftwareApprovalRecord, EquipoData, SoftwareData } from "@/lib/types";
import ApprovalTable from "@/components/ApprovalTable";
import SearchBox from "@/components/SearchBox";
import FilterSelect from "@/components/FilterSelect";
import StatsCard from "@/components/StatsCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AprobadoPage() {
  const [data, setData] = useState<SoftwareApprovalRecord[]>([]);
  const [equipos, setEquipos] = useState<EquipoData[]>([]);
  const [softwares, setSoftwares] = useState<SoftwareData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [equipoFilter, setEquipoFilter] = useState("all");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [softwareFilter, setSoftwareFilter] = useState("all");

  // Ordenamiento
  const [sortColumn, setSortColumn] = useState<
    keyof SoftwareApprovalRecord | null
  >("equipo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar datos iniciales
  useEffect(() => {
    loadFilters();
  }, []);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadData();
  }, [search, equipoFilter, estadoFilter, softwareFilter]);

  const loadFilters = async () => {
    try {
      const equiposRes = await fetch("/api/equipos");
      const equiposResult = await equiposRes.json();
      const equiposData =
        equiposRes.ok && Array.isArray(equiposResult) ? equiposResult : [];
      setEquipos(equiposData);
    } catch (error) {
      console.error("Error loading equipos:", error);
      setEquipos([]);
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
      });

      const response = await fetch(`/api/software-approval?${params}`);
      const result = await response.json();

      const data = response.ok && Array.isArray(result) ? result : [];
      setData(data);

      // Actualizar lista de software desde los datos cargados
      const uniqueSoftware = [
        ...new Set(data.map((item: SoftwareApprovalRecord) => item.software)),
      ];
      setSoftwares(uniqueSoftware.map((sw) => ({ software: sw as string })));
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
  };

  // Ordenar datos
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aVal = a[sortColumn] || "";
    const bVal = b[sortColumn] || "";

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
  }, [search, equipoFilter, estadoFilter, softwareFilter]);

  // Calcular estadísticas
  const approvedCount = data.filter((item) => item.aprobado).length;
  const unapprovedCount = data.length - approvedCount;

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
            <div className="flex gap-4 justify-center">
              <Link
                href="/inventario"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <i className="fas fa-home"></i> Inventario General
              </Link>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-black">
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
              <div>
                Mostrando {startIndex + 1} a{" "}
                {Math.min(endIndex, sortedData.length)} de {sortedData.length}{" "}
                registros
                {sortedData.length !== data.length &&
                  ` (filtrados de ${data.length} totales)`}
              </div>
              <div className="flex items-center space-x-2">
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
