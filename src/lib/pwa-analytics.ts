/**
 * PWA Analytics Tracker
 *
 * Offline-resilient event tracker that batches events in localStorage
 * and flushes them to /api/pwa-events periodically or when back online.
 *
 * Usage:
 *   import { trackPwaEvent } from "@/lib/pwa-analytics";
 *   trackPwaEvent("checkin_completed", { type: "quick", stress: 7 });
 *
 * This is a plain module export, NOT a React hook. It works anywhere.
 * All errors are silently caught — analytics must never crash the app.
 */

const QUEUE_KEY = "lura-pwa-events";
const SESSION_KEY = "lura-pwa-session-id";
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const FLUSH_THRESHOLD = 10; // flush when queue reaches 10 events

// --- Types ---

interface QueuedEvent {
  event_name: string;
  event_data: Record<string, unknown>;
  session_id: string;
  timestamp: string;
}

// --- Session ID ---

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage unavailable (SSR, private browsing edge cases)
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

// --- Queue helpers ---

function readQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(events: QueuedEvent[]): void {
  try {
    if (events.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(events));
    }
  } catch {
    // localStorage full or unavailable — silently drop
  }
}

// --- Flush ---

let lastFlushTime = Date.now();
let isFlushing = false;

async function flushQueue(): Promise<void> {
  if (isFlushing) return;

  const queue = readQueue();
  if (queue.length === 0) return;

  isFlushing = true;

  try {
    // Clear queue immediately to prevent double-send
    writeQueue([]);

    const response = await fetch("/api/pwa-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: queue }),
      // keepalive allows the request to outlive the page
      keepalive: true,
    });

    if (!response.ok) {
      // Put events back in queue on failure
      const currentQueue = readQueue();
      writeQueue([...queue, ...currentQueue]);
    }
  } catch {
    // Network error — put events back in queue
    try {
      const currentQueue = readQueue();
      writeQueue([...queue, ...currentQueue]);
    } catch {
      // Total failure — events are lost, that is acceptable for analytics
    }
  } finally {
    isFlushing = false;
    lastFlushTime = Date.now();
  }
}

function shouldFlush(queueLength: number): boolean {
  if (queueLength >= FLUSH_THRESHOLD) return true;
  if (Date.now() - lastFlushTime >= FLUSH_INTERVAL_MS) return true;
  return false;
}

// --- Public API ---

/**
 * Track a PWA event. Non-blocking, never throws.
 *
 * @param eventName - Event identifier (e.g. "checkin_completed", "breathing_finished")
 * @param eventData - Optional metadata object
 */
export function trackPwaEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  try {
    if (typeof window === "undefined") return;

    const event: QueuedEvent = {
      event_name: eventName,
      event_data: eventData ?? {},
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
    };

    const queue = readQueue();
    queue.push(event);
    writeQueue(queue);

    if (shouldFlush(queue.length)) {
      // Fire and forget — do not await
      flushQueue();
    }
  } catch {
    // Analytics must never crash the app
  }
}

/**
 * Force flush any queued events immediately.
 * Useful for critical moments (e.g. before navigation).
 */
export function flushPwaEvents(): void {
  try {
    flushQueue();
  } catch {
    // Silently ignore
  }
}

// --- Auto-initialization ---
// This runs when the module is first imported in a browser context.
// Guard against HMR re-registration by storing interval ID on window.

if (typeof window !== "undefined") {
  try {
    // Clear any previous interval from HMR
    const win = window as unknown as Record<string, unknown>;
    const prevInterval = win.__lura_analytics_interval as ReturnType<typeof setInterval> | undefined;
    if (prevInterval) clearInterval(prevInterval);

    // Periodic flush every 30 seconds
    const intervalId = setInterval(() => {
      try {
        flushQueue();
      } catch {
        // Silently ignore
      }
    }, FLUSH_INTERVAL_MS);
    win.__lura_analytics_interval = intervalId;

    // Flush when coming back online
    window.addEventListener("online", () => {
      try {
        flushQueue();
      } catch {
        // Silently ignore
      }
    });

    // Flush before page unload (with keepalive)
    window.addEventListener("beforeunload", () => {
      try {
        flushQueue();
      } catch {
        // Silently ignore
      }
    });

    // Flush on visibility change (tab becoming hidden)
    document.addEventListener("visibilitychange", () => {
      try {
        if (document.visibilityState === "hidden") {
          flushQueue();
        }
      } catch {
        // Silently ignore
      }
    });

    // Flush any leftover events from previous session on startup
    const leftover = readQueue();
    if (leftover.length > 0) {
      flushQueue();
    }
  } catch {
    // Auto-init failure is not critical
  }
}
