import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Tracks a page_view on mount and a page_exit (with dwell_ms) on unmount.
 *
 * @param page   Stable page name, e.g. "search", "results", "product_detail"
 * @param meta   Optional extra properties forwarded to both events
 */
export function usePageView(
  page: string,
  meta?: Record<string, unknown>
): void {
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    track("page_view", { page, properties: meta });

    return () => {
      track("page_exit", {
        page,
        dwell_ms: Date.now() - startRef.current,
        properties: meta,
      });
    };
    // Only re-run if the page identifier changes (it shouldn't)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
}
