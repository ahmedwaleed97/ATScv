import React from "react";

export default function FeedbackBlock({ kind, icon, title, items }) {
  return (
    <div className={`fb fb-${kind}`}>
      <h4>{icon} {title}</h4>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}
