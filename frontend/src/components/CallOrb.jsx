import React from "react";
import "./CallOrb.css";

export default function CallOrb({ status }) {
  return (
    <div className={`call-orb-wrapper ${status}`}>
      {/* Expanding sound waves — visible only while AIVA is speaking */}
      <div className="sound-wave wave-1"></div>
      <div className="sound-wave wave-2"></div>
      <div className="sound-wave wave-3"></div>
      <div className="sound-wave wave-4"></div>

      {/* 3D orbital rings */}
      <div className="voice-orbit voice-orbit-1"></div>
      <div className="voice-orbit voice-orbit-2"></div>
      <div className="voice-orbit voice-orbit-3"></div>

      {/* AIVA planet */}
      <div className="call-orb-core">
        <div className="call-orb-inner"></div>
      </div>
    </div>
  );
}
