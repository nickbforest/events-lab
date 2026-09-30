import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  StatusMessage,
  statusPrimaryActionClass,
} from "@/components/ui/status-message";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Any unknown URL, and every `notFound()` on a public page — a publisher that
 * does not exist, or an event that is a draft, unpublished or deleted. The
 * wording covers all of them without saying which, so a hidden event cannot
 * be told apart from one that never existed.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <StatusMessage
          kicker="404"
          title="Page not found"
          description="This page does not exist, or its publisher has taken it down. Check the link, or start again from the home page."
          actions={
            <Link href={routes.home()} className={statusPrimaryActionClass}>
              Go to the home page
            </Link>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
