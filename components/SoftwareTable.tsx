"use client";

import { useState, useEffect } from "react";
import { SoftwareRecord } from "@/lib/types";

interface SoftwareTableProps {
  data: SoftwareRecord[];
  onSort?: (column: keyof SoftwareRecord) => void;
  sortColumn?: keyof SoftwareRecord | null;
  sortDirection?: "asc" | "desc";
}

export default function SoftwareTable({
  data,
  onSort,
  sortColumn,
  sortDirection,
}: SoftwareTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleSort = (column: keyof SoftwareRecord) => {
    if (onSort) {
      onSort(column);
    }
  };

  const getSortIcon = (column: keyof SoftwareRecord) => {
    if (sortColumn !== column) {
      return <i className="fas fa-sort text-gray-400 ml-2"></i>;
    }
    return sortDirection === "asc" ? (
      <i className="fas fa-sort-up text-blue-600 ml-2"></i>
    ) : (
      <i className="fas fa-sort-down text-blue-600 ml-2"></i>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <i className="fas fa-search text-5xl text-gray-400 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-gray-500">
          Intenta ajustar los filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <label
            htmlFor="rowsPerPage"
            className="text-sm font-medium text-gray-700"
          >
            Filas por página:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="ml-2 border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("computadora")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-desktop mr-2"></i>
                  Computadora
                  {getSortIcon("computadora")}
                </div>
              </th>
              <th
                onClick={() => handleSort("ubicacion")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Ubicación
                  {getSortIcon("ubicacion")}
                </div>
              </th>
              <th
                onClick={() => handleSort("software")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-puzzle-piece mr-2"></i>
                  Software
                  {getSortIcon("software")}
                </div>
              </th>
              <th
                onClick={() => handleSort("version")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-tag mr-2"></i>
                  Versión
                  {getSortIcon("version")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.computadora || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.ubicacion || "Sin ubicación"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.software || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.version || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de{" "}
            {data.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
