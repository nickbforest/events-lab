import { describe, expect, it, vi } from "vitest";

import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";

import { createProfilesService } from "./profiles-service";

function createRepository(
  overrides: Partial<ProfilesRepository> = {},
): ProfilesRepository {
  return {
    findById: vi.fn(async () => null),
    findByUsername: vi.fn(async () => null),
    isUsernameTaken: vi.fn(async () => false),
    listProfiles: vi.fn(async () => []),
    ...overrides,
  };
}

describe("isUsernameAvailable", () => {
  it("accepts a free username", async () => {
    const service = createProfilesService(createRepository());
    await expect(service.isUsernameAvailable("nick")).resolves.toBe(true);
  });

  it("rejects one already in the table", async () => {
    const service = createProfilesService(
      createRepository({ isUsernameTaken: vi.fn(async () => true) }),
    );
    await expect(service.isUsernameAvailable("nick")).resolves.toBe(false);
  });

  it.each(["admin", "support", "dashboard", "api", "events-lab"])(
    "holds back the reserved name %j without querying",
    async (username) => {
      const repository = createRepository();
      const service = createProfilesService(repository);

      await expect(service.isUsernameAvailable(username)).resolves.toBe(false);
      expect(repository.isUsernameTaken).not.toHaveBeenCalled();
    },
  );
});
