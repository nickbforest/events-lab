"use client";

import type { ReactNode } from "react";

import { reportHit } from "@/features/analytics/transport";

export interface TicketLinkProps {
  href: string;
  username: string;
  eventId: string;
  className?: string;
  children: ReactNode;
}

/**
 * The ticket button's link, counting the click on the way out.
 *
 * Still an ordinary anchor to the publisher's provider — shareable, works
 * without JavaScript, opens in a new tab. The tab switch leaves this page
 * alive, so the report has time to finish; with scripts off the click still
 * goes through and is simply not counted.
 */
export function TicketLink({
  href,
  username,
  eventId,
  className,
  children,
}: TicketLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        void reportHit({ metric: "ticket_click", username, eventId });
      }}
    >
      {children}
    </a>
  );
}
