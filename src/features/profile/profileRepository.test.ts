import { describe, expect, it } from "vitest";
import { getProfileById, listProfiles } from "./api/profileRepository";

describe("profile repository", () => {
  it("returns validated student profiles", async () => {
    const profiles = await listProfiles();

    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles[0]).toMatchObject({
      id: expect.any(String),
      email: expect.stringContaining("@"),
    });
  });

  it("returns null when a profile does not exist", async () => {
    await expect(getProfileById("missing")).resolves.toBeNull();
  });
});
