import React, { useState } from "react";
import { X, Plus } from "lucide-react";

export default function TagInput({ tags, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft("");
  };

  return (
    <div>
      <div className="taglist">
        {tags.map((t) => (
          <span className="tag" key={t}>
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              <X size={13} />
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="tag-empty">No skills yet</span>}
      </div>
      <div className="tag-add">
        <input
          className="input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button className="btn btn-ghost btn-sm" onClick={add}><Plus size={15} /></button>
      </div>
    </div>
  );
}
