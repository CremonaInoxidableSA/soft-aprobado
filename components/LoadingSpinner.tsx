"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <i className="fas fa-spinner fa-spin text-5xl text-purple-600 mb-4"></i>
      <span className="text-gray-600 text-lg">Cargando datos...</span>
    </div>
  );
}
