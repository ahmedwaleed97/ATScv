import React, { useState } from "react";
import { ChevronRight, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

function RepeaterItem({ title, children, canUp, canDown, onUp, onDown, onRemove }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rep-item">
      <div className="rep-head">
        <button className="rep-toggle" onClick={() => setOpen((o) => !o)}>
          <ChevronRight size={15} className={`rep-chev ${open ? "open" : ""}`} />
          {title && <span className="rep-title">{title}</span>}
        </button>
        <div className="rep-tools">
          <button className="icon-btn xs" disabled={!canUp} onClick={onUp} aria-label="Move up">
            <ChevronUp size={15} />
          </button>
          <button className="icon-btn xs" disabled={!canDown} onClick={onDown} aria-label="Move down">
            <ChevronDown size={15} />
          </button>
          <button className="icon-btn xs danger" onClick={onRemove} aria-label="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {open && <div className="rep-body">{children}</div>}
    </div>
  );
}

export default function Repeater({ items, onChange, blank, render, addLabel, titleOf }) {
  const add = () => onChange([...items, blank()]);
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const move = (idx, dir) => {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    onChange(copy);
  };

  return (
    <div className="repeater">
      {items.map((item, idx) => (
        <RepeaterItem
          key={item.id}
          title={titleOf ? titleOf(item) : null}
          canUp={idx > 0}
          canDown={idx < items.length - 1}
          onUp={() => move(idx, -1)}
          onDown={() => move(idx, 1)}
          onRemove={() => remove(item.id)}
        >
          {render(item, (patch) => update(item.id, patch))}
        </RepeaterItem>
      ))}
      <button className="btn btn-dashed btn-block" onClick={add}>
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}
