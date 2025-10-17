"use client";

interface FilterSelectProps {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function FilterSelect({
  id,
  label,
  icon,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        <i className={`${icon} mr-2`}></i>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
