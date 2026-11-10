"use client";

import type { CSSProperties } from "react";
import {
  ANIMATION_MOVEMENT_MAX,
  ANIMATION_MOVEMENT_MIN,
  type ThemeId,
} from "./lib/settings";

type DoodlePlacement = {
  tile: number;
  x: string;
  y: string;
  size: string;
  motion: 1 | 2 | 3 | 4 | 5 | 6;
  duration: string;
  delay: string;
};

type DoodleStyle = CSSProperties & {
  "--doodle-sprite": string;
  "--sprite-x": string;
  "--sprite-y": string;
  "--doodle-x"?: string;
  "--doodle-y"?: string;
  "--doodle-size"?: string;
  "--motion-duration"?: string;
  "--motion-delay"?: string;
  "--move-x"?: string;
  "--move-x-neg"?: string;
  "--move-x-half"?: string;
  "--move-x-half-neg"?: string;
  "--move-y"?: string;
  "--move-y-neg"?: string;
  "--move-y-half"?: string;
  "--move-y-half-neg"?: string;
  "--rotate-small"?: string;
  "--rotate-small-neg"?: string;
  "--rotate-medium"?: string;
  "--rotate-medium-neg"?: string;
  "--rotate-large"?: string;
  "--rotate-large-neg"?: string;
  "--scale-small-up"?: string;
  "--scale-small-down"?: string;
  "--scale-medium-up"?: string;
  "--scale-medium-down"?: string;
  "--scale-large-up"?: string;
  "--opacity-soft"?: string;
  "--opacity-medium"?: string;
  "--opacity-low"?: string;
};

const TOP_PLACEMENTS: readonly DoodlePlacement[] = [
  {
    tile: 0,
    x: "3.5%",
    y: "10%",
    size: "clamp(30px, 3.1vw, 48px)",
    motion: 1,
    duration: "7.1s",
    delay: "-3.2s",
  },
  {
    tile: 7,
    x: "11.5%",
    y: "46%",
    size: "clamp(22px, 2.3vw, 35px)",
    motion: 4,
    duration: "8.8s",
    delay: "-8.1s",
  },
  {
    tile: 3,
    x: "19.5%",
    y: "12%",
    size: "clamp(27px, 2.8vw, 43px)",
    motion: 5,
    duration: "6.5s",
    delay: "-5.4s",
  },
  {
    tile: 10,
    x: "27.5%",
    y: "48%",
    size: "clamp(23px, 2.4vw, 37px)",
    motion: 2,
    duration: "8.2s",
    delay: "-10.2s",
  },
  {
    tile: 5,
    x: "35.5%",
    y: "8%",
    size: "clamp(31px, 3.3vw, 50px)",
    motion: 6,
    duration: "9.1s",
    delay: "-7.6s",
  },
  {
    tile: 1,
    x: "43.5%",
    y: "43%",
    size: "clamp(25px, 2.6vw, 40px)",
    motion: 3,
    duration: "7.7s",
    delay: "-4.7s",
  },
  {
    tile: 8,
    x: "52%",
    y: "14%",
    size: "clamp(22px, 2.2vw, 34px)",
    motion: 1,
    duration: "8.5s",
    delay: "-9.5s",
  },
  {
    tile: 4,
    x: "60%",
    y: "47%",
    size: "clamp(29px, 3vw, 46px)",
    motion: 4,
    duration: "7s",
    delay: "-6.2s",
  },
  {
    tile: 11,
    x: "68%",
    y: "7%",
    size: "clamp(24px, 2.5vw, 38px)",
    motion: 2,
    duration: "9.3s",
    delay: "-11.8s",
  },
  {
    tile: 2,
    x: "76%",
    y: "44%",
    size: "clamp(27px, 2.8vw, 43px)",
    motion: 5,
    duration: "7.3s",
    delay: "-3.9s",
  },
  {
    tile: 6,
    x: "84.5%",
    y: "11%",
    size: "clamp(23px, 2.3vw, 36px)",
    motion: 3,
    duration: "8s",
    delay: "-7.1s",
  },
  {
    tile: 9,
    x: "95%",
    y: "46%",
    size: "clamp(31px, 3.3vw, 51px)",
    motion: 6,
    duration: "8.9s",
    delay: "-10.6s",
  },
];

