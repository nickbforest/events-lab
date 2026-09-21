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
    uploadMedia: vi.fn(async () => ({
      path: "owner-1/avatar-new.png",
      publicUrl: "https://cdn.example/owner-1/avatar-new.png",
    })),
    setMediaUrl: vi.fn(async () => storedProfile),
    removeMediaExcept: vi.fn(async () => undefined),
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

describe("updateProfileMedia", () => {
  const file = new File(["png"], "me.png", { type: "image/png" });

  it("uploads, then repoints the profile, then removes the replaced image", async () => {
    const calls: string[] = [];
    const repository = createRepository({
      uploadMedia: vi.fn(async () => {
        calls.push("upload");
        return {
          path: "owner-1/avatar-new.png",
          publicUrl: "https://cdn.example/owner-1/avatar-new.png",
        };
      }),
      setMediaUrl: vi.fn(async () => {
        calls.push("setUrl");
        return storedProfile;
      }),
      removeMediaExcept: vi.fn(async () => {
        calls.push("cleanup");
      }),
    });

    await createProfilesService(repository).updateProfileMedia("owner-1", {
      kind: "avatar",
      file,
    });

    expect(calls).toEqual(["upload", "setUrl", "cleanup"]);
    expect(repository.setMediaUrl).toHaveBeenCalledWith(
      "owner-1",
      "avatar",
      "https://cdn.example/owner-1/avatar-new.png",
    );
    expect(repository.removeMediaExcept).toHaveBeenCalledWith(
      "owner-1",
      "avatar",
      "owner-1/avatar-new.png",
    );
  });

  it("does not repoint the profile when the upload fails", async () => {
    const repository = createRepository({
      uploadMedia: vi.fn(async () => {
        throw new Error("storage down");
      }),
    });

    await expect(
      createProfilesService(repository).updateProfileMedia("owner-1", {
        kind: "cover",
        file,
      }),
    ).rejects.toThrow("storage down");
    expect(repository.setMediaUrl).not.toHaveBeenCalled();
  });

  it("still succeeds when removing the old image fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const repository = createRepository({
      removeMediaExcept: vi.fn(async () => {
        throw new Error("remove failed");
      }),
    });

    await expect(
      createProfilesService(repository).updateProfileMedia("owner-1", {
        kind: "avatar",
        file,
      }),
    ).resolves.toEqual(storedProfile);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
