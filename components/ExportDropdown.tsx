"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface ExportDropdownProps<RowType> {
  rows: RowType[];
  allRows?: RowType[];
  columns: { key: keyof RowType; label: string }[];
}

export default function ExportDropdown<RowType>({
  rows,
  allRows,
  columns,
}: ExportDropdownProps<RowType>) {
  const [open, setOpen] = useState(false);
  const [selectedCols, setSelectedCols] = useState<string[]>(
    columns.map((c) => String(c.key)),
  );
  const [exportScope, setExportScope] = useState<"page" | "all">("page");

  const toggleCol = (key: string) => {
    setSelectedCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleExport = () => {
    const dataSource = exportScope === "all" && allRows ? allRows : rows;

    const exportData = (dataSource || []).map((r: RowType) => {
      const out: Record<string, string> = {};
      for (const col of columns) {
        const key = String(col.key);
        if (selectedCols.includes(key)) {
          const rawVal = r[col.key];
          const val =
            typeof rawVal === "boolean"
              ? rawVal
                ? "Aprobado"
                : "No Aprobado"
              : rawVal;
          out[col.label] = val?.toString() ?? "";
        }
      }
      return out;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    if (ws && ws["!ref"]) {
      ws["!autofilter"] = { ref: ws["!ref"] };
    }

    const firstRow = exportData[0] || {};
    const keys = Object.keys(firstRow);
    ws["!cols"] = keys.map((k) => ({
      wch: Math.min(Math.max(k.length + 5, 10), 40),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const filename = `soft-aprobado-${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);

    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1 text-sm bg-background2 border border-background4 rounded-md text-texto hover:bg-background3 flex items-center space-x-2 transition-colors"
      >
        <i className="fas fa-file-excel text-green mr-2"></i>
        <span>Exportar</span>
        <i className="fas fa-chevron-down ml-2 text-texto2"></i>
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-background2 border border-background4 z-50 p-3">
          <div className="mb-2 text-sm font-medium text-texto">
            Columnas a exportar
          </div>
          <div className="max-h-32 overflow-auto mb-3">
            {columns.map((col) => {
              const key = String(col.key);
              return (
                <label
                  key={key}
                  className="flex items-center space-x-2 text-sm mb-1 text-texto"
                >
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(key)}
                    onChange={() => toggleCol(key)}
                  />
                  <span>{col.label}</span>
                </label>
              );
            })}
          </div>

          <div className="mb-3">
            <div className="text-sm font-medium mb-1 text-texto">Filas</div>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === "page"}
                onChange={() => setExportScope("page")}
              />
              <span className="text-sm text-texto">
                Filas mostradas (página actual)
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === "all"}
                onChange={() => setExportScope("all")}
                disabled={!allRows}
              />
              <span className="text-sm text-texto">
                Todas las filas filtradas
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 text-sm bg-background3 text-texto rounded-md hover:bg-background4 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm bg-green/20 text-green border border-green/40 rounded-md hover:bg-green/30 transition-colors"
            >
              Exportar a Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
