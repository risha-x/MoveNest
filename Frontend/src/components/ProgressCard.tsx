import { WandSparkles } from "lucide-react";

export function ProgressCard({
  progress,
  packed,
  totalItems,
}: {
  progress: number;
  packed: number;
  totalItems: number;
}) {
  return (
    <div className="stat-card progress-card">
      <div className="stat-top">
        <span>Packing progress</span>
        <WandSparkles size={17} />
      </div>
      <div className="progress-row">
        <strong>{progress}%</strong>
        <span>{packed} / {totalItems} items</span>
      </div>
      <div className="progress-track">
        <div style={{ width: `${progress}%` }} />
      </div>
      <p className="stat-note">{Math.max(0, totalItems - packed)} items still need a home</p>
    </div>
  );
}
