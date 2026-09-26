import { verifySession } from "@/features/auth/queries";
import { listEventCategories } from "@/features/events/queries";

import { EventForm } from "../event-form";

export default async function NewEventPage() {
  await verifySession();
  const categories = await listEventCategories();

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            Create
          </div>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tighter md:text-4xl">
            New event
          </h1>
        </div>

        <EventForm categories={categories} />
      </div>
    </div>
  );
}