const BOTTOM_PLACEMENTS: readonly DoodlePlacement[] = [
  {
    tile: 6,
    x: "5%",
    y: "42%",
    size: "clamp(28px, 2.9vw, 44px)",
    motion: 3,
    duration: "7.9s",
    delay: "-5.9s",
  },
  {
    tile: 2,
    x: "13.5%",
    y: "7%",
    size: "clamp(22px, 2.3vw, 35px)",
    motion: 6,
    duration: "9.4s",
    delay: "-12.3s",
  },
  {
    tile: 9,
    x: "22%",
    y: "45%",
    size: "clamp(31px, 3.2vw, 49px)",
    motion: 1,
    duration: "6.8s",
    delay: "-7.7s",
  },
  {
    tile: 4,
    x: "30%",
    y: "11%",
    size: "clamp(23px, 2.4vw, 37px)",
    motion: 5,
    duration: "8.9s",
    delay: "-4.4s",
  },
  {
    tile: 11,
    x: "38%",
    y: "40%",
    size: "clamp(27px, 2.8vw, 42px)",
    motion: 2,
    duration: "7.5s",
    delay: "-9.8s",
  },
  {
    tile: 0,
    x: "46%",
    y: "6%",
    size: "clamp(32px, 3.4vw, 52px)",
    motion: 4,
    duration: "9.7s",
    delay: "-6.5s",
  },
  {
    tile: 7,
    x: "54.5%",
    y: "47%",
    size: "clamp(22px, 2.2vw, 34px)",
    motion: 6,
    duration: "8.3s",
    delay: "-11.1s",
  },
  {
    tile: 3,
    x: "62.5%",
    y: "10%",
    size: "clamp(28px, 2.9vw, 44px)",
    motion: 3,
    duration: "7.1s",
    delay: "-3.6s",
  },
  {
    tile: 10,
    x: "70.5%",
    y: "43%",
    size: "clamp(23px, 2.4vw, 36px)",
    motion: 5,
    duration: "9.2s",
    delay: "-8.7s",
  },
  {
    tile: 5,
    x: "78.5%",
    y: "8%",
    size: "clamp(31px, 3.2vw, 49px)",
    motion: 1,
    duration: "7.6s",
    delay: "-5.2s",
  },
  {
    tile: 1,
    x: "87%",
    y: "46%",
    size: "clamp(22px, 2.3vw, 35px)",
    motion: 4,
    duration: "8.6s",
    delay: "-10.4s",
  },
  {
    tile: 8,
    x: "96%",
    y: "12%",
    size: "clamp(29px, 3vw, 46px)",
    motion: 2,
    duration: "6.7s",
    delay: "-7.4s",
  },
];

function spritePosition(tileIndex: number) {
  const column = tileIndex % 4;
  const row = Math.floor(tileIndex / 4);

  return {
    x: `${(column / 3) * 100}%`,
    y: `${(row / 2) * 100}%`,
  };
}

