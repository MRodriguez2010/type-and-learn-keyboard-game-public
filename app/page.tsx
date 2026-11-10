"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { GearSix } from "@phosphor-icons/react";
import {
  audioPathsFor,
  describeKey,
  type ResolvedCue,
} from "./lib/cues";
import {
  acceptCue,
  clearQueue,
  completeCurrent,
  createQueueState,
} from "./lib/game-queue";
import {
  isLearningCueId,
  letterExamples,
  letterFromCueId,
  pictureWordAudioPathsFor,
  type LetterExample,
} from "./lib/letter-examples";
import {
  numberCalloutAudioPathsFor,
  numberExperienceFromCue,
  type NumberExperience,
} from "./lib/number-experience";
import {
  audioCueForChoice,
  nextFamiliarWord,
  nextTwoChoiceRound,
  type FamiliarWord,
  type TwoChoiceRound,
} from "./lib/talk-and-point";
import {
  ANIMATION_MOVEMENT_MAX,
  ANIMATION_MOVEMENT_MIN,
  ANIMATION_MOVEMENT_STEP,
  decodeSettings,
  DEFAULT_SETTINGS,
  encodeSettings,
  sanitizeSettings,
  SETTINGS_STORAGE_KEY,
  type Language,
  type ParentSettings,
} from "./lib/settings";
import { placementFor, type KeyPlacement } from "./lib/placement";
import { advanceUnlock } from "./lib/unlock";
import {
  keyGlow,
  THEME_IDS,
  THEMES,
  themeVariables,
} from "./lib/themes";
import { shouldUseOnScreenKeyboard } from "./lib/touch-device";
import { touchGardenPages } from "./lib/touch-garden";
import { NumberHandDoodle } from "./number-hand-doodle";
import {
  FamiliarWordActivity,
  TwoChoicePrompt,
} from "./talk-and-point-activity";
import { ThemeMiniature, ThemeScenery } from "./theme-scenery";

type GameMode = "home" | "settings" | "playing";
type PlayActivity = "keys" | "talk-point" | "find-it";
type GamePhase =
  | "idle"
  | "modeling"
  | "vocalizing"
  | "imitating"
  | "fading";
type AudioStatus = "loading" | "ready" | "fallback";

type ActiveCard = {
  cue: ResolvedCue;
  example?: LetterExample;
  number?: NumberExperience;
  placement: KeyPlacement;
  renderId: number;
};

type KeyboardLockNavigator = Navigator & {
  keyboard?: {
    lock?: () => Promise<void>;
    unlock?: () => void;
  };
};

type WakeLockSentinelLike = {
  release: () => Promise<void>;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request?: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
  };
};

const FADE_TIME = 260;
const BETWEEN_CLIPS_TIME = 180;
const AUDIO_HARD_TIMEOUT = 8000;
const GUARDIAN_HOLD_TIME = 2000;

