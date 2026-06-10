import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function Accordion({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`acc ${open ? "acc-open" : ""}`}>
      <button className="acc-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="acc-title">{icon}{title}</span>
        <ChevronRight size={18} className="acc-chev" />
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}
