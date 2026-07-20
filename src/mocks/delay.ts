import { delay } from "@/lib/delay";

/** Simulate network latency for mock API calls. */
export function simulateNetwork(ms = 400): Promise<void> {
  return delay(ms);
}

export { delay };
