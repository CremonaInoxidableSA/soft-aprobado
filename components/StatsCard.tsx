"use client";

interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  color: "blue" | "purple" | "green" | "red";
}

const colorClasses = {
  blue: "bg-blue/20 text-blue border-blue/40",
  purple: "bg-blue/20 text-blue border-blue/40",
  green: "bg-green/20 text-green border-green/40",
  red: "bg-red2/20 text-red2 border-red2/40",
};

export default function StatsCard({
  icon,
  label,
  value,
  color,
}: StatsCardProps) {
  return (
    <div className={`${colorClasses[color]} rounded-lg p-6 border`}>
      <i className={`${icon} text-3xl mb-3 block`}></i>
      <div className="text-sm opacity-80 mb-1">{label}</div>
      <div className="text-4xl font-bold">{(value ?? 0).toLocaleString()}</div>
    </div>
  );
}
