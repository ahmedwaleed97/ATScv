import React from "react";
import { Check } from "lucide-react";

export default function Logo({ size = "md" }) {
  return (
    <span className={`logo logo-${size}`} aria-label="ATScv">
      <span className="logo-mark">
        <Check size={size === "md" ? 15 : 13} strokeWidth={3.2} />
      </span>
      <span className="logo-word">ATS<span className="logo-cv">cv</span></span>
    </span>
  );
}
