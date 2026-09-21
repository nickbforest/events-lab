import { describe, expect, it, vi } from "vitest";

import type { ProfileUpdateInput } from "@/features/profiles/contracts";
import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import type { Profile } from "@/lib/types";

import { createProfilesService } from "./profiles-service";

const storedProfile: Profile = {
  id: "owner-1",
  username: "nickb",
  display_name: "Nick B",
  publisher_type: "artist",
  bio: null,
  avatar_url: null,
  cover_url: null,
  website_url: null,
  city: null,
  country_code: null,
  social_links: {},
};

function createRepository(
  overrides: Partial<ProfilesRepository> = {},
): ProfilesRepository {
  return {
    findById: vi.fn(async () => null),
    findByUsername: vi.fn(async () => null),
    isUsernameTaken: vi.fn(async () => false),
    update: vi.fn(async () => storedProfile),
    ...overrides,
  };
}

const updateInput: ProfileUpdateInput = {
  displayName: "Nick B",
  publisherType: "artist",
  bio: null,
  city: null,
  countryCode: null,
  websiteUrl: null,
  socialLinks: {
    twitter: "https://twitter.com/nickb",
    instagram: null,
    facebook: null,
    youtube: null,
    soundcloud: null,
    spotify: null,
    apple_music: null,
  },
};

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

describe("updateProfile", () => {
  it("writes against the session owner, not anything in the payload", async () => {
    const repository = createRepository();
    const service = createProfilesService(repository);

    await service.updateProfile("owner-1", updateInput);

    expect(repository.update).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({ display_name: "Nick B" }),
    );
  });

  it("drops cleared links instead of storing them as null", async () => {
    const repository = createRepository();
    const service = createProfilesService(repository);

    await service.updateProfile("owner-1", updateInput);

    const [, patch] = vi.mocked(repository.update).mock.calls[0];
    expect(patch.social_links).toEqual({
      twitter: "https://twitter.com/nickb",
    });
  });

  it("never writes username, so a public URL cannot change under a shared link", async () => {
    const repository = createRepository();
    const service = createProfilesService(repository);

    await service.updateProfile("owner-1", updateInput);

    const [, patch] = vi.mocked(repository.update).mock.calls[0];
    expect(patch).not.toHaveProperty("username");
  });
});
