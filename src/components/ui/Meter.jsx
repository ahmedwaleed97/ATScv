import React from "react";

export default function Meter({ label, value }) {
  return (
    <div className="meter">
      <div className="meter-top"><span>{label}</span><span>{value}%</span></div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}
