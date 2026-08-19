interface StatBarProps {
  label: string;
  value: number;
  max: number;
  tone?: "green" | "blue" | "amber" | "pink";
}

export function StatBar({ label, value, max, tone = "green" }: StatBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className="stat-bar">
      <div className="stat-bar-label">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="stat-track">
        <div className={`stat-fill stat-${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
