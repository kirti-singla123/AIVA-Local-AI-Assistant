import React from "react";
import "./CallOrb.css";

const BAR_COUNT = 40; // number of bars across the full screen

export default function CallOrb({ status }) {
  return (
    <div className={`call-orb-wrapper ${status}`}>
      <div className="wave-row">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 10) * 0.1}s` }}></span>
        ))}
      </div>

      <div className="call-orb-core"></div>
    </div>
  );
}