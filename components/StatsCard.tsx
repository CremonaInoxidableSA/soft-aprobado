"use client";

interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  color: "blue" | "purple" | "green" | "red";
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  green: "from-green-500 to-emerald-600",
  red: "from-red-500 to-orange-600",
};

export default function StatsCard({
  icon,
  label,
  value,
  color,
}: StatsCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg p-6 shadow-lg`}
    >
      <i className={`${icon} text-3xl mb-3 block`}></i>
      <div className="text-sm opacity-90 mb-1">{label}</div>
      <div className="text-4xl font-bold">{(value ?? 0).toLocaleString()}</div>
    </div>
  );
}
