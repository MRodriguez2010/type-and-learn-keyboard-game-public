"use client";

import { SpeakerHigh } from "@phosphor-icons/react";
import { useId } from "react";
import {
  actionWordFor,
  feedbackForChoice,
  type FamiliarWord,
  type TwoChoiceRound,
} from "./lib/talk-and-point";
import type { Language } from "./lib/settings";
import styles from "./talk-and-point-activity.module.css";

type ActivityCopy = {
  meet: string;
  animal: string;
  object: string;
  soundTogether: (sound: string) => string;
  moveTogether: (action: string) => string;
  hear: (word: string) => string;
  hearAgain: string;
  hearQuestion: string;
  findIt: (word: string) => string;
  another: string;
  chooseLabel: (word: string) => string;
  choicesLabel: string;
};

const ACTIVITY_COPY: Record<Language, ActivityCopy> = {
  "en-US": {
    meet: "Meet a word",
    animal: "A familiar animal",
    object: "A familiar thing",
    soundTogether: (sound) => `Say the sound: ${sound}.`,
    moveTogether: (action) => `Move together: ${action}.`,
    hear: (word) => `Hear ${word}`,
    hearAgain: "Hear it together",
    hearQuestion: "Hear the question",
    findIt: (word) => `Find the ${word}`,
    another: "Another word",
    chooseLabel: (word) => `${word}. Tap to choose ${word}.`,
    choicesLabel: "Two picture choices",
  },
  "es-419": {
    meet: "Conozcan una palabra",
    animal: "Un animal conocido",
    object: "Algo conocido",
    soundTogether: (sound) => `Imiten el sonido: ${sound}.`,
    moveTogether: (action) => `Muévanse juntos: ${action}.`,
    hear: (word) => `Escuchar ${word}`,
    hearAgain: "Escúchenlo juntos",
    hearQuestion: "Escuchar la pregunta",
    findIt: (word) => `Encontrar ${word}`,
    another: "Otra palabra",
    chooseLabel: (word) => `${word}. Toca para elegir ${word}.`,
    choicesLabel: "Dos dibujos para elegir",
  },
};

export type FamiliarWordActivityProps = {
  item: FamiliarWord;
  disabled?: boolean;
  onHear: (item: FamiliarWord) => void;
  onFind?: (item: FamiliarWord) => void;
  onNext?: () => void;
};

export function FamiliarWordActivity({
  item,
  disabled = false,
  onHear,
  onFind,
  onNext,
}: FamiliarWordActivityProps) {
  const headingId = useId();
  const copy = ACTIVITY_COPY[item.language];
  const action = actionWordFor(item.motion, item.language);

  return (
    <section className={styles.activity} aria-labelledby={headingId}>
      <p className={styles.eyebrow}>
        {copy.meet} · {item.kind === "animal" ? copy.animal : copy.object}
      </p>
      <div className={styles.picture} aria-hidden="true">
        {item.emoji}
      </div>
      <h2 className={styles.word} id={headingId}>
        {item.word}
      </h2>
      <div className={styles.supportGroup}>
        <p className={styles.soundCue}>{copy.soundTogether(item.soundCue)}</p>
        <p className={styles.support}>{copy.moveTogether(action)}</p>
      </div>
      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.primary}`}
          type="button"
          aria-disabled={disabled}
          aria-label={copy.hear(item.spoken)}
          onClick={() => {
            if (!disabled) onHear(item);
          }}
        >
          <span aria-hidden="true">♪</span> {copy.hearAgain}
        </button>
        {onFind ? (
          <button
            className={styles.button}
            type="button"
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onFind(item);
            }}
          >
            {copy.findIt(item.spoken)}
          </button>
        ) : null}
        {onNext ? (
          <button
            className={styles.button}
            type="button"
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onNext();
            }}
          >
            {copy.another}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export type TwoChoicePromptProps = {
  round: TwoChoiceRound;
  selectedId?: string;
  disabled?: boolean;
  onChoose: (item: FamiliarWord, found: boolean) => void;
  onHear?: (item: FamiliarWord) => void;
  onHearPrompt?: (round: TwoChoiceRound) => void;
  onNext?: () => void;
};

export function TwoChoicePrompt({
  round,
  selectedId,
  disabled = false,
  onChoose,
  onHear,
  onHearPrompt,
  onNext,
}: TwoChoicePromptProps) {
  const headingId = useId();
  const copy = ACTIVITY_COPY[round.language];
  const feedback = selectedId
    ? feedbackForChoice(round, selectedId)
    : undefined;

  return (
    <section className={styles.activity} aria-labelledby={headingId}>
      <p className={styles.eyebrow}>{copy.choicesLabel}</p>
      <h2 className={styles.prompt} id={headingId}>
        {round.prompt}
      </h2>
      <div
        className={styles.choices}
        role="group"
        aria-label={round.prompt}
      >
        {round.choices.map((choice) => {
          const found = selectedId === choice.id && choice.id === round.target.id;
          const choiceDisabled = disabled || Boolean(feedback?.found);

          return (
            <button
              className={styles.choice}
              key={choice.id}
              type="button"
              aria-disabled={choiceDisabled}
              data-found={found || undefined}
              aria-label={copy.chooseLabel(choice.spoken)}
              onClick={() => {
                if (!choiceDisabled) {
                  onChoose(choice, choice.id === round.target.id);
                }
              }}
            >
              <span className={styles.choiceEmoji} aria-hidden="true">
                {choice.emoji}
              </span>
              <span>{choice.word}</span>
            </button>
          );
        })}
      </div>
      <p
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback?.announcement ?? "\u00a0"}
      </p>
      <div className={styles.actions}>
        {onHearPrompt ? (
          <button
            className={styles.button}
            type="button"
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onHearPrompt(round);
            }}
          >
            <SpeakerHigh
              className={styles.buttonIcon}
              aria-hidden="true"
              size={24}
              weight="fill"
            />
            {copy.hearQuestion}
          </button>
        ) : null}
        {onHear ? (
          <button
            className={`${styles.button} ${styles.primary}`}
            type="button"
            aria-disabled={disabled}
            aria-label={copy.hear(round.target.spoken)}
            onClick={() => {
              if (!disabled) onHear(round.target);
            }}
          >
            <span aria-hidden="true">♪</span> {copy.hearAgain}
          </button>
        ) : null}
        {feedback?.found && onNext ? (
          <button
            className={styles.button}
            type="button"
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onNext();
            }}
          >
            {copy.another}
          </button>
        ) : null}
      </div>
    </section>
  );
}
