import Link from "next/link";

import {
  StatusMessage,
  statusPrimaryActionClass,
} from "@/components/ui/status-message";
import { routes } from "@/lib/routes";

/**
 * An event id that does not exist or belongs to someone else — the two are
 * deliberately indistinguishable. Rendered inside the dashboard shell.
 */
export default function DashboardNotFound() {
  return (
    <StatusMessage
      size="panel"
      kicker="404"
      title="Not found"
      description="That event does not exist, or it has been deleted."
      actions={
        <Link
          href={routes.dashboard.events()}
          className={statusPrimaryActionClass}
        >
          Back to your events
        </Link>
      }
    />
  );
}