const COPY = {
  "en-US": {
    languageName: "English",
    homeEyebrow: "CALM KEYBOARD PLAY",
    brandStart: "Type &",
    brandAccent: "Learn",
    brandEnd: "Keyboard Game",
    homeTitleStart: "Listen.",
    homeTitleAccent: "Copy.",
    homeTitleEnd: "Play.",
    homeIntro:
      "A quiet turn-taking game for little voices and curious fingers.",
    start: "Play",
    preparing: "Voices are getting ready — you can start anytime.",
    activityPickerLabel: "Choose a way to play",
    letterPlayTitle: "Letters & numbers",
    letterPlayHelp: "Press a key or tap a sound bubble.",
    talkPointTitle: "Talk & Point",
    talkPointHelp: "Meet one familiar picture, word, sound, and action.",
    findItTitle: "Find It",
    findItHelp: "Choose between two pictures. No timer or score.",
    parentSettings: "Settings",
    togetherTitle: "Guardian supervision recommended",
    togetherBody:
      "Stay nearby, copy the sounds together, and use your device’s child-lock feature when you need stronger protection.",
    mobilePlayTitle: "Made for touchscreens, too",
    mobilePlayBody:
      "Phones and tablets get six large, center-safe sound bubbles instead of a keyboard. Add the site to your Home Screen, then use Guided Access on Apple devices or app pinning on Android for the strongest lock-in.",
    exitHelp: "During play, type PARENT to return here.",
    touchExitHelp:
      "On a touchscreen, hold Grown-up for 2 seconds during play to return here.",
    settingsTitle: "Parent settings",
    settingsIntro:
      "Choose a calm pace that feels right for your child. These choices stay on this device.",
    sound: "Sound",
    pace: "Pace",
    look: "Look",
    review: "Review",
    languageLabel: "Language / Idioma",
    languageHelp: "Choose one language for each play session.",
    cueLabel: "What should each letter say?",
    cueSound: "Name + playful sound",
    cueSoundHelp: "“M … mmm”",
    cueWord: "Name + sound + picture word",
    cueWordHelp: "“M … mmm … Moon” with an animated doodle",
    cueName: "Name only",
    cueNameHelp: "“M”",
    keyScopeLabel: "Which physical keys should respond?",
    learningKeys: "Letters & numbers only",
    learningKeysHelp:
      "Recommended. Control, Caps Lock, punctuation, and other computer keys stay quiet.",
    allKeys: "Every recognized key",
    allKeysHelp:
      "Also names punctuation and computer keys such as Enter and Shift.",
    volumeLabel: "Voice volume",
    preview: "Preview voice",
    previewing: "Playing preview…",
    studioReady: "Studio voice ready",
    pictureWordsReady: "Studio voice + picture words ready",
    fallbackReady: "Device voice fallback ready",
    loadingVoice: "Preparing the selected voice pack…",
    imitationLabel: "Quiet turn to copy the sound",
    imitationHelp:
      "After the voice finishes, the character stays still while your child takes a turn.",
    seconds: "seconds",
    repetitionLabel: "When the same key is pressed many times",
    sayOnce: "Say it once",
    sayTwice: "Say it up to twice",
    queueHelp:
      "Rapid presses never build a long list. The game keeps only the newest waiting key.",
    motionLabel: "Character movement",
    gentle: "Gentle breath",
    gentleHelp: "One small, slow movement during the quiet turn.",
    still: "Still",
    stillHelp: "No movement; the character only fades.",
    movementLabel: "Doodle animation movement",
    movementHelp:
      "100% is the standard travel distance. Higher values move every edge doodle farther; Still mode pauses them.",
    themeLabel: "Choose a theme",
    themeHelp:
      "Each theme keeps the center quiet, with small doodles at the screen edges.",
    themeReview: "Theme",
    lookHelp:
      "Choose a gentle color world and how much it moves. The letter or number always stays the focus.",
    reviewTitle: "Ready to play",
    reviewHelp: "These settings will be used for the whole session.",
    sessionEnded: "You’re back home. Choose another way to play whenever you’re ready.",
    resumeFullscreen: "Click, tap, or press any key to return to play",
    resumeFullscreenHelp: "Play is paused until fullscreen is restored.",
    languageReview: "Language",
    cueReview: "Voice cue",
    keyScopeReview: "Active keys",
    timingReview: "Quiet turn",
    repeatsReview: "Repeated keys",
    volumeReview: "Volume",
    motionReview: "Motion",
    movementReview: "Doodle movement",
    once: "Once",
    twice: "Up to twice",
    back: "Back",
    next: "Next",
    cancel: "Cancel",
    saveClose: "Save & return home",
    restore: "Restore defaults",
    restored: "Defaults restored in this draft. Save to keep them.",
    summaryNameSound: "Name + sound",
    summaryNameSoundWord: "Name + sound + picture word",
    summaryNameOnly: "Name only",
    summaryLearningKeys: "Letters & numbers only",
    summaryAllKeys: "Every recognized key",
    summaryGentle: "Gentle motion",
    summaryStill: "Still",
    gameLabel: "Type & Learn Keyboard Game: listen and copy",
    touchPrompt: "Pick a sound bubble",
    newBubbles: "New bubbles",
    bubblePage: "Bubble group",
    guardianHold: "Hold 2 seconds for Grown-up",
  },
  "es-419": {
    languageName: "Español",
    homeEyebrow: "JUEGO TRANQUILO CON TECLAS",
    brandStart: "Type &",
    brandAccent: "Learn",
    brandEnd: "Keyboard Game",
    homeTitleStart: "Escucha.",
    homeTitleAccent: "Imita.",
    homeTitleEnd: "Juega.",
    homeIntro:
      "Un juego tranquilo de turnos para pequeñas voces y dedos curiosos.",
    start: "Jugar",
    preparing: "Las voces se están preparando; pueden empezar cuando quieran.",
    activityPickerLabel: "Elige una forma de jugar",
    letterPlayTitle: "Letras y números",
    letterPlayHelp: "Presiona una tecla o toca una burbuja de sonido.",
    talkPointTitle: "Hablar y señalar",
    talkPointHelp: "Conozcan un dibujo, palabra, sonido y acción.",
    findItTitle: "¿Dónde está?",
    findItHelp: "Elige entre dos dibujos. Sin reloj ni puntaje.",
    parentSettings: "Ajustes",
    togetherTitle: "Se recomienda la supervisión de un adulto",
    togetherBody:
      "Quédate cerca, imiten los sonidos juntos y usa la función de bloqueo infantil del dispositivo cuando necesites más protección.",
    mobilePlayTitle: "También funciona con pantallas táctiles",
    mobilePlayBody:
      "Los teléfonos y las tabletas muestran seis burbujas grandes y alejadas de los bordes en vez de un teclado. Añade el sitio a la pantalla de inicio y usa Acceso guiado en Apple o fijación de apps en Android para una mayor protección.",
    exitHelp: "Durante el juego, escribe PARENT para volver aquí.",
    touchExitHelp:
      "En una pantalla táctil, mantén Adulto por 2 segundos durante el juego para volver aquí.",
    settingsTitle: "Ajustes para adultos",
    settingsIntro:
      "Elige un ritmo tranquilo para tu niño. Estas opciones se guardan en este dispositivo.",
    sound: "Sonido",
    pace: "Ritmo",
    look: "Aspecto",
    review: "Revisar",
    languageLabel: "Language / Idioma",
    languageHelp: "Elige un idioma para cada sesión.",
    cueLabel: "¿Qué debe decir cada letra?",
    cueSound: "Nombre + sonido divertido",
    cueSoundHelp: "“M … mmm”",
    cueWord: "Nombre + sonido + palabra ilustrada",
    cueWordHelp: "“M … mmm … Mariposa” con un dibujo animado",
    cueName: "Solo el nombre",
    cueNameHelp: "“M”",
    keyScopeLabel: "¿Qué teclas físicas deben responder?",
    learningKeys: "Solo letras y números",
    learningKeysHelp:
      "Recomendado. Control, Bloq Mayús, puntuación y otras teclas quedan en silencio.",
    allKeys: "Todas las teclas reconocidas",
    allKeysHelp:
      "También nombra la puntuación y teclas como Intro y Mayúsculas.",
    volumeLabel: "Volumen de la voz",
    preview: "Escuchar la voz",
    previewing: "Reproduciendo…",
    studioReady: "Voz de estudio lista",
    pictureWordsReady: "Voz y palabras ilustradas listas",
    fallbackReady: "Voz del dispositivo lista",
    loadingVoice: "Preparando el paquete de voz…",
    imitationLabel: "Turno tranquilo para imitar",
    imitationHelp:
      "Cuando termina la voz, la letra permanece mientras tu niño toma su turno.",
    seconds: "segundos",
    repetitionLabel: "Cuando se presiona muchas veces la misma tecla",
    sayOnce: "Decir una vez",
    sayTwice: "Decir hasta dos veces",
    queueHelp:
      "Las teclas rápidas nunca crean una lista larga. El juego conserva solo la tecla más reciente.",
    motionLabel: "Movimiento del carácter",
    gentle: "Respiración suave",
    gentleHelp: "Un movimiento pequeño y lento durante el turno tranquilo.",
    still: "Quieto",
    stillHelp: "Sin movimiento; el carácter solo desaparece.",
    movementLabel: "Movimiento de los dibujos",
    movementHelp:
      "100% es la distancia normal. Los valores más altos mueven más cada dibujo; el modo Quieto los pausa.",
    themeLabel: "Elige un tema",
    themeHelp:
      "Cada tema mantiene el centro tranquilo, con dibujos pequeños en los bordes.",
    themeReview: "Tema",
    lookHelp:
      "Elige un mundo de colores suaves y cuánto se mueve. La letra o el número siempre es lo más importante.",
    reviewTitle: "Listos para jugar",
    reviewHelp: "Estos ajustes se usarán durante toda la sesión.",
    sessionEnded:
      "Volviste al inicio. Elige otra forma de jugar cuando estén listos.",
    resumeFullscreen:
      "Haz clic, toca o presiona cualquier tecla para volver al juego",
    resumeFullscreenHelp:
      "El juego está en pausa hasta que se restaure la pantalla completa.",
    languageReview: "Idioma",
    cueReview: "Indicación de voz",
    keyScopeReview: "Teclas activas",
    timingReview: "Turno tranquilo",
    repeatsReview: "Teclas repetidas",
    volumeReview: "Volumen",
    motionReview: "Movimiento",
    movementReview: "Movimiento de los dibujos",
    once: "Una vez",
    twice: "Hasta dos veces",
    back: "Atrás",
    next: "Siguiente",
    cancel: "Cancelar",
    saveClose: "Guardar y volver al inicio",
    restore: "Restaurar valores",
    restored:
      "Los valores iniciales están en el borrador. Guarda para conservarlos.",
    summaryNameSound: "Nombre + sonido",
    summaryNameSoundWord: "Nombre + sonido + palabra ilustrada",
    summaryNameOnly: "Solo el nombre",
    summaryLearningKeys: "Solo letras y números",
    summaryAllKeys: "Todas las teclas reconocidas",
    summaryGentle: "Movimiento suave",
    summaryStill: "Quieto",
    gameLabel: "Type & Learn Keyboard Game: escucha e imita",
    touchPrompt: "Elige una burbuja de sonido",
    newBubbles: "Nuevas burbujas",
    bubblePage: "Grupo de burbujas",
    guardianHold: "Mantén 2 segundos para Adulto",
  },
} as const;

const STEP_KEYS = ["sound", "pace", "look", "review"] as const;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function chooseFallbackVoice(language: Language) {
  if (!("speechSynthesis" in window)) {
    return undefined;
  }

  const voices = window.speechSynthesis.getVoices();
  const preferredNames =
    language === "es-419"
      ? ["Paulina", "Mónica", "Monica", "Elvira", "Google español"]
      : ["Ava", "Samantha", "Aria", "Jenny", "Google US English"];

  for (const preferredName of preferredNames) {
    const voice = voices.find(
      (candidate) =>
        candidate.name.toLocaleLowerCase().includes(
          preferredName.toLocaleLowerCase(),
        ) && candidate.lang.toLocaleLowerCase().startsWith(language.slice(0, 2)),
    );
    if (voice) return voice;
  }

  return voices.find((voice) =>
    voice.lang.toLocaleLowerCase().startsWith(language.slice(0, 2)),
  );
}

