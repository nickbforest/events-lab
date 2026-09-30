"use client";

import { useEffect } from "react";

import { reportHit } from "@/features/analytics/transport";

export interface TrackViewProps {
  username: string;
  /** The event being viewed; omit on the publisher page itself. */
  eventId?: string;
}

/**
 * Counts one view of a public page. Renders nothing.
 *
 * Runs in the browser after the page is shown, so crawlers that do not run
 * scripts and link prefetches are not counted, and a slow analytics call can
 * never delay the page. Leave it out of previews rather than passing a flag:
 * a page the publisher is checking is not a visit.
 */
export function TrackView({ username, eventId }: TrackViewProps) {
  useEffect(() => {
    void reportHit({
      metric: "page_view",
      username,
      eventId: eventId ?? null,
    });
  }, [username, eventId]);

  return null;
}
