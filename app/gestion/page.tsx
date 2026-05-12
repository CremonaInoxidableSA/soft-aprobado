"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AutorizadoRecord {
  id: number;
  software: string;
  area: string | null;
  puesto: string | null;
  computadora: string | null;
  created_at: string;
}

interface Grouped {
  general: AutorizadoRecord[];
  areas: Map<
    string,
    { direct: AutorizadoRecord[]; puestos: Map<string, AutorizadoRecord[]> }
  >;
  computadoras: Map<string, AutorizadoRecord[]>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupRecords(records: AutorizadoRecord[]): Grouped {
  const general: AutorizadoRecord[] = [];
  const areas = new Map<
    string,
    { direct: AutorizadoRecord[]; puestos: Map<string, AutorizadoRecord[]> }
  >();
  const computadoras = new Map<string, AutorizadoRecord[]>();

  for (const r of records) {
    if (r.computadora) {
      if (!computadoras.has(r.computadora)) computadoras.set(r.computadora, []);
      computadoras.get(r.computadora)!.push(r);
    } else if (!r.area) {
      general.push(r);
    } else {
      if (!areas.has(r.area))
        areas.set(r.area, { direct: [], puestos: new Map() });
      const g = areas.get(r.area)!;
      if (!r.puesto) {
        g.direct.push(r);
      } else {
        if (!g.puestos.has(r.puesto)) g.puestos.set(r.puesto, []);
        g.puestos.get(r.puesto)!.push(r);
      }
    }
  }
  return { general, areas, computadoras };
}

// ─── Sub-componente: lista de items ──────────────────────────────────────────

function ItemList({
  items,
  confirmDelete,
  onConfirmDelete,
  onDelete,
}: {
  items: AutorizadoRecord[];
  confirmDelete: number | null;
  onConfirmDelete: (id: number | null) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded bg-background3 hover:bg-background4 transition-colors group"
        >
          <span className="text-sm text-texto truncate">{item.software}</span>

          {confirmDelete === item.id ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-texto2">¿Eliminar?</span>
              <button
                onClick={() => onConfirmDelete(null)}
                className="text-xs px-2 py-0.5 rounded border border-background5 text-texto2 hover:text-texto transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-xs px-2 py-0.5 rounded bg-red2/20 text-red2 border border-red2/40 hover:bg-red2/30 transition-colors"
              >
                Confirmar
              </button>
            </div>
          ) : (
            <button
              onClick={() => onConfirmDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-texto2 hover:text-red2 px-1 shrink-0"
              title="Eliminar"
            >
              <i className="fas fa-times text-xs" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function GestionPage() {
  const [records, setRecords] = useState<AutorizadoRecord[]>([]);
  const [softwareList, setSoftwareList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Formulario
  const [nivel, setNivel] = useState<"general" | "area" | "puesto" | "pc">(
    "general",
  );
  const [fSoftware, setFSoftware] = useState("");
  const [fArea, setFArea] = useState("");
  const [fPuesto, setFPuesto] = useState("");
  const [fComputadora, setFComputadora] = useState("");
  const [equipoList, setEquipoList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // UI
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Backup (export / import)
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const loadRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/autorizado");
      const json = await res.json();
      if (res.ok) {
        setRecords(json.data ?? []);
      } else {
        setLoadError(json.error ?? "Error al cargar registros.");
      }
    } catch (e) {
      setLoadError(String(e));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        loadRecords(),
        fetch("/api/softwares")
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d))
              setSoftwareList(d.map((x: { software: string }) => x.software));
          })
          .catch(() => {}),
        fetch("/api/equipos")
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d))
              setEquipoList(d.map((x: { equipo: string }) => x.equipo));
          })
          .catch(() => {}),
      ]);
      setLoading(false);
    })();
  }, [loadRecords]);

  // ── UI helpers ──────────────────────────────────────────────────────────────

  const toggleSection = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  const existingAreas = Array.from(
    new Set(records.filter((r) => r.area).map((r) => r.area!)),
  ).sort();

  const existingPuestos = fArea
    ? Array.from(
        new Set(
          records
            .filter((r) => r.area === fArea && r.puesto)
            .map((r) => r.puesto!),
        ),
      ).sort()
    : [];

  // ── Agregar ─────────────────────────────────────────────────────────────────

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    const body = {
      software: fSoftware.trim(),
      area:
        nivel === "area" || nivel === "puesto" ? fArea.trim() || null : null,
      puesto: nivel === "puesto" ? fPuesto.trim() || null : null,
      computadora: nivel === "pc" ? fComputadora.trim() || null : null,
    };

    if (!body.software)
      return setFormMsg({ type: "err", text: "El software es requerido." });
    if ((nivel === "area" || nivel === "puesto") && !body.area)
      return setFormMsg({ type: "err", text: "El área es requerida." });
    if (nivel === "puesto" && !body.puesto)
      return setFormMsg({ type: "err", text: "El puesto es requerido." });
    if (nivel === "pc" && !body.computadora)
      return setFormMsg({
        type: "err",
        text: "El nombre de la PC es requerido.",
      });

    setSubmitting(true);
    try {
      const res = await fetch("/api/autorizado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setFormMsg({ type: "ok", text: `"${body.software}" agregado.` });
        setFSoftware("");
        setFArea("");
        setFPuesto("");
        setFComputadora("");
        await loadRecords();
      } else {
        setFormMsg({ type: "err", text: json.error ?? "Error al agregar." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Eliminar ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    await fetch(`/api/autorizado/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    await loadRecords();
  };

  // ── Exportar backup ─────────────────────────────────────────────────────────

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/autorizado/export");
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `software-autorizado-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ── Importar backup ─────────────────────────────────────────────────────────

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setConfirmImport(true);
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!pendingImportFile) return;
    setConfirmImport(false);
    setImporting(true);
    setImportMsg(null);
    try {
      const text = await pendingImportFile.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/autorizado/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const result = await res.json();
      if (res.ok) {
        setImportMsg({
          type: "ok",
          text: `Importación exitosa: ${result.imported} registros restaurados.`,
        });
        await loadRecords();
      } else {
        setImportMsg({
          type: "err",
          text: result.error ?? "Error al importar.",
        });
      }
    } catch (e) {
      setImportMsg({
        type: "err",
        text: `Error al leer el archivo: ${String(e)}`,
      });
    } finally {
      setImporting(false);
      setPendingImportFile(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading)
    return (
      <main className="flex-1 bg-background flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );

  if (loadError)
    return (
      <main className="flex-1 bg-background flex items-center justify-center">
        <p className="text-red2 text-sm">{loadError}</p>
      </main>
    );

  const { general, areas, computadoras } = groupRecords(records);
  const sortedAreas = Array.from(areas.keys()).sort();
  const sortedPCs = Array.from(computadoras.keys()).sort();

  return (
    <main className="flex-1 bg-background text-texto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-texto">
            Gestión de Software Autorizado
          </h1>
          <p className="text-texto2 text-sm mt-1">
            {records.length} registros en la base de datos
          </p>
        </div>

        {/* ── Backup ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded border border-background4 bg-background2 text-texto2 hover:text-texto hover:bg-background3 text-sm transition-colors disabled:opacity-50"
          >
            <i className="fas fa-download text-xs" />
            {exporting ? "Exportando..." : "Exportar backup"}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 rounded border border-background4 bg-background2 text-texto2 hover:text-texto hover:bg-background3 text-sm transition-colors disabled:opacity-50"
          >
            <i className="fas fa-upload text-xs" />
            {importing ? "Importando..." : "Importar backup"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFileSelect}
          />

          {importMsg && (
            <p
              className={`text-sm ${
                importMsg.type === "ok" ? "text-green" : "text-red2"
              }`}
            >
              <i
                className={`fas ${
                  importMsg.type === "ok"
                    ? "fa-check-circle"
                    : "fa-exclamation-circle"
                } mr-1`}
              />
              {importMsg.text}
            </p>
          )}
        </div>

        {/* ── Formulario de agregar ─────────────────────────────────────── */}
        <div className="bg-background2 border border-background4 rounded-lg p-5 mb-6">
          <h2 className="font-semibold text-texto mb-4">
            <i className="fas fa-plus-circle text-green mr-2" />
            Agregar nuevo registro
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            {/* Nivel */}
            <div>
              <p className="text-xs text-texto2 mb-2">Nivel de aplicación</p>
              <div className="flex gap-2 flex-wrap">
                {(["general", "area", "puesto", "pc"] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setNivel(n);
                      setFormMsg(null);
                    }}
                    className={`px-4 py-1.5 rounded text-sm border transition-colors ${
                      nivel === n
                        ? "bg-blue/20 text-blue border-blue/40"
                        : "bg-background3 text-texto2 border-background4 hover:text-texto"
                    }`}
                  >
                    {n === "general"
                      ? "General"
                      : n === "area"
                        ? "Por Departamento"
                        : n === "puesto"
                          ? "Por Puesto"
                          : "Por PC"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-texto2 mt-1.5">
                {nivel === "general" &&
                  "El software aplica a todos los equipos y ubicaciones."}
                {nivel === "area" &&
                  "El software aplica a todos los equipos de un departamento/sector."}
                {nivel === "puesto" &&
                  "El software aplica a un puesto específico dentro de un departamento."}
                {nivel === "pc" &&
                  "El software aplica a una PC específica por nombre de equipo."}
              </p>
            </div>

            {/* Campos */}
            <div
              className={`grid gap-3 ${
                nivel === "puesto"
                  ? "grid-cols-1 sm:grid-cols-3"
                  : nivel === "area"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              {/* Software */}
              <div>
                <label className="text-xs text-texto2 block mb-1">
                  Software
                </label>
                <input
                  list="sw-datalist"
                  value={fSoftware}
                  onChange={(e) => setFSoftware(e.target.value)}
                  placeholder="Nombre del software..."
                  className="w-full px-3 py-2 rounded border border-background4 bg-background text-texto text-sm focus:outline-none focus:ring-2 focus:ring-blue/40"
                />
                <datalist id="sw-datalist">
                  {softwareList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* PC */}
              {nivel === "pc" && (
                <div>
                  <label className="text-xs text-texto2 block mb-1">
                    Nombre de PC
                  </label>
                  <input
                    list="pc-datalist"
                    value={fComputadora}
                    onChange={(e) => setFComputadora(e.target.value)}
                    placeholder="Nombre exacto del equipo..."
                    className="w-full px-3 py-2 rounded border border-background4 bg-background text-texto text-sm focus:outline-none focus:ring-2 focus:ring-blue/40"
                  />
                  <datalist id="pc-datalist">
                    {equipoList.map((e) => (
                      <option key={e} value={e} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Área */}
              {(nivel === "area" || nivel === "puesto") && (
                <div>
                  <label className="text-xs text-texto2 block mb-1">
                    Departamento
                  </label>
                  <input
                    list="area-datalist"
                    value={fArea}
                    onChange={(e) => setFArea(e.target.value)}
                    placeholder="Nombre del departamento..."
                    className="w-full px-3 py-2 rounded border border-background4 bg-background text-texto text-sm focus:outline-none focus:ring-2 focus:ring-blue/40"
                  />
                  <datalist id="area-datalist">
                    {existingAreas.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Puesto */}
              {nivel === "puesto" && (
                <div>
                  <label className="text-xs text-texto2 block mb-1">
                    Puesto
                  </label>
                  <input
                    list="puesto-datalist"
                    value={fPuesto}
                    onChange={(e) => setFPuesto(e.target.value)}
                    placeholder="Nombre del puesto..."
                    className="w-full px-3 py-2 rounded border border-background4 bg-background text-texto text-sm focus:outline-none focus:ring-2 focus:ring-blue/40"
                  />
                  <datalist id="puesto-datalist">
                    {existingPuestos.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            {/* Mensaje + botón */}
            <div className="flex items-center gap-4">
              {formMsg && (
                <p
                  className={`text-sm ${
                    formMsg.type === "ok" ? "text-green" : "text-red2"
                  }`}
                >
                  <i
                    className={`fas ${
                      formMsg.type === "ok"
                        ? "fa-check-circle"
                        : "fa-exclamation-circle"
                    } mr-1`}
                  />
                  {formMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto px-5 py-2 rounded bg-green/20 text-green border border-green/40 text-sm hover:bg-green/30 transition-colors disabled:opacity-50 shrink-0"
              >
                {submitting ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Árbol de registros ────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* General */}
          {general.length > 0 && (
            <div className="bg-background2 border border-background4 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("__general__")}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-background3 transition-colors"
              >
                <i
                  className={`fas fa-chevron-${
                    collapsed.has("__general__") ? "right" : "down"
                  } text-texto2 text-xs w-3`}
                />
                <i className="fas fa-globe text-blue text-sm" />
                <span className="font-semibold text-texto">General</span>
                <span className="text-xs text-texto2 ml-1">
                  — aplica a todos
                </span>
                <span className="ml-auto text-xs text-texto2 bg-background3 px-2 py-0.5 rounded-full">
                  {general.length}
                </span>
              </button>
              {!collapsed.has("__general__") && (
                <div className="px-5 pb-4 pt-1">
                  <ItemList
                    items={general}
                    confirmDelete={confirmDelete}
                    onConfirmDelete={setConfirmDelete}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
          )}

          {/* Por área */}
          {sortedAreas.map((areaName) => {
            const g = areas.get(areaName)!;
            const sortedPuestos = Array.from(g.puestos.keys()).sort();
            const areaKey = `area::${areaName}`;
            const total =
              g.direct.length +
              Array.from(g.puestos.values()).reduce((s, v) => s + v.length, 0);

            return (
              <div
                key={areaName}
                className="bg-background2 border border-background4 rounded-lg overflow-hidden"
              >
                {/* Cabecera de área */}
                <button
                  onClick={() => toggleSection(areaKey)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-background3 transition-colors"
                >
                  <i
                    className={`fas fa-chevron-${
                      collapsed.has(areaKey) ? "right" : "down"
                    } text-texto2 text-xs w-3`}
                  />
                  <i className="fas fa-building text-orange text-sm" />
                  <span className="font-semibold text-texto">{areaName}</span>
                  <span className="ml-auto text-xs text-texto2 bg-background3 px-2 py-0.5 rounded-full">
                    {total}
                  </span>
                </button>

                {!collapsed.has(areaKey) && (
                  <div className="px-5 pb-4 pt-1 space-y-3">
                    {/* Software directo del área */}
                    {g.direct.length > 0 && (
                      <ItemList
                        items={g.direct}
                        confirmDelete={confirmDelete}
                        onConfirmDelete={setConfirmDelete}
                        onDelete={handleDelete}
                      />
                    )}

                    {/* Puestos */}
                    {sortedPuestos.map((puestoName) => {
                      const pKey = `puesto::${areaName}::${puestoName}`;
                      const pItems = g.puestos.get(puestoName)!;
                      return (
                        <div
                          key={puestoName}
                          className="ml-4 border-l-2 border-background4 pl-4"
                        >
                          <button
                            onClick={() => toggleSection(pKey)}
                            className="flex items-center gap-2 text-sm text-texto2 hover:text-texto mb-2 transition-colors"
                          >
                            <i
                              className={`fas fa-chevron-${
                                collapsed.has(pKey) ? "right" : "down"
                              } text-xs w-3`}
                            />
                            <i className="fas fa-user text-xs text-blue/70" />
                            <span>{puestoName}</span>
                            <span className="text-xs opacity-60">
                              ({pItems.length})
                            </span>
                          </button>
                          {!collapsed.has(pKey) && (
                            <ItemList
                              items={pItems}
                              confirmDelete={confirmDelete}
                              onConfirmDelete={setConfirmDelete}
                              onDelete={handleDelete}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Por PC */}
          {sortedPCs.map((pcName) => {
            const pcKey = `pc::${pcName}`;
            const pcItems = computadoras.get(pcName)!;
            return (
              <div
                key={pcName}
                className="bg-background2 border border-background4 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(pcKey)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-background3 transition-colors"
                >
                  <i
                    className={`fas fa-chevron-${
                      collapsed.has(pcKey) ? "right" : "down"
                    } text-texto2 text-xs w-3`}
                  />
                  <i className="fas fa-desktop text-green text-sm" />
                  <span className="font-semibold text-texto">{pcName}</span>
                  <span className="text-xs text-texto2 ml-1">— por PC</span>
                  <span className="ml-auto text-xs text-texto2 bg-background3 px-2 py-0.5 rounded-full">
                    {pcItems.length}
                  </span>
                </button>
                {!collapsed.has(pcKey) && (
                  <div className="px-5 pb-4 pt-1">
                    <ItemList
                      items={pcItems}
                      confirmDelete={confirmDelete}
                      onConfirmDelete={setConfirmDelete}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {records.length === 0 && (
            <div className="text-center text-texto2 py-16">
              <i className="fas fa-inbox text-4xl mb-3 block opacity-30" />
              <p className="text-sm">No hay registros.</p>
              <p className="text-xs mt-1 opacity-60">
                Agrega uno manualmente o migrá el Excel desde{" "}
                <code className="bg-background3 px-1 rounded">
                  POST /api/autorizado/migrate
                </code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de confirmación de importación ──────────────────────── */}
      {confirmImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background2 border border-background4 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-texto mb-2 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-orange" />
              Confirmar importación
            </h3>
            <p className="text-sm text-texto2 mb-4">
              Esta acción{" "}
              <strong className="text-texto">
                reemplazará todos los registros actuales
              </strong>{" "}
              con los del archivo{" "}
              <code className="bg-background3 px-1 rounded text-xs">
                {pendingImportFile?.name}
              </code>
              . Esta operación no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmImport(false);
                  setPendingImportFile(null);
                }}
                className="px-4 py-2 rounded border border-background4 text-texto2 hover:text-texto text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportConfirm}
                className="px-4 py-2 rounded bg-red2/20 text-red2 border border-red2/40 hover:bg-red2/30 text-sm transition-colors"
              >
                Importar y reemplazar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