function ExampleDoodle({ example }: { example: LetterExample }) {
  return (
    <div
      className="example-doodle"
      data-example-motion={example.motion}
      aria-hidden="true"
    >
      <div className="example-picture">
        <span className="example-emoji">{example.emoji}</span>
        {example.motion === "roll" ? (
          <span className="example-wheels">
            <span />
            <span />
          </span>
        ) : null}
        {example.motion === "chomp" ? (
          <span className="example-bites">
            <span />
            <span />
            <span />
          </span>
        ) : null}
      </div>
      <strong>{example.word}</strong>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<GameMode>("home");
  const [savedSettings, setSavedSettings] = useState<ParentSettings>({
    ...DEFAULT_SETTINGS,
  });
  const [draftSettings, setDraftSettings] = useState<ParentSettings>({
    ...DEFAULT_SETTINGS,
  });
  const [settingsStep, setSettingsStep] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("loading");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("idle");
  const [sessionSettings, setSessionSettings] = useState<ParentSettings>({
    ...DEFAULT_SETTINGS,
  });
  const [needsFullscreenResume, setNeedsFullscreenResume] = useState(false);
  const [hasTouchControls, setHasTouchControls] = useState<boolean | null>(null);
  const [guardianHolding, setGuardianHolding] = useState(false);
  const [touchGardenPage, setTouchGardenPage] = useState(0);
  const [playActivity, setPlayActivity] = useState<PlayActivity>("keys");
  const [familiarWord, setFamiliarWord] = useState<FamiliarWord | null>(null);
  const [twoChoiceRound, setTwoChoiceRound] =
    useState<TwoChoiceRound | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>();
  const [activityAudioBusy, setActivityAudioBusy] = useState(false);

  const modeRef = useRef<GameMode>("home");
  const savedSettingsRef = useRef<ParentSettings>({ ...DEFAULT_SETTINGS });
  const sessionSettingsRef = useRef<ParentSettings>({ ...DEFAULT_SETTINGS });
  const queueRef = useRef(createQueueState<ResolvedCue>());
  const processingRef = useRef(false);
  const sessionRef = useRef(0);
  const unlockBufferRef = useRef("");
  const renderIdRef = useRef(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioSettleRef = useRef<((played: boolean) => void) | null>(null);
  const speechSettleRef = useRef<(() => void) | null>(null);
  const previewRef = useRef(0);
  const fullscreenWasActiveRef = useRef(false);
  const guardianHoldTimerRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const exampleCycleRef = useRef(new Map<string, number>());
  const playActivityRef = useRef<PlayActivity>("keys");
  const activityAudioBusyRef = useRef(false);
  const parentShellRef = useRef<HTMLElement | null>(null);
  const activeSettingsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const activeLanguage =
    mode === "settings"
      ? draftSettings.language
      : mode === "playing"
        ? sessionSettings.language
        : savedSettings.language;
  const activeCueMode =
    mode === "settings"
      ? draftSettings.cueMode
      : mode === "playing"
        ? sessionSettings.cueMode
        : savedSettings.cueMode;
  const copy = COPY[activeLanguage];

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
  }, [activeLanguage]);

  useEffect(() => {
    if (mode === "playing") return;

    const frame = window.requestAnimationFrame(() => {
      const shell = parentShellRef.current;
      if (shell) {
        shell.scrollTop = 0;
        shell.scrollLeft = 0;
      }

      if (mode === "settings") {
        activeSettingsHeadingRef.current?.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mode, settingsStep]);

  useEffect(() => {
    const deviceNavigator = navigator as NavigatorWithUserAgentData;
    const pointerQuery = window.matchMedia("(pointer: coarse), (hover: none)");
    const updateTouchControls = () => {
      setHasTouchControls(
        shouldUseOnScreenKeyboard({
          userAgent: deviceNavigator.userAgent,
          maxTouchPoints: deviceNavigator.maxTouchPoints,
          mobileHint: deviceNavigator.userAgentData?.mobile,
          coarsePointer: pointerQuery.matches,
        }),
      );
    };
    const timeoutId = window.setTimeout(updateTouchControls, 0);
    pointerQuery.addEventListener("change", updateTouchControls);

    return () => {
      window.clearTimeout(timeoutId);
      pointerQuery.removeEventListener("change", updateTouchControls);
    };
  }, []);

  useEffect(() => {
    let timeoutId = 0;
    try {
      const stored = decodeSettings(
        window.localStorage.getItem(SETTINGS_STORAGE_KEY),
      );
      savedSettingsRef.current = stored;
      timeoutId = window.setTimeout(() => {
        setAudioStatus("loading");
        setSavedSettings(stored);
        setDraftSettings(stored);
      }, 0);
    } catch {
      // Device-local preferences are optional; defaults remain available.
    }

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const voicePaths = audioPathsFor(activeLanguage);
    const numberPaths = numberCalloutAudioPathsFor(activeLanguage);
    const picturePaths = pictureWordAudioPathsFor(activeLanguage);
    const paths = [
      voicePaths[0],
      numberPaths[0],
      ...(activeCueMode === "name-sound-word" ? [picturePaths[0]] : []),
    ].filter((path): path is string => Boolean(path));

    void Promise.all(
      paths.map(async (path) => {
        const response = await fetch(path, {
          cache: "force-cache",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Unable to preload ${path}`);
        }
        await response.arrayBuffer();
      }),
    )
      .then(() => {
        if (!controller.signal.aborted) {
          setAudioStatus("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAudioStatus("fallback");
        }
      });

    return () => controller.abort();
  }, [activeCueMode, activeLanguage]);

  const cancelSound = useCallback(() => {
    activeAudioRef.current?.pause();
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.currentTime = 0;
      } catch {
        // Some mobile media implementations reject seeking before metadata.
      }
    }
    activeAudioSettleRef.current?.(false);
    activeAudioSettleRef.current = null;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speechSettleRef.current?.();
    speechSettleRef.current = null;
  }, []);

  const playAudioFile = useCallback((path: string, volume: number) => {
    return new Promise<boolean>((resolve) => {
      activeAudioSettleRef.current?.(false);
      const audio = activeAudioRef.current ?? new Audio();
      let settled = false;
      let timeoutId = 0;

      const finish = (played: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        if (activeAudioRef.current === audio) {
          activeAudioSettleRef.current = null;
        }
        resolve(played);
      };

      const onEnded = () => finish(true);
      const onError = () => finish(false);

      audio.preload = "auto";
      audio.volume = volume;
      audio.src = path;
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);
      activeAudioRef.current = audio;
      activeAudioSettleRef.current = finish;
      timeoutId = window.setTimeout(() => finish(false), AUDIO_HARD_TIMEOUT);

      audio.load();
      void audio.play().catch(() => finish(false));
    });
  }, []);

  const speakFallback = useCallback(
    (text: string, language: Language, volume: number) => {
      if (!("speechSynthesis" in window) || volume === 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let settled = false;
        let timeoutId = 0;
        const utterance = new SpeechSynthesisUtterance(text);

        const finish = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          speechSettleRef.current = null;
          resolve();
        };

        utterance.lang = language;
        utterance.rate = 0.86;
        utterance.pitch = 1;
        utterance.volume = volume;
        utterance.voice = chooseFallbackVoice(language) ?? null;
        utterance.onend = finish;
        utterance.onerror = finish;
        speechSettleRef.current = finish;
        timeoutId = window.setTimeout(finish, 3000);
        window.speechSynthesis.speak(utterance);
      });
    },
    [],
  );

  const nextLetterExample = useCallback(
    (cue: ResolvedCue, settings: ParentSettings) => {
      if (settings.cueMode !== "name-sound-word") return undefined;

      const letter = letterFromCueId(cue.id, cue.display);
      if (!letter) return undefined;

      const cacheKey = `${settings.language}:${letter}`;
      const examples = letterExamples(settings.language, letter);
      if (examples.length === 0) return undefined;

      const currentIndex = exampleCycleRef.current.get(cacheKey) ?? 0;
      exampleCycleRef.current.set(cacheKey, currentIndex + 1);
      return examples[currentIndex % examples.length];
    },
    [],
  );

  const playCueAudio = useCallback(
    async (
      cue: ResolvedCue,
      settings: ParentSettings,
      canContinue: () => boolean,
      onVocalStart?: () => void,
      example?: LetterExample,
      number?: NumberExperience,
    ) => {
      if (settings.volume === 0) return;

      if (number && canContinue()) {
        onVocalStart?.();
        const calloutPlayed = await playAudioFile(
          number.audioCallout,
          settings.volume,
        );
        if (!calloutPlayed && canContinue()) {
          await speakFallback(
            number.fallbackSpeech,
            settings.language,
            settings.volume,
          );
        }
        return;
      }

      if (
        settings.cueMode === "name-sound-word" &&
        example &&
        canContinue()
      ) {
        onVocalStart?.();
        const calloutPlayed = await playAudioFile(
          example.audioCallout,
          settings.volume,
        );
        if (calloutPlayed || !canContinue()) return;
      }

      const namePlayed =
        cue.audioName &&
        (await playAudioFile(cue.audioName, settings.volume));

      if (!namePlayed && canContinue()) {
        const fallbackName = cue.id.startsWith("letter-")
          ? settings.language === "es-419"
            ? `la letra ${cue.spoken}`
            : `the letter ${cue.spoken}`
          : cue.spoken;
        await speakFallback(fallbackName, settings.language, settings.volume);
      }

      if (
        settings.cueMode !== "name-only" &&
        cue.vocal &&
        canContinue()
      ) {
        await wait(BETWEEN_CLIPS_TIME);
        if (!canContinue()) return;

        onVocalStart?.();

        const vocalPlayed =
          cue.audioVocal &&
          (await playAudioFile(cue.audioVocal, settings.volume));

        if (!vocalPlayed && canContinue()) {
          await speakFallback(cue.vocal, settings.language, settings.volume);
        }
      }

      if (
        settings.cueMode === "name-sound-word" &&
        example &&
        canContinue()
      ) {
        await wait(BETWEEN_CLIPS_TIME);
        if (!canContinue()) return;
        await speakFallback(
          example.spoken,
          settings.language,
          settings.volume,
        );
      }
    },
    [playAudioFile, speakFallback],
  );

  const playActivityClip = useCallback(
    async (path: string, fallbackSpeech: string) => {
      if (
        activityAudioBusyRef.current ||
        modeRef.current !== "playing"
      ) {
        return false;
      }

      const session = sessionRef.current;
      const settings = sessionSettingsRef.current;
      activityAudioBusyRef.current = true;
      setActivityAudioBusy(true);
      setGamePhase("vocalizing");

      try {
        if (settings.volume > 0) {
          const played = await playAudioFile(path, settings.volume);
          if (
            !played &&
            modeRef.current === "playing" &&
            session === sessionRef.current
          ) {
            await speakFallback(
              fallbackSpeech,
              settings.language,
              settings.volume,
            );
          }
        }

        return (
          modeRef.current === "playing" && session === sessionRef.current
        );
      } finally {
        if (session === sessionRef.current) {
          activityAudioBusyRef.current = false;
          if (modeRef.current === "playing") {
            setActivityAudioBusy(false);
            setGamePhase("idle");
          }
        }
      }
    },
    [playAudioFile, speakFallback],
  );

  const hearFamiliarWord = useCallback(
    (item: FamiliarWord) => {
      void playActivityClip(item.wordCalloutAudio, item.wordSoundSpeech);
    },
    [playActivityClip],
  );

  const hearTwoChoicePrompt = useCallback(
    (round: TwoChoiceRound) => {
      void playActivityClip(round.promptAudio, round.prompt);
    },
    [playActivityClip],
  );

  const chooseFamiliarWord = useCallback(
    (item: FamiliarWord) => {
      if (activityAudioBusyRef.current) return;
      setSelectedChoiceId(item.id);

      if (!twoChoiceRound) return;
      const audioCue = audioCueForChoice(twoChoiceRound, item.id);
      void playActivityClip(audioCue.path, audioCue.fallbackSpeech);
    },
    [playActivityClip, twoChoiceRound],
  );

  const showNextFamiliarWord = useCallback(() => {
    if (activityAudioBusyRef.current) return;
    setFamiliarWord((current) =>
      nextFamiliarWord(
        sessionSettingsRef.current.language,
        current?.id,
      ),
    );
  }, []);

  const showNextTwoChoiceRound = useCallback(() => {
    if (activityAudioBusyRef.current) return;
    setSelectedChoiceId(undefined);
    setTwoChoiceRound((current) =>
      nextTwoChoiceRound(
        sessionSettingsRef.current.language,
        current?.target.id,
      ),
    );
  }, []);

  useEffect(() => {
    if (
      mode !== "playing" ||
      playActivity !== "find-it" ||
      !twoChoiceRound
    ) {
      return;
    }

    void playActivityClip(
      twoChoiceRound.promptAudio,
      twoChoiceRound.prompt,
    );
  }, [mode, playActivity, playActivityClip, twoChoiceRound]);

  const drainQueue = useCallback(async () => {
    if (processingRef.current || modeRef.current !== "playing") return;

    processingRef.current = true;
    const session = sessionRef.current;

    try {
      while (
        modeRef.current === "playing" &&
        session === sessionRef.current &&
        queueRef.current.current
      ) {
        const cue = queueRef.current.current.value;
        const settings = sessionSettingsRef.current;
        const renderId = renderIdRef.current++;
        const example = nextLetterExample(cue, settings);
        const number = numberExperienceFromCue(
          cue.id,
          cue.display,
          settings.language,
        );

        setGamePhase("modeling");
        setActiveCard({
          cue,
          example,
          number,
          placement: placementFor(renderId, cue.identity, cue.isWord),
          renderId,
        });

        const canContinue = () =>
          modeRef.current === "playing" && session === sessionRef.current;

        await playCueAudio(
          cue,
          settings,
          canContinue,
          () => {
            if (canContinue()) {
              setGamePhase("vocalizing");
            }
          },
          example,
          number,
        );

        if (modeRef.current !== "playing" || session !== sessionRef.current) {
          return;
        }

        setGamePhase("imitating");
        await wait(settings.imitationTurnMs);

        if (modeRef.current !== "playing" || session !== sessionRef.current) {
          return;
        }

        setGamePhase("fading");
        await wait(FADE_TIME);

        if (modeRef.current !== "playing" || session !== sessionRef.current) {
          return;
        }

        setActiveCard(null);
        setGamePhase("idle");
        const completion = completeCurrent(queueRef.current);
        queueRef.current = completion.state;
      }
    } finally {
      if (session === sessionRef.current) {
        processingRef.current = false;
      }
    }
  }, [nextLetterExample, playCueAudio]);

  const queueKey = useCallback(
    (key: string) => {
      if (
        modeRef.current !== "playing" ||
        playActivityRef.current !== "keys"
      ) {
        return;
      }

      const settings = sessionSettingsRef.current;
      const cue = describeKey(key, settings.language);
      if (
        settings.keyScope === "letters-and-numbers" &&
        !isLearningCueId(cue.id)
      ) {
        return;
      }

      const previous = queueRef.current;
      const next = acceptCue(
        previous,
        cue,
        settings.maxConsecutivePlays,
      );
      queueRef.current = next;

      if (next !== previous) {
        void drainQueue();
      }
    },
    [drainQueue],
  );

  const enterFullscreen = useCallback(async () => {
    const session = sessionRef.current;
    const canContinue = () =>
      modeRef.current === "playing" && session === sessionRef.current;

    if (!canContinue()) return false;

    let isFullscreen = Boolean(document.fullscreenElement);

    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen({
          navigationUI: "hide",
        });
        isFullscreen = Boolean(document.fullscreenElement);
      }
    } catch {
      // The game remains usable in the full browser viewport.
    }

    if (!canContinue()) {
      if (modeRef.current !== "playing") {
        try {
          (navigator as KeyboardLockNavigator).keyboard?.unlock?.();
          if (document.fullscreenElement) await document.exitFullscreen();
        } catch {
          // A newer navigation already restored the browser viewport.
        }
      }
      return false;
    }

    try {
      await (navigator as KeyboardLockNavigator).keyboard?.lock?.();
    } catch {
      // Keyboard Lock is an optional browser enhancement.
    }

    if (!canContinue()) {
      if (modeRef.current !== "playing") {
        try {
          (navigator as KeyboardLockNavigator).keyboard?.unlock?.();
          if (document.fullscreenElement) await document.exitFullscreen();
        } catch {
          // A newer navigation already restored the browser viewport.
        }
      }
      return false;
    }

    if (isFullscreen) {
      fullscreenWasActiveRef.current = true;
      setNeedsFullscreenResume(false);
    }

    return isFullscreen;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (wakeLockRef.current || modeRef.current !== "playing") return;

    const session = sessionRef.current;
    try {
      const wakeLock =
        (await (navigator as WakeLockNavigator).wakeLock?.request?.("screen")) ??
        null;

      if (!wakeLock) return;

      if (modeRef.current !== "playing" || session !== sessionRef.current) {
        await wakeLock.release();
        return;
      }

      const previousWakeLock = wakeLockRef.current;
      wakeLockRef.current = wakeLock;
      if (previousWakeLock && previousWakeLock !== wakeLock) {
        await previousWakeLock.release();
      }
    } catch {
      // Screen wake lock is a best-effort mobile enhancement.
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    try {
      await wakeLock?.release();
    } catch {
      // The browser may already have released the lock.
    }
  }, []);

  const commitSettings = useCallback((nextValue: ParentSettings) => {
    const next = sanitizeSettings(nextValue);
    savedSettingsRef.current = next;
    setSavedSettings(next);

    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, encodeSettings(next));
    } catch {
      // The settings still apply to the current page when storage is blocked.
    }

    return next;
  }, []);

  const startGame = useCallback(
    async (
      settingsValue: ParentSettings,
      activity: PlayActivity = "keys",
    ) => {
      const snapshot = sanitizeSettings(settingsValue);
      const initialFamiliarWord =
        activity === "talk-point"
          ? nextFamiliarWord(snapshot.language, undefined, () => 0)
          : null;
      const initialTwoChoiceRound =
        activity === "find-it"
          ? nextTwoChoiceRound(snapshot.language, undefined, () => 0)
          : null;
      cancelSound();
      previewRef.current += 1;
      setIsPreviewing(false);

      sessionRef.current += 1;
      const session = sessionRef.current;
      sessionSettingsRef.current = snapshot;
      setSessionSettings(snapshot);
      queueRef.current = clearQueue<ResolvedCue>();
      processingRef.current = false;
      unlockBufferRef.current = "";
      fullscreenWasActiveRef.current = false;
      window.clearTimeout(guardianHoldTimerRef.current);
      setGuardianHolding(false);
      playActivityRef.current = activity;
      setPlayActivity(activity);
      activityAudioBusyRef.current = false;
      setActivityAudioBusy(false);
      setFamiliarWord(initialFamiliarWord);
      setTwoChoiceRound(initialTwoChoiceRound);
      setSelectedChoiceId(undefined);
      modeRef.current = "playing";
      setActiveCard(null);
      setGamePhase("idle");
      setSessionEnded(false);
      setNeedsFullscreenResume(false);
      setTouchGardenPage(0);
      setMode("playing");

      await enterFullscreen();
      if (modeRef.current !== "playing" || session !== sessionRef.current) {
        return;
      }
      void requestWakeLock();

      if (initialFamiliarWord) {
        await playActivityClip(
          initialFamiliarWord.wordCalloutAudio,
          initialFamiliarWord.wordSoundSpeech,
        );
      }
    },
    [
      cancelSound,
      enterFullscreen,
      playActivityClip,
      requestWakeLock,
    ],
  );

  const exitGame = useCallback(async () => {
    sessionRef.current += 1;
    previewRef.current += 1;
    modeRef.current = "home";
    queueRef.current = clearQueue<ResolvedCue>();
    processingRef.current = false;
    unlockBufferRef.current = "";
    fullscreenWasActiveRef.current = false;
    window.clearTimeout(guardianHoldTimerRef.current);
    setGuardianHolding(false);
    activityAudioBusyRef.current = false;
    setActivityAudioBusy(false);
    cancelSound();
    void releaseWakeLock();
    setActiveCard(null);
    setGamePhase("idle");
    setFamiliarWord(null);
    setTwoChoiceRound(null);
    setSelectedChoiceId(undefined);
    setSessionEnded(true);
    setRestoredNotice(false);
    setNeedsFullscreenResume(false);
    setMode("home");

    try {
      (navigator as KeyboardLockNavigator).keyboard?.unlock?.();
    } catch {
      // No keyboard lock is active in unsupported browsers.
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // The home screen still opens if fullscreen was already dismissed.
    }
  }, [cancelSound, releaseWakeLock]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modeRef.current !== "playing") return;

      const unlock = advanceUnlock(unlockBufferRef.current, event.key);
      unlockBufferRef.current = unlock.buffer;
      if (unlock.unlocked) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        void exitGame();
        return;
      }

      if (fullscreenWasActiveRef.current && !document.fullscreenElement) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        void enterFullscreen();
        return;
      }

      const target = event.target;
      const isInteractiveControl =
        target instanceof Element &&
        Boolean(
          target.closest(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
      const hasInteractiveGameControls = Boolean(
        document.querySelector(".game-screen button"),
      );

      if (event.key === "Tab" && hasInteractiveGameControls) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const controls = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.game-screen button:not([disabled]), .game-screen a[href], .game-screen input:not([disabled]), .game-screen select:not([disabled]), .game-screen textarea:not([disabled]), .game-screen [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (control, index, allControls) =>
            allControls.indexOf(control) === index &&
            control.getClientRects().length > 0,
        );

        const currentIndex = controls.indexOf(
          document.activeElement as HTMLElement,
        );
        const nextIndex = event.shiftKey
          ? currentIndex <= 0
            ? controls.length - 1
            : currentIndex - 1
          : currentIndex === -1 || currentIndex === controls.length - 1
            ? 0
            : currentIndex + 1;

        controls[nextIndex]?.focus();
        return;
      }

      const shouldAllowActivityControl =
        ((event.key === "Enter" || event.key === " ") &&
          isInteractiveControl) ||
        ((event.ctrlKey || event.metaKey || event.altKey) &&
          isInteractiveControl);

      if (shouldAllowActivityControl) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (!document.fullscreenElement) void enterFullscreen();
      queueKey(event.key);
    };

    const preventInteraction = (event: Event) => {
      if (modeRef.current === "playing") {
        const target = event.target;
        const isInteractiveControl =
          target instanceof Element &&
          Boolean(
            target.closest(
              'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          );
        const keyboardEvent =
          event instanceof KeyboardEvent ? event : undefined;
        const allowActivityKeyboardControl =
          isInteractiveControl &&
          keyboardEvent &&
          (keyboardEvent.key === "Tab" ||
            keyboardEvent.key === "Enter" ||
            keyboardEvent.key === " " ||
            keyboardEvent.ctrlKey ||
            keyboardEvent.metaKey ||
            keyboardEvent.altKey);
        const allowInsetActivityScroll =
          (event.type === "touchmove" || event.type === "wheel") &&
          playActivityRef.current !== "keys" &&
          target instanceof Element &&
          Boolean(target.closest(".speech-activity-shell"));

        if (allowActivityKeyboardControl || allowInsetActivityScroll) return;

        event.preventDefault();
        event.stopPropagation();
      }
    };

    const restoreFromTrustedInput = () => {
      if (modeRef.current !== "playing") return;

      if (
        fullscreenWasActiveRef.current &&
        !document.fullscreenElement
      ) {
        void enterFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      if (modeRef.current !== "playing") return;

      const hasFullscreen = Boolean(document.fullscreenElement);
      if (hasFullscreen) fullscreenWasActiveRef.current = true;
      const shouldPause = fullscreenWasActiveRef.current && !hasFullscreen;
      setNeedsFullscreenResume(shouldPause);

      if (hasFullscreen) {
        void (navigator as KeyboardLockNavigator).keyboard?.lock?.();
        void requestWakeLock();
      } else if (shouldPause) {
        sessionRef.current += 1;
        queueRef.current = clearQueue<ResolvedCue>();
        processingRef.current = false;
        activityAudioBusyRef.current = false;
        setActivityAudioBusy(false);
        cancelSound();
        void releaseWakeLock();
        setActiveCard(null);
        setGamePhase("idle");
      }
    };

    const restoreProtection = () => {
      if (modeRef.current !== "playing") return;
      if (document.visibilityState === "visible") {
        void requestWakeLock();
        if (document.fullscreenElement) {
          void (navigator as KeyboardLockNavigator).keyboard?.lock?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", preventInteraction, true);
    window.addEventListener("keypress", preventInteraction, true);
    window.addEventListener("contextmenu", preventInteraction, true);
    window.addEventListener("dragstart", preventInteraction, true);
    window.addEventListener("selectstart", preventInteraction, true);
    window.addEventListener("copy", preventInteraction, true);
    window.addEventListener("cut", preventInteraction, true);
    window.addEventListener("paste", preventInteraction, true);
    window.addEventListener("wheel", preventInteraction, {
      capture: true,
      passive: false,
    });
    window.addEventListener("touchmove", preventInteraction, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointerdown", restoreFromTrustedInput, true);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", restoreProtection);
    window.addEventListener("focus", restoreProtection);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", preventInteraction, true);
      window.removeEventListener("keypress", preventInteraction, true);
      window.removeEventListener("contextmenu", preventInteraction, true);
      window.removeEventListener("dragstart", preventInteraction, true);
      window.removeEventListener("selectstart", preventInteraction, true);
      window.removeEventListener("copy", preventInteraction, true);
      window.removeEventListener("cut", preventInteraction, true);
      window.removeEventListener("paste", preventInteraction, true);
      window.removeEventListener("wheel", preventInteraction, true);
      window.removeEventListener("touchmove", preventInteraction, true);
      window.removeEventListener("pointerdown", restoreFromTrustedInput, true);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", restoreProtection);
      window.removeEventListener("focus", restoreProtection);
      sessionRef.current += 1;
      cancelSound();
      void releaseWakeLock();
    };
  }, [
    cancelSound,
    enterFullscreen,
    exitGame,
    queueKey,
    releaseWakeLock,
    requestWakeLock,
  ]);

  const cancelGuardianHold = useCallback(() => {
    window.clearTimeout(guardianHoldTimerRef.current);
    guardianHoldTimerRef.current = 0;
    setGuardianHolding(false);
  }, []);

  const startGuardianHold = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      window.clearTimeout(guardianHoldTimerRef.current);
      setGuardianHolding(true);
      guardianHoldTimerRef.current = window.setTimeout(() => {
        guardianHoldTimerRef.current = 0;
        setGuardianHolding(false);
        void exitGame();
      }, GUARDIAN_HOLD_TIME);
    },
    [exitGame],
  );

  const openSettings = () => {
    cancelSound();
    setDraftSettings(savedSettingsRef.current);
    setSettingsStep(0);
    setSessionEnded(false);
    setRestoredNotice(false);
    modeRef.current = "settings";
    setMode("settings");
  };

  const closeSettingsToHome = (restoreSavedDraft: boolean) => {
    cancelSound();
    previewRef.current += 1;
    setIsPreviewing(false);
    if (restoreSavedDraft) {
      setDraftSettings(savedSettingsRef.current);
    }
    setSessionEnded(false);
    setRestoredNotice(false);
    modeRef.current = "home";
    setMode("home");
  };

  const cancelSettings = () => {
    closeSettingsToHome(true);
  };

  const previewVoice = async () => {
    previewRef.current += 1;
    const previewId = previewRef.current;
    cancelSound();
    setIsPreviewing(true);
    const cue = describeKey("m", draftSettings.language);
    const example =
      draftSettings.cueMode === "name-sound-word"
        ? letterExamples(draftSettings.language, "M")[0]
        : undefined;
    await playCueAudio(
      cue,
      draftSettings,
      () => previewId === previewRef.current && modeRef.current === "settings",
      undefined,
      example,
    );
    if (previewId === previewRef.current) {
      setIsPreviewing(false);
    }
  };

  const saveAndClose = () => {
    commitSettings(draftSettings);
    closeSettingsToHome(false);
  };

  const updateDraft = <K extends keyof ParentSettings>(
    key: K,
    value: ParentSettings[K],
  ) => {
    if (
      (key === "language" && value !== draftSettings.language) ||
      (key === "cueMode" && value !== draftSettings.cueMode)
    ) {
      setAudioStatus("loading");
    }
    setDraftSettings((current) => ({ ...current, [key]: value }));
    setRestoredNotice(false);
  };

  const restoreDefaults = () => {
    if (
      draftSettings.language !== DEFAULT_SETTINGS.language ||
      draftSettings.cueMode !== DEFAULT_SETTINGS.cueMode
    ) {
      setAudioStatus("loading");
    }
    setDraftSettings({ ...DEFAULT_SETTINGS });
    setRestoredNotice(true);
  };

  const reviewRows = useMemo(() => {
    const draftCopy = COPY[draftSettings.language];
    return [
      [draftCopy.languageReview, draftCopy.languageName],
      [
        draftCopy.cueReview,
        draftSettings.cueMode === "name-and-sound"
          ? draftCopy.summaryNameSound
          : draftSettings.cueMode === "name-sound-word"
            ? draftCopy.summaryNameSoundWord
            : draftCopy.summaryNameOnly,
      ],
      [
        draftCopy.keyScopeReview,
        draftSettings.keyScope === "letters-and-numbers"
          ? draftCopy.summaryLearningKeys
          : draftCopy.summaryAllKeys,
      ],
      [
        draftCopy.timingReview,
        `${draftSettings.imitationTurnMs / 1000} ${draftCopy.seconds}`,
      ],
      [
        draftCopy.repeatsReview,
        draftSettings.maxConsecutivePlays === 2
          ? draftCopy.twice
          : draftCopy.once,
      ],
      [draftCopy.volumeReview, `${Math.round(draftSettings.volume * 100)}%`],
      [
        draftCopy.motionReview,
        draftSettings.motion === "gentle"
          ? draftCopy.summaryGentle
          : draftCopy.summaryStill,
      ],
      [
        draftCopy.movementReview,
        `${draftSettings.animationMovementPercent}%`,
      ],
      [
        draftCopy.themeReview,
        THEMES[draftSettings.theme].name[draftSettings.language],
      ],
    ];
  }, [draftSettings]);

  if (mode === "playing") {
    const gameCopy = COPY[sessionSettings.language];
    const touchPages = touchGardenPages(sessionSettings.language);
    const touchGardenPageCount = touchPages.length;
    const touchGardenKeys = touchPages[touchGardenPage] ?? touchPages[0];

    return (
      <main
        className={`game-screen motion-${sessionSettings.motion} ${
          hasTouchControls ? "has-touch-controls" : ""
        } ${
          playActivity !== "keys" ? "is-speech-activity" : ""
        }`}
        data-phase={gamePhase}
        data-theme={sessionSettings.theme}
        data-testid="game-screen"
        aria-label={gameCopy.gameLabel}
        style={themeVariables(sessionSettings.theme)}
      >
        <ThemeScenery
          movementPercent={sessionSettings.animationMovementPercent}
          theme={sessionSettings.theme}
        />
        <h1 className="sr-only">{gameCopy.gameLabel}</h1>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {activeCard
            ? `${activeCard.cue.spoken}${
                activeCard.example ? `. ${activeCard.example.word}` : ""
              }`
            : ""}
        </p>
        {needsFullscreenResume ? (
          <div className="fullscreen-resume" role="status" aria-live="assertive">
            <div className="fullscreen-resume-card">
              <strong>{gameCopy.resumeFullscreen}</strong>
              <span>{gameCopy.resumeFullscreenHelp}</span>
            </div>
          </div>
        ) : null}
        {hasTouchControls ? (
          <button
            className={`guardian-exit ${
              guardianHolding ? "is-holding" : ""
            }`}
            type="button"
            aria-label={gameCopy.guardianHold}
            onPointerDown={startGuardianHold}
            onPointerUp={cancelGuardianHold}
            onPointerCancel={cancelGuardianHold}
            onPointerLeave={cancelGuardianHold}
            onContextMenu={(event) => event.preventDefault()}
            onClick={(event) => {
              event.preventDefault();
              if (event.detail === 0) void exitGame();
            }}
          >
            <span aria-hidden="true">●</span>
            {gameCopy.guardianHold}
          </button>
        ) : null}
        {playActivity === "keys" && activeCard ? (
          <div
            key={activeCard.renderId}
            className={`key-positioner ${
              activeCard.cue.isWord ? "is-word" : ""
            } ${activeCard.example ? "has-example" : ""} ${
              activeCard.number ? "has-number" : ""
            }`}
            style={
              {
                "--key-x": `${activeCard.placement.xVw}vw`,
                "--key-y": `${activeCard.placement.yVh}vh`,
                "--key-color":
                  THEMES[sessionSettings.theme].colors[
                    activeCard.cue.colorSlot
                  ],
                "--key-glow": keyGlow(
                  sessionSettings.theme,
                  activeCard.cue.colorSlot,
                ),
              } as CSSProperties
            }
            data-placement-x={activeCard.placement.xVw}
            data-placement-y={activeCard.placement.yVh}
          >
            {activeCard.number ? (
              <div
                className={`number-example-layout is-${gamePhase}`}
                data-testid="active-key"
              >
                <div className="key-display with-example" aria-hidden="true">
                  {activeCard.number.digit}
                </div>
                <NumberHandDoodle
                  className="number-hand-card"
                  digit={activeCard.number.digit}
                  language={activeCard.number.language}
                />
              </div>
            ) : activeCard.example ? (
              <div
                className={`letter-example-layout is-${gamePhase}`}
                aria-hidden="true"
                data-testid="active-key"
              >
                <div className="key-display with-example">
                  {activeCard.cue.display}
                </div>
                <ExampleDoodle example={activeCard.example} />
              </div>
            ) : (
              <div
                className={`key-display ${
                  activeCard.cue.isWord ? "is-word" : ""
                } is-${gamePhase}`}
                aria-hidden="true"
                data-testid="active-key"
              >
                {activeCard.cue.display}
              </div>
            )}
          </div>
        ) : null}
        {playActivity !== "keys" ? (
          <div className="speech-activity-shell">
            {playActivity === "talk-point" && familiarWord ? (
              <FamiliarWordActivity
                item={familiarWord}
                disabled={activityAudioBusy}
                onHear={hearFamiliarWord}
                onNext={showNextFamiliarWord}
              />
            ) : null}
            {playActivity === "find-it" && twoChoiceRound ? (
              <TwoChoicePrompt
                round={twoChoiceRound}
                selectedId={selectedChoiceId}
                disabled={activityAudioBusy}
                onChoose={chooseFamiliarWord}
                onHearPrompt={hearTwoChoicePrompt}
                onNext={showNextTwoChoiceRound}
              />
            ) : null}
          </div>
        ) : null}
        {hasTouchControls && playActivity === "keys" ? (
          <div className="touch-garden-shell" data-testid="touch-letter-garden">
            <div className="touch-garden-heading">
              <p>{gameCopy.touchPrompt}</p>
              <span
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`${gameCopy.bubblePage} ${touchGardenPage + 1} / ${touchGardenPageCount}: ${touchGardenKeys.join(", ")}`}
              >
                {touchGardenPage + 1} / {touchGardenPageCount}
              </span>
            </div>
            <div
              className="touch-letter-garden"
              role="group"
              aria-label={gameCopy.touchPrompt}
            >
              {touchGardenKeys.map((key) => (
                <button
                  key={`${touchGardenPage}-${key}`}
                  className="touch-letter-bubble"
                  type="button"
                  aria-label={key}
                  data-touch-key={key}
                  disabled={gamePhase !== "idle"}
                  onClick={() => queueKey(key)}
                >
                  <span aria-hidden="true">{key}</span>
                </button>
              ))}
            </div>
            <button
              className="touch-garden-more"
              type="button"
              disabled={gamePhase !== "idle"}
              onClick={() =>
                setTouchGardenPage(
                  (current) => (current + 1) % touchGardenPageCount,
                )
              }
            >
              <span aria-hidden="true">✦</span>
              {gameCopy.newBubbles}
            </button>
          </div>
        ) : null}
      </main>
    );
  }

  if (mode === "home") {
    const homeCopy = COPY[savedSettings.language];
    const voicesLoading = audioStatus === "loading";

    return (
      <main
        ref={parentShellRef}
        className={`parent-shell home-shell motion-${savedSettings.motion}`}
        data-theme={savedSettings.theme}
        data-testid="home-screen"
        style={themeVariables(savedSettings.theme)}
      >
        <ThemeScenery
          movementPercent={savedSettings.animationMovementPercent}
          theme={savedSettings.theme}
        />
        <button
          className="settings-icon-button"
          type="button"
          aria-label={homeCopy.parentSettings}
          title={homeCopy.parentSettings}
          onClick={openSettings}
          data-testid="open-settings"
        >
          <GearSix aria-hidden="true" weight="bold" />
        </button>
        <section className="home-card" aria-labelledby="home-title">
          <div className="brand-kicker">
            <Image
              className="brand-mark"
              src="/brand/type-learn-mark.png"
              alt=""
              aria-hidden="true"
              width="1024"
              height="1024"
              sizes="(max-width: 700px) 58px, 76px"
              priority
            />
            <p className="eyebrow">{homeCopy.homeEyebrow}</p>
          </div>
          <h1 id="home-title">
            <span>{homeCopy.brandStart}</span>
            <span className="accent-word">{homeCopy.brandAccent}</span>
            <span>{homeCopy.brandEnd}</span>
          </h1>
          <p className="home-promise">
            <span>{homeCopy.homeTitleStart}</span>
            <span className="accent-word">{homeCopy.homeTitleAccent}</span>
            <span>{homeCopy.homeTitleEnd}</span>
          </p>
          <p className="intro">{homeCopy.homeIntro}</p>

          {sessionEnded ? (
            <p className="home-session-note" role="status">
              {homeCopy.sessionEnded}
            </p>
          ) : null}

          <p className="activity-picker-label" role="status">
            {voicesLoading
              ? homeCopy.preparing
              : homeCopy.activityPickerLabel}
          </p>
          <div
            className="activity-picker"
            role="group"
            aria-label={homeCopy.activityPickerLabel}
            aria-busy={voicesLoading}
          >
            <button
              className="activity-card is-letters"
              type="button"
              onClick={() =>
                void startGame(savedSettingsRef.current, "keys")
              }
              data-testid="start-game"
            >
              <span className="activity-glyph" aria-hidden="true">
                Aa · 4
              </span>
              <strong>{homeCopy.letterPlayTitle}</strong>
              <small>{homeCopy.letterPlayHelp}</small>
            </button>
            <button
              className="activity-card is-talk-point"
              type="button"
              onClick={() =>
                void startGame(savedSettingsRef.current, "talk-point")
              }
              data-testid="start-talk-point"
            >
              <span className="activity-glyph is-emoji" aria-hidden="true">
                🐶
              </span>
              <strong>{homeCopy.talkPointTitle}</strong>
              <small>{homeCopy.talkPointHelp}</small>
            </button>
            <button
              className="activity-card is-find-it"
              type="button"
              onClick={() =>
                void startGame(savedSettingsRef.current, "find-it")
              }
              data-testid="start-find-it"
            >
              <span
                className="activity-glyph is-emoji is-pair"
                aria-hidden="true"
              >
                <span>🐱</span>
                <span>🐶</span>
              </span>
              <strong>{homeCopy.findItTitle}</strong>
              <small>{homeCopy.findItHelp}</small>
            </button>
          </div>
          {hasTouchControls === true ? (
            <p className="home-exit-note" data-testid="touch-exit-help">
              {homeCopy.touchExitHelp}
            </p>
          ) : hasTouchControls === false ? (
            <p className="home-exit-note" data-testid="keyboard-exit-help">
              <span>{homeCopy.exitHelp.split("PARENT")[0]}</span>
              <kbd>PARENT</kbd>
              <span>{homeCopy.exitHelp.split("PARENT")[1]}</span>
            </p>
          ) : null}

          <aside className="co-play-note">
            <p className="note-title">{homeCopy.togetherTitle}</p>
            <p>{homeCopy.togetherBody}</p>
          </aside>

          {hasTouchControls ? (
            <aside className="co-play-note mobile-play-note">
              <p className="note-title">{homeCopy.mobilePlayTitle}</p>
              <p>{homeCopy.mobilePlayBody}</p>
            </aside>
          ) : null}

          <footer className="home-footer">
            <p className="made-with-love">
              Created with{" "}
              <span className="solid-heart" role="img" aria-label="love">
                ♥
              </span>
              {" "}for Nico &amp; Mateo
            </p>
          </footer>
        </section>
      </main>
    );
  }

  const voicesLoading = audioStatus === "loading";

  return (
    <main
      ref={parentShellRef}
      className={`parent-shell settings-shell motion-${draftSettings.motion}`}
      data-theme={draftSettings.theme}
      data-testid="settings-screen"
      style={themeVariables(draftSettings.theme)}
    >
      <ThemeScenery
        movementPercent={draftSettings.animationMovementPercent}
        theme={draftSettings.theme}
      />
      <section className="settings-card" aria-labelledby="settings-title">
        <header className="settings-header">
          <div>
            <p className="eyebrow">FOR GROWN-UPS · PARA ADULTOS</p>
            <h1 id="settings-title">{copy.settingsTitle}</h1>
            <p>{copy.settingsIntro}</p>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={cancelSettings}
          >
            {copy.cancel}
          </button>
        </header>

        <nav
          className="stepper"
          aria-label={
            activeLanguage === "es-419"
              ? "Progreso de los ajustes"
              : "Settings progress"
          }
        >
          {STEP_KEYS.map((step, index) => (
            <button
              key={step}
              type="button"
              className={index === settingsStep ? "is-current" : ""}
              aria-current={index === settingsStep ? "step" : undefined}
              onClick={() => setSettingsStep(index)}
            >
              <span>{index + 1}</span>
              {copy[step]}
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {settingsStep === 0 ? (
            <section aria-labelledby="sound-heading">
              <div className="section-heading">
                <p className="step-kicker">01</p>
                <div>
                  <h2
                    id="sound-heading"
                    ref={activeSettingsHeadingRef}
                    tabIndex={-1}
                  >
                    {copy.sound}
                  </h2>
                  <p>{copy.languageHelp}</p>
                </div>
              </div>

              <fieldset className="setting-group">
                <legend>{copy.languageLabel}</legend>
                <div className="choice-grid choice-grid-two">
                  {(["en-US", "es-419"] as const).map((language) => (
                    <button
                      key={language}
                      type="button"
                      className="choice-card"
                      aria-pressed={draftSettings.language === language}
                      onClick={() => updateDraft("language", language)}
                    >
                      <strong>
                        {language === "en-US" ? "English" : "Español"}
                      </strong>
                      <span>
                        {language === "en-US"
                          ? "American English"
                          : "Latinoamericano neutral"}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="setting-group">
                <legend>{copy.cueLabel}</legend>
                <div className="choice-grid choice-grid-three">
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={draftSettings.cueMode === "name-and-sound"}
                    onClick={() =>
                      updateDraft("cueMode", "name-and-sound")
                    }
                  >
                    <strong>{copy.cueSound}</strong>
                    <span>{copy.cueSoundHelp}</span>
                  </button>
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={draftSettings.cueMode === "name-only"}
                    onClick={() => updateDraft("cueMode", "name-only")}
                  >
                    <strong>{copy.cueName}</strong>
                    <span>{copy.cueNameHelp}</span>
                  </button>
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={draftSettings.cueMode === "name-sound-word"}
                    onClick={() =>
                      updateDraft("cueMode", "name-sound-word")
                    }
                  >
                    <strong>{copy.cueWord}</strong>
                    <span>{copy.cueWordHelp}</span>
                  </button>
                </div>
              </fieldset>

              <fieldset className="setting-group">
                <legend>{copy.keyScopeLabel}</legend>
                <div className="choice-grid choice-grid-two">
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={
                      draftSettings.keyScope === "letters-and-numbers"
                    }
                    onClick={() =>
                      updateDraft("keyScope", "letters-and-numbers")
                    }
                  >
                    <strong>{copy.learningKeys}</strong>
                    <span>{copy.learningKeysHelp}</span>
                  </button>
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={draftSettings.keyScope === "all-keys"}
                    onClick={() => updateDraft("keyScope", "all-keys")}
                  >
                    <strong>{copy.allKeys}</strong>
                    <span>{copy.allKeysHelp}</span>
                  </button>
                </div>
              </fieldset>

              <div className="setting-group">
                <div className="range-heading">
                  <label htmlFor="voice-volume">{copy.volumeLabel}</label>
                  <output htmlFor="voice-volume">
                    {Math.round(draftSettings.volume * 100)}%
                  </output>
                </div>
                <input
                  id="voice-volume"
                  className="volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(draftSettings.volume * 100)}
                  onChange={(event) =>
                    updateDraft("volume", Number(event.target.value) / 100)
                  }
                />
                <div className="preview-row">
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={voicesLoading || isPreviewing}
                    onClick={() => void previewVoice()}
                  >
                    {isPreviewing ? copy.previewing : copy.preview}
                  </button>
                  <span className={`audio-status is-${audioStatus}`}>
                    {audioStatus === "loading"
                      ? copy.loadingVoice
                      : audioStatus === "ready"
                        ? draftSettings.cueMode === "name-sound-word"
                          ? copy.pictureWordsReady
                          : copy.studioReady
                        : copy.fallbackReady}
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          {settingsStep === 1 ? (
            <section aria-labelledby="pace-heading">
              <div className="section-heading">
                <p className="step-kicker">02</p>
                <div>
                  <h2
                    id="pace-heading"
                    ref={activeSettingsHeadingRef}
                    tabIndex={-1}
                  >
                    {copy.pace}
                  </h2>
                  <p>{copy.imitationHelp}</p>
                </div>
              </div>

              <fieldset className="setting-group">
                <legend>{copy.imitationLabel}</legend>
                <div className="choice-grid choice-grid-three">
                  {([2000, 3000, 5000] as const).map((milliseconds) => (
                    <button
                      key={milliseconds}
                      type="button"
                      className="choice-card choice-card-compact"
                      aria-pressed={
                        draftSettings.imitationTurnMs === milliseconds
                      }
                      onClick={() =>
                        updateDraft("imitationTurnMs", milliseconds)
                      }
                    >
                      <strong>{milliseconds / 1000}</strong>
                      <span>{copy.seconds}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="setting-group">
                <legend>{copy.repetitionLabel}</legend>
                <div className="choice-grid choice-grid-two">
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={
                      draftSettings.maxConsecutivePlays === 1
                    }
                    onClick={() => updateDraft("maxConsecutivePlays", 1)}
                  >
                    <strong>{copy.sayOnce}</strong>
                  </button>
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={
                      draftSettings.maxConsecutivePlays === 2
                    }
                    onClick={() => updateDraft("maxConsecutivePlays", 2)}
                  >
                    <strong>{copy.sayTwice}</strong>
                  </button>
                </div>
                <p className="setting-help">{copy.queueHelp}</p>
              </fieldset>
            </section>
          ) : null}

          {settingsStep === 2 ? (
            <section aria-labelledby="look-heading">
              <div className="section-heading">
                <p className="step-kicker">03</p>
                <div>
                  <h2
                    id="look-heading"
                    ref={activeSettingsHeadingRef}
                    tabIndex={-1}
                  >
                    {copy.look}
                  </h2>
                  <p>{copy.lookHelp}</p>
                </div>
              </div>

              <fieldset className="setting-group">
                <legend>{copy.themeLabel}</legend>
                <p className="setting-help theme-help">{copy.themeHelp}</p>
                <div className="theme-choice-grid">
                  {THEME_IDS.map((themeId) => {
                    const theme = THEMES[themeId];
                    const isSelected = draftSettings.theme === themeId;

                    return (
                      <button
                        key={themeId}
                        type="button"
                        className="theme-choice"
                        data-theme={themeId}
                        style={themeVariables(themeId)}
                        aria-pressed={isSelected}
                        onClick={() => updateDraft("theme", themeId)}
                      >
                        <ThemeMiniature theme={themeId} />
                        <strong>{theme.name[draftSettings.language]}</strong>
                        <span>
                          {theme.description[draftSettings.language]}
                        </span>
                        <span className="theme-selected">
                          {isSelected
                            ? draftSettings.language === "es-419"
                              ? "Seleccionado"
                              : "Selected"
                            : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="setting-group">
                <legend>{copy.motionLabel}</legend>
                <div className="choice-grid choice-grid-two">
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={draftSettings.motion === "gentle"}
                    onClick={() => updateDraft("motion", "gentle")}
                  >
                    <strong>{copy.gentle}</strong>
                    <span>{copy.gentleHelp}</span>
                  </button>
                  <button
                    type="button"
                    className="choice-card"
                    aria-pressed={draftSettings.motion === "still"}
                    onClick={() => updateDraft("motion", "still")}
                  >
                    <strong>{copy.still}</strong>
                    <span>{copy.stillHelp}</span>
                  </button>
                </div>
              </fieldset>

              <div className="setting-group">
                <div className="range-heading">
                  <label htmlFor="doodle-movement">
                    {copy.movementLabel}
                  </label>
                  <output htmlFor="doodle-movement">
                    {draftSettings.animationMovementPercent}%
                  </output>
                </div>
                <input
                  id="doodle-movement"
                  className="volume-slider"
                  type="range"
                  min={ANIMATION_MOVEMENT_MIN}
                  max={ANIMATION_MOVEMENT_MAX}
                  step={ANIMATION_MOVEMENT_STEP}
                  value={draftSettings.animationMovementPercent}
                  aria-describedby="doodle-movement-help"
                  aria-valuetext={`${draftSettings.animationMovementPercent}%`}
                  onChange={(event) =>
                    updateDraft(
                      "animationMovementPercent",
                      Number(event.target.value),
                    )
                  }
                />
                <p
                  className="setting-help"
                  id="doodle-movement-help"
                >
                  {copy.movementHelp}
                </p>
              </div>
            </section>
          ) : null}

          {settingsStep === 3 ? (
            <section aria-labelledby="review-heading">
              <div className="section-heading">
                <p className="step-kicker">04</p>
                <div>
                  <h2
                    id="review-heading"
                    ref={activeSettingsHeadingRef}
                    tabIndex={-1}
                  >
                    {copy.reviewTitle}
                  </h2>
                  <p>{copy.reviewHelp}</p>
                </div>
              </div>

              <dl className="review-list">
                {reviewRows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <button
                className="text-button restore-button"
                type="button"
                onClick={restoreDefaults}
              >
                {copy.restore}
              </button>
              {restoredNotice ? (
                <p className="restored-notice" role="status">
                  {copy.restored}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        <footer className="settings-footer">
          <div>
            {settingsStep > 0 ? (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setSettingsStep((step) => step - 1)}
              >
                {copy.back}
              </button>
            ) : (
              <span />
            )}
          </div>

          {settingsStep < 3 ? (
            <button
              className="button button-primary"
              type="button"
              onClick={() => setSettingsStep((step) => step + 1)}
            >
              {copy.next}
            </button>
          ) : (
            <div className="review-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={saveAndClose}
                data-testid="save-and-close"
              >
                {copy.saveClose}
              </button>
            </div>
          )}
        </footer>

      </section>
    </main>
  );
}
