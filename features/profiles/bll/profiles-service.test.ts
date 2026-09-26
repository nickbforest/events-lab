import { describe, expect, it, vi } from "vitest";

import type { ProfileUpdateInput } from "@/features/profiles/contracts";
import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import { createProfilesService } from "./profiles-service";
import {
  AVATAR_PATH,
  AVATAR_URL,
  emptySocialLinks,
  OWNER_DISPLAY_NAME,
  OWNER_ID,
  PROFILE_TWITTER_URL,
  storedProfile,
} from "./test-fixtures";

function createRepository(
  overrides: Partial<ProfilesRepository> = {},
): ProfilesRepository {
  return {
    findById: vi.fn(async () => null),
    findByUsername: vi.fn(async () => null),
    isUsernameTaken: vi.fn(async () => false),
    update: vi.fn(async () => storedProfile),
    uploadMedia: vi.fn(async () => ({
      path: AVATAR_PATH,
      publicUrl: AVATAR_URL,
    })),
    setMediaUrl: vi.fn(async () => storedProfile),
    removeMediaExcept: vi.fn(async () => undefined),
    ...overrides,
  };
}

const updateInput: ProfileUpdateInput = {
  displayName: OWNER_DISPLAY_NAME,
  publisherType: "artist",
  bio: null,
  city: null,
  countryCode: null,
  websiteUrl: null,
  socialLinks: { ...emptySocialLinks, twitter: PROFILE_TWITTER_URL },
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

    await service.updateProfile(OWNER_ID, updateInput);

    expect(repository.update).toHaveBeenCalledWith(
      OWNER_ID,
      expect.objectContaining({ display_name: OWNER_DISPLAY_NAME }),
    );
  });

  it("drops cleared links instead of storing them as null", async () => {
    const repository = createRepository();
    const service = createProfilesService(repository);

    await service.updateProfile(OWNER_ID, updateInput);

    const [, patch] = vi.mocked(repository.update).mock.calls[0];
    expect(patch.social_links).toEqual({
      twitter: PROFILE_TWITTER_URL,
    });
  });

  it("never writes username, so a public URL cannot change under a shared link", async () => {
    const repository = createRepository();
    const service = createProfilesService(repository);

    await service.updateProfile(OWNER_ID, updateInput);

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
          path: AVATAR_PATH,
          publicUrl: AVATAR_URL,
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

    await createProfilesService(repository).updateProfileMedia(OWNER_ID, {
      kind: "avatar",
      file,
    });

    expect(calls).toEqual(["upload", "setUrl", "cleanup"]);
    expect(repository.setMediaUrl).toHaveBeenCalledWith(
      OWNER_ID,
      "avatar",
      AVATAR_URL,
    );
    expect(repository.removeMediaExcept).toHaveBeenCalledWith(
      OWNER_ID,
      "avatar",
      AVATAR_PATH,
    );
  });

  it("does not repoint the profile when the upload fails", async () => {
    const repository = createRepository({
      uploadMedia: vi.fn(async () => {
        throw new Error("storage down");
      }),
    });

    await expect(
      createProfilesService(repository).updateProfileMedia(OWNER_ID, {
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
      createProfilesService(repository).updateProfileMedia(OWNER_ID, {
        kind: "avatar",
        file,
      }),
    ).resolves.toEqual(storedProfile);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("removeProfileMedia", () => {
  it("clears the profile's link before deleting the stored files", async () => {
    const calls: string[] = [];
    const repository = createRepository({
      setMediaUrl: vi.fn(async () => {
        calls.push("clearUrl");
        return storedProfile;
      }),
      removeMediaExcept: vi.fn(async () => {
        calls.push("cleanup");
      }),
    });

    await createProfilesService(repository).removeProfileMedia(
      OWNER_ID,
      "cover",
    );

    expect(calls).toEqual(["clearUrl", "cleanup"]);
    expect(repository.setMediaUrl).toHaveBeenCalledWith(
      OWNER_ID,
      "cover",
      null,
    );
    expect(repository.removeMediaExcept).toHaveBeenCalledWith(
      OWNER_ID,
      "cover",
      null,
    );
  });

  it("deletes nothing when the profile could not be updated", async () => {
    const repository = createRepository({
      setMediaUrl: vi.fn(async () => {
        throw new Error("no row");
      }),
    });

    await expect(
      createProfilesService(repository).removeProfileMedia(OWNER_ID, "cover"),
    ).rejects.toThrow("no row");
    expect(repository.removeMediaExcept).not.toHaveBeenCalled();
  });

  it("still succeeds when deleting the files fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const repository = createRepository({
      removeMediaExcept: vi.fn(async () => {
        throw new Error("remove failed");
      }),
    });

    await expect(
      createProfilesService(repository).removeProfileMedia(OWNER_ID, "cover"),
    ).resolves.toEqual(storedProfile);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
