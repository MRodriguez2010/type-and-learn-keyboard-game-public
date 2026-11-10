export type QueueValue = {
  identity: string;
};

export type QueueRun<T extends QueueValue> = {
  value: T;
  playsRemaining: 1 | 2;
};

export type QueueState<T extends QueueValue> = {
  current: QueueRun<T> | null;
  pending: QueueRun<T> | null;
  lastInputIdentity: string | null;
  consecutiveInputs: 0 | 1 | 2;
};

export type QueueCompletion<T extends QueueValue> = {
  state: QueueState<T>;
  next: T | null;
};

export function createQueueState<T extends QueueValue>(): QueueState<T> {
  return {
    current: null,
    pending: null,
    lastInputIdentity: null,
    consecutiveInputs: 0,
  };
}

export function acceptCue<T extends QueueValue>(
  state: QueueState<T>,
  value: T,
  maximumPlays: 1 | 2,
): QueueState<T> {
  const isConsecutive = state.lastInputIdentity === value.identity;
  const consecutiveInputs = isConsecutive
    ? state.consecutiveInputs
    : (0 as const);

  if (isConsecutive && consecutiveInputs >= maximumPlays) {
    return state;
  }

  const nextInputState = {
    lastInputIdentity: value.identity,
    consecutiveInputs: (consecutiveInputs + 1) as 1 | 2,
  };

  if (!state.current) {
    return {
      current: { value, playsRemaining: 1 },
      pending: null,
      ...nextInputState,
    };
  }

  if (state.current.value.identity === value.identity) {
    if (state.current.playsRemaining >= maximumPlays) {
      return state;
    }

    return {
      current: {
        value,
        playsRemaining: 2,
      },
      pending: null,
      ...nextInputState,
    };
  }

  if (state.pending?.value.identity === value.identity) {
    if (state.pending.playsRemaining >= maximumPlays) {
      return state;
    }

    return {
      ...state,
      ...nextInputState,
      pending: {
        value,
        playsRemaining: 2,
      },
    };
  }

  return {
    ...state,
    ...nextInputState,
    pending: {
      value,
      playsRemaining: 1,
    },
  };
}

export function completeCurrent<T extends QueueValue>(
  state: QueueState<T>,
): QueueCompletion<T> {
  if (!state.current) {
    return { state, next: null };
  }

  if (state.current.playsRemaining === 2) {
    return {
      state: {
        ...state,
        current: {
          ...state.current,
          playsRemaining: 1,
        },
      },
      next: state.current.value,
    };
  }

  if (!state.pending) {
    return {
      state: {
        ...state,
        current: null,
        pending: null,
      },
      next: null,
    };
  }

  const next = state.pending.value;

  return {
    state: {
      ...state,
      current: state.pending,
      pending: null,
    },
    next,
  };
}

export function clearQueue<T extends QueueValue>(): QueueState<T> {
  return createQueueState<T>();
}
