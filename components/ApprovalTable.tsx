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
      return <i className="fas fa-sort text-texto2 ml-2"></i>;
    }
    return sortDirection === "asc" ? (
      <i className="fas fa-sort-up text-blue ml-2"></i>
    ) : (
      <i className="fas fa-sort-down text-blue ml-2"></i>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <i className="fas fa-search text-5xl text-texto2 mb-4"></i>
        <h3 className="text-xl font-semibold text-texto mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-texto2">
          Intenta ajustar los filtros o el término de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-background4">
        <table className="min-w-full divide-y divide-background4">
          <thead className="bg-background3">
            <tr>
              <th
                onClick={() => handleSort("equipo")}
                className="px-6 py-3 text-left text-xs font-medium text-texto2 uppercase tracking-wider cursor-pointer hover:bg-background4"
                style={{ width: "10%" }}
              >
                <div className="flex items-center">
                  <i className="fas fa-desktop mr-2"></i>
                  Equipo
                  {getSortIcon("equipo")}
                </div>
              </th>
              <th
                onClick={() => handleSort("ubicacion")}
                className="px-6 py-3 text-left text-xs font-medium text-texto2 uppercase tracking-wider cursor-pointer hover:bg-background4"
                style={{ width: "15%" }}
              >
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Ubicación
                  {getSortIcon("ubicacion")}
                </div>
              </th>
              <th
                onClick={() => handleSort("software")}
                className="px-6 py-3 text-left text-xs font-medium text-texto2 uppercase tracking-wider cursor-pointer hover:bg-background4"
                style={{ width: "35%" }}
              >
                <div className="flex items-center">
                  <i className="fas fa-puzzle-piece mr-2"></i>
                  Software
                  {getSortIcon("software")}
                </div>
              </th>
              <th
                onClick={() => handleSort("version")}
                className="px-6 py-3 text-left text-xs font-medium text-texto2 uppercase tracking-wider cursor-pointer hover:bg-background4"
                style={{ width: "20%" }}
              >
                <div className="flex items-center">
                  <i className="fas fa-tag mr-2"></i>
                  Versión
                  {getSortIcon("version")}
                </div>
              </th>
              <th
                onClick={() => handleSort("aprobado")}
                className="px-6 py-3 text-left text-xs font-medium text-texto2 uppercase tracking-wider cursor-pointer hover:bg-background4"
                style={{ width: "20%" }}
              >
                <div className="flex items-center">
                  <i className="fas fa-shield-check mr-2"></i>
                  Estado
                  {getSortIcon("aprobado")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-background2 divide-y divide-background4">
            {data.map((item, index) => (
              <tr
                key={index}
                className={`transition-colors ${
                  item.aprobado ? "hover:bg-green/10" : "hover:bg-red2/10"
                }`}
              >
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-texto"
                  style={{ width: "15%" }}
                >
                  {item.equipo || "N/A"}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-texto2"
                  style={{ width: "10%" }}
                >
                  {item.ubicacion || "Sin ubicación"}
                </td>
                <td
                  className="px-6 py-4 text-sm text-texto"
                  style={{ width: "20%" }}
                >
                  {item.software || "N/A"}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-texto2"
                  style={{ width: "20%" }}
                >
                  {item.version || "N/A"}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ width: "20%" }}
                >
                  {item.aprobado ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green/20 text-green border border-green/40">
                      <i className="fas fa-check-circle mr-2"></i>
                      Aprobado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red2/20 text-red2 border border-red2/40">
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
    </div>
  );
}
