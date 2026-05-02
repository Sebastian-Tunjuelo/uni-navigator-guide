import { describe, expect, it } from "vitest";
import { listNews } from "./api/newsRepository";

describe("news repository", () => {
  it("returns validated news items", async () => {
    const items = await listNews();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].category).toBe("Académico");
  });
});
