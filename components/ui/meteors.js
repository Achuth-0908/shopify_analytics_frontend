"use client";
import React from "react";

// Utility for classnames (optional, you can remove if not needed)
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const Meteors = ({ number = 20, className }) => {
  const meteors = new Array(number).fill(true);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {meteors.map((el, idx) => {
        const meteorCount = number;
        // Evenly distribute meteors across container width
        const position = idx * (800 / meteorCount) - 400;

        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[215deg] rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
              className
            )}
            style={{
              top: "-40px",
              left: position + "px",
              animationDelay: Math.random() * 5 + "s",
              animationDuration: Math.floor(Math.random() * (10 - 5) + 5) + "s",
            }}
          >
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-[1px] w-[50px] -translate-y-1/2 -translate-x-1/2 rotate-90 bg-gradient-to-r from-slate-400 to-transparent" />
          </span>
        );
      })}
    </div>
  );
};

export default Meteors;
