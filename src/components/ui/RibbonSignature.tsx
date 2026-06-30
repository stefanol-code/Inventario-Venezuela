"use client";

import { motion } from "framer-motion";

/**
 * Cinta trazada a mano que repite el gesto del logo (las líneas de la mano).
 * Tres trazos -oro, azul, rojo- se dibujan en secuencia al cargar la página.
 */
export default function RibbonSignature({ className }: { className?: string }) {
  const path =
    "M -40 120 C 180 20, 340 220, 560 90 S 880 -20, 1080 110";

  const strokes = [
    { color: "#F2B705", delay: 0, y: 0 },
    { color: "#1A3FA0", delay: 0.18, y: 26 },
    { color: "#D62839", delay: 0.36, y: 52 },
  ];

  return (
    <svg
      viewBox="0 0 1040 260"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {strokes.map((s, i) => (
        <motion.path
          key={i}
          d={path}
          transform={`translate(0 ${s.y})`}
          stroke={s.color}
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.8, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
