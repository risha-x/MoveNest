import { ArrowLeft, Clock3, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Move() {
  const { moveName, setActive, openSearchFilter, progress, packed, totalItems, visibleTasks } = useApp();

  return (
    <section className="view-section">
      <button className="back-link" onClick={() => setActive("home")}><ArrowLeft size={14} /> Return to Home</button>
      <p className="eyebrow">{moveName.toUpperCase()}</p>
      <h1>Your move, in view</h1>
      <div className="move-tabs">
        <button className="active-tab" onClick={() => setActive("move")}>
          Progress
        </button>
        <button onClick={() => setActive("rooms")}>Rooms</button>
        <button onClick={() => openSearchFilter("essential")}>Essentials</button>
        <button onClick={() => openSearchFilter("fragile")}>Fragile</button>
      </div>
      <div className="move-view-grid">
        <div className="big-progress-panel">
          <span className="section-kicker">PACKING</span>
          <div className="circle-progress">
            <strong>{progress}%</strong>
            <span>packed</span>
          </div>
          <p>
            <strong>{packed} of {totalItems} items</strong> have made it into a box.
          </p>
          <div className="progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="timeline-panel">
          <div className="panel-title">
            <Clock3 size={17} /> Next on your list
          </div>
          {visibleTasks.length === 0 ? (
            <p className="muted">
              {totalItems === 0
                ? "Add your first box to get started."
                : "You're all caught up! Everything's packed."}
            </p>
          ) : (
            visibleTasks.map((task, index) => (
              <button className="task-row task-button" key={task.label} onClick={task.action}>
                <span className={index === 0 ? "task-dot current" : "task-dot"} />
                <div>
                  <strong>{task.label}</strong>
                  <small>{task.detail}</small>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="suggestion-banner">
        <Sparkles size={20} />
        <div>
          <strong>Keep the momentum</strong>
          <p>Your next small task gets you closer to a calmer moving day.</p>
        </div>
      </div>
    </section>
  );
}
