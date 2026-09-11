import React from "react";
import "./PlanetOrb.css";

export default function PlanetOrb() {
  return (
    <div className="planet-scene">
      <div className="planet-wrapper">
        <div className="planet-core"></div>
        <div className="orbit orbit1"><div className="orbit-dot dot1"></div></div>
        <div className="orbit orbit2"><div className="orbit-dot dot2"></div></div>
        <div className="orbit orbit3"><div className="orbit-dot dot3"></div></div>
      </div>
    </div>
  );
}