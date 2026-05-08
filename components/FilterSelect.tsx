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
      <label htmlFor={id} className="block text-sm font-medium text-texto mb-2">
        <i className={`${icon} mr-2`}></i>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-background4 rounded-lg bg-background2 text-texto focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
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
