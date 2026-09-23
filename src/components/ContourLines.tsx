import React from 'react';

/**
 * Static contour lines for Hero background only.
 * Loose overlapping continuous curved lines in thin white strokes (3-4 parallel hairlines per stroke, like contour lines).
 * Rendered at 6% opacity, abstract, no text, static, no animation.
 */
export const ContourLines: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-[0.06]"
    >
      <svg
        viewBox="0 0 1440 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
      >
        {/* Stroke Bundle 1 */}
        <path
          d="M-80 120 C 240 60, 520 280, 840 180 C 1120 90, 1340 320, 1560 220"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-80 132 C 240 72, 520 292, 840 192 C 1120 102, 1340 332, 1560 232"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-80 144 C 240 84, 520 304, 840 204 C 1120 114, 1340 344, 1560 244"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-80 156 C 240 96, 520 316, 840 216 C 1120 126, 1340 356, 1560 256"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />

        {/* Stroke Bundle 2 */}
        <path
          d="M-100 360 C 180 440, 480 160, 820 340 C 1100 480, 1320 200, 1580 320"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-100 372 C 180 452, 480 172, 820 352 C 1100 492, 1320 212, 1580 332"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-100 384 C 180 464, 480 184, 820 364 C 1100 504, 1320 224, 1580 344"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-100 396 C 180 476, 480 196, 820 376 C 1100 516, 1320 236, 1580 356"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />

        {/* Stroke Bundle 3 */}
        <path
          d="M-60 520 C 300 320, 640 560, 980 420 C 1220 320, 1420 540, 1540 480"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-60 532 C 300 332, 640 572, 980 432 C 1220 332, 1420 552, 1540 492"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
        <path
          d="M-60 544 C 300 344, 640 584, 980 444 C 1220 344, 1420 564, 1540 504"
          stroke="#FFFFFF"
          strokeWidth="0.85"
        />
      </svg>
    </div>
  );
};
