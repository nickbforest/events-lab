export const queryKeys = {
  analytics: {
    all: ["analytics"] as const,
    overview: (range: string) => ["analytics", "overview", range] as const,
  },
  discovery: {
    all: ["discovery"] as const,
    events: (filters: Readonly<Record<string, unknown>>) =>
      ["discovery", "events", filters] as const,
  },
  events: {
    all: ["events"] as const,
    detail: (username: string, slug: string) =>
      ["events", "detail", username, slug] as const,
    owned: ["events", "owned"] as const,
  },
  profiles: {
    all: ["profiles"] as const,
    detail: (username: string) => ["profiles", "detail", username] as const,
    usernameAvailability: (username: string) =>
      ["profiles", "username-availability", username] as const,
  },
} as const;
