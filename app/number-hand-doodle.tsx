import Image from "next/image";
import type { Language } from "./lib/settings";
import {
  numberExperience,
  type NumberDigit,
} from "./lib/number-experience";
import styles from "./number-hand-doodle.module.css";

type NumberHandDoodleProps = {
  digit: NumberDigit;
  language: Language;
  className?: string;
};

function IllustratedHand({ raised, mirror }: { raised: number; mirror: boolean }) {
  return (
    <Image
      className={styles.handImage}
      src={`/images/number-hands/hand-${raised}.webp`}
      alt=""
      aria-hidden="true"
      data-hand-count={raised}
      data-mirror={mirror || undefined}
      width={446}
      height={900}
      draggable={false}
      unoptimized
    />
  );
}

/** Hand-painted counting illustrations generated from the game's art direction. */
export function NumberHandDoodle({
  digit,
  language,
  className,
}: NumberHandDoodleProps) {
  const experience = numberExperience(digit, language);
  if (!experience) return null;

  return (
    <div
      className={[styles.doodle, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={experience.handLabel}
      data-number-hand={digit}
    >
      <div
        className={styles.hands}
        data-hand-layout={experience.handCounts.length === 1 ? "single" : "pair"}
        aria-hidden="true"
      >
        {experience.handCounts.map((raised, index) => (
          <IllustratedHand
            key={`${raised}-${index}`}
            raised={raised}
            mirror={index === 1}
          />
        ))}
      </div>
      <strong aria-hidden="true">{experience.phoneticDisplay}</strong>
    </div>
  );
}
