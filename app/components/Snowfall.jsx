"use client";

import { useEffect, useState } from "react";

const FLAKE_COUNT = 48;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function makeFlakes() {
  return Array.from({ length: FLAKE_COUNT }, (_, i) => ({
    id: i,
    left: `${random(0, 100)}%`,
    size: `${random(3, 7)}px`,
    duration: `${random(9, 22)}s`,
    delay: `${random(-20, 0)}s`,
    opacity: random(0.35, 0.9),
    drift: `${random(-40, 40)}px`,
  }));
}

export default function Snowfall() {
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    setFlakes(makeFlakes());
  }, []);

  return (
    <div className="snow-layer" aria-hidden>
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            ["--duration"]: f.duration,
            ["--delay"]: f.delay,
            ["--drift"]: f.drift,
          }}
        />
      ))}
    </div>
  );
}