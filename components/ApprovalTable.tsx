"use client";

import { SoftwareApprovalRecord } from "@/lib/types";

interface ApprovalTableProps {
  data: SoftwareApprovalRecord[];
  onSort?: (column: keyof SoftwareApprovalRecord) => void;
  sortColumn?: keyof SoftwareApprovalRecord | null;
  sortDirection?: "asc" | "desc";
}

export default function ApprovalTable({
  data,
  onSort,
  sortColumn,
  sortDirection,
}: ApprovalTableProps) {
  const handleSort = (column: keyof SoftwareApprovalRecord) => {
    if (onSort) {
      onSort(column);
    }
  };

  const getSortIcon = (column: keyof SoftwareApprovalRecord) => {
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
          Intenta ajustar los filtros o el término de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => handleSort("equipo")}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center">
                <i className="fas fa-desktop mr-2"></i>
                Equipo
                {getSortIcon("equipo")}
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center">
                <i className="fas fa-shield-check mr-2"></i>
                Estado
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={index}
              className={`transition-colors ${
                item.aprobado ? "hover:bg-green-50" : "hover:bg-red-50"
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.equipo || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {item.software || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.version || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {item.aprobado ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-2"></i>
                    Aprobado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <i className="fas fa-times-circle mr-2"></i>
                    No Aprobado
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
