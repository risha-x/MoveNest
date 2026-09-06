import { Box, ChevronRight, Tag, X } from "lucide-react";

export function QuickAddModal({
  onClose,
  onAddItem,
  onAddBox,
}: {
  onClose: () => void;
  onAddItem: () => void;
  onAddBox: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal quick-add-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose}><X size={19} /></button>
        <p className="eyebrow">QUICK ADD</p>
        <h2>What are we packing?</h2>
        <p className="muted">Start with a box or place a single item inside one.</p>
        <div className="quick-add-options">
          <button onClick={onAddItem}><span className="modal-icon"><Tag size={22} /></span><span><strong>Add an item</strong><small>Put something in a box</small></span><ChevronRight size={17} /></button>
          <button onClick={onAddBox}><span className="modal-icon box-option"><Box size={22} /></span><span><strong>Add a box</strong><small>Create a new destination</small></span><ChevronRight size={17} /></button>
        </div>
      </div>
    </div>
  );
}
