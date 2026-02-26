/**
 * Haptic feedback utility for native-feel interactions.
 * Falls back silently on devices without vibration support.
 */
export const haptic = {
  /** Light tap — tab switches, toggle, minor interactions */
  light: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  /** Medium tap — button press, slider snap */
  medium: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  /** Success pattern — save confirmed, check-in complete */
  success: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([15, 50, 20]);
    }
  },
  /** Error pattern — validation failed */
  error: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 50, 30, 50, 30]);
    }
  },
};
