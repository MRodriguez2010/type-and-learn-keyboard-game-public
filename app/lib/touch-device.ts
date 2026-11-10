export type TouchDeviceHints = {
  userAgent: string;
  maxTouchPoints: number;
  mobileHint?: boolean;
  coarsePointer?: boolean;
};

const MOBILE_DEVICE_USER_AGENT = /Android|iPhone|iPad|iPod/i;
const MACINTOSH_USER_AGENT = /Macintosh/i;

export function shouldUseOnScreenKeyboard({
  userAgent,
  maxTouchPoints,
  mobileHint = false,
  coarsePointer = false,
}: TouchDeviceHints) {
  if (MOBILE_DEVICE_USER_AGENT.test(userAgent)) {
    return true;
  }

  // iPadOS can request desktop websites and identify itself as a Macintosh.
  if (MACINTOSH_USER_AGENT.test(userAgent) && maxTouchPoints > 1) {
    return true;
  }

  if (coarsePointer && maxTouchPoints > 0) {
    return true;
  }

  return mobileHint && maxTouchPoints > 0;
}
