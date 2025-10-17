"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SoftwareRecord, LocationData, SoftwareData } from "@/lib/types";
import SoftwareTable from "@/components/SoftwareTable";
import SearchBox from "@/components/SearchBox";
import FilterSelect from "@/components/FilterSelect";
import StatsCard from "@/components/StatsCard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function InventoryPage() {
  const [data, setData] = useState<SoftwareRecord[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [softwares, setSoftwares] = useState<SoftwareData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [softwareFilter, setSoftwareFilter] = useState("all");

  // Ordenamiento
  const [sortColumn, setSortColumn] = useState<keyof SoftwareRecord | null>(
    "computadora"
  );
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
  }, [search, locationFilter, softwareFilter]);

  const loadFilters = async () => {
    try {
      const [locationsRes, softwaresRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/softwares"),
      ]);

      const locationsResult = await locationsRes.json();
      const softwaresResult = await softwaresRes.json();

      const locationsData =
        locationsRes.ok && Array.isArray(locationsResult)
          ? locationsResult
          : [];
      const softwaresData =
        softwaresRes.ok && Array.isArray(softwaresResult)
          ? softwaresResult
          : [];

      setLocations(locationsData);
      setSoftwares(softwaresData.slice(0, 100));
    } catch (error) {
      console.error("Error loading filters:", error);
      setLocations([]);
      setSoftwares([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        location: locationFilter,
        software: softwareFilter,
      });

      const response = await fetch(`/api/software?${params}`);

      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Unexpected response format:", result);
          setData([]);
        }
      } else {
        console.error("API error:", response.status);
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof SoftwareRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleReset = () => {
    setSearch("");
    setLocationFilter("all");
    setSoftwareFilter("all");
  };

  // Ordenar datos
  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const aVal = a[sortColumn] || "";
        const bVal = b[sortColumn] || "";

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, locationFilter, softwareFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden my-5">
          {/* Header */}
          <header className="text-center p-8 border-b-2 border-gray-100">
            <h1 className="text-4xl font-light text-gray-800 mb-3">
              <i className="fas fa-desktop text-blue-500 mr-4"></i>
              GLPI Software Inventory
            </h1>
            <div className="flex gap-4 justify-center">
              <Link
                href="/aprobado"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <i className="fas fa-shield-check"></i> Software Aprobado
              </Link>
            </div>
          </header>

          {/* Controls */}
          <div className="bg-gray-50 p-6">
            {/* Search */}
            <div className="mb-6 text-black">
              <SearchBox
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Buscar por computadora, ubicación, software o versión..."
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-black">
              <FilterSelect
                id="locationFilter"
                label="Ubicación"
                icon="fas fa-map-marker-alt"
                value={locationFilter}
                onChange={setLocationFilter}
                options={[
                  { value: "all", label: "Todas las ubicaciones" },
                  ...locations.map((loc) => ({
                    value: loc.ubicacion,
                    label: loc.ubicacion,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
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
              <SoftwareTable
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
        <p>&copy; 2025 GLPI Software Inventory - Cremona Inoxidable SA</p>
      </footer>
    </div>
  );
}
