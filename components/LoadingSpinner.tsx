"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <i className="fas fa-spinner fa-spin text-5xl text-blue mb-4"></i>
      <span className="text-texto2 text-lg">Cargando datos...</span>
    </div>
  );
}