function spriteStyle(
  theme: ThemeId,
  tileIndex: number,
  placement?: DoodlePlacement,
  movementPercent = 100,
): DoodleStyle {
  const tile = spritePosition(tileIndex);
  const movementScale =
    Math.min(
      ANIMATION_MOVEMENT_MAX,
      Math.max(ANIMATION_MOVEMENT_MIN, movementPercent),
    ) / 100;
  const xMovement = placement
    ? Math.min(28, (6 + placement.motion * 1.5) * movementScale)
    : 0;
  const yMovement = placement
    ? Math.min(
        24,
        (6 + ((placement.motion + 2) % 6) * 1.4) * movementScale,
      )
    : 0;
  const rounded = (value: number) => Math.round(value * 1000) / 1000;
  const pixels = (value: number) => `${rounded(value)}px`;
  const degrees = (value: number) => `${rounded(value)}deg`;
  const scaleFromOne = (delta: number) =>
    `${rounded(1 + delta * movementScale)}`;
  const opacityFromOne = (delta: number) =>
    `${rounded(Math.max(0.5, 1 - delta * movementScale))}`;

  return {
    "--doodle-sprite": `url("/doodles/${theme}-sprite.png")`,
    "--sprite-x": tile.x,
    "--sprite-y": tile.y,
    ...(placement
      ? {
          "--doodle-x": placement.x,
          "--doodle-y": placement.y,
          "--doodle-size": placement.size,
          "--motion-duration": placement.duration,
          "--motion-delay": placement.delay,
          "--move-x": pixels(xMovement),
          "--move-x-neg": pixels(-xMovement),
          "--move-x-half": pixels(xMovement * 0.5),
          "--move-x-half-neg": pixels(xMovement * -0.5),
          "--move-y": pixels(yMovement),
          "--move-y-neg": pixels(-yMovement),
          "--move-y-half": pixels(yMovement * 0.5),
          "--move-y-half-neg": pixels(yMovement * -0.5),
          "--rotate-small": degrees(1.4 * movementScale),
          "--rotate-small-neg": degrees(-1.4 * movementScale),
          "--rotate-medium": degrees(2.2 * movementScale),
          "--rotate-medium-neg": degrees(-2.2 * movementScale),
          "--rotate-large": degrees(3 * movementScale),
          "--rotate-large-neg": degrees(-3 * movementScale),
          "--scale-small-up": scaleFromOne(0.02),
          "--scale-small-down": scaleFromOne(-0.02),
          "--scale-medium-up": scaleFromOne(0.035),
          "--scale-medium-down": scaleFromOne(-0.035),
          "--scale-large-up": scaleFromOne(0.05),
          "--opacity-soft": opacityFromOne(0.08),
          "--opacity-medium": opacityFromOne(0.12),
          "--opacity-low": opacityFromOne(0.16),
        }
      : {}),
  };
}

function Band({
  theme,
  edge,
  placements,
  movementPercent,
}: {
  theme: ThemeId;
  edge: "top" | "bottom";
  placements: readonly DoodlePlacement[];
  movementPercent: number;
}) {
  return (
    <div className={`scenery-band scenery-${edge}`}>
      {placements.map((placement, index) => {
        return (
          <span
            className="scenery-motif"
            data-doodle-tile={placement.tile}
            data-motion={placement.motion}
            key={`${edge}-${index}-${placement.tile}`}
            style={spriteStyle(
              theme,
              placement.tile,
              placement,
              movementPercent,
            )}
          />
        );
      })}
    </div>
  );
}

export function ThemeScenery({
  theme,
  movementPercent,
}: {
  theme: ThemeId;
  movementPercent: number;
}) {
  return (
    <div
      className="theme-scenery"
      aria-hidden="true"
      data-animation-movement={movementPercent}
    >
      <Band
        edge="top"
        movementPercent={movementPercent}
        placements={TOP_PLACEMENTS}
        theme={theme}
      />
      <Band
        edge="bottom"
        movementPercent={movementPercent}
        placements={BOTTOM_PLACEMENTS}
        theme={theme}
      />
    </div>
  );
}

export function ThemeMiniature({ theme }: { theme: ThemeId }) {
  return (
    <span className="theme-miniature" aria-hidden="true">
      {[0, 1, 2].map((tileIndex) => (
        <i
          className="theme-miniature-doodle"
          key={tileIndex}
          style={spriteStyle(theme, tileIndex)}
        />
      ))}
    </span>
  );
}
