"use client";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
}: SearchBoxProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          title="Limpiar búsqueda"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}
