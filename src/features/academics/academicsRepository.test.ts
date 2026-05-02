import { describe, expect, it } from "vitest";
import { getSubjectById, listSubjects, listTodayClasses } from "./api/academicsRepository";

describe("academics repository", () => {
  it("returns validated class entries", async () => {
    const classes = await listTodayClasses();

    expect(classes.length).toBeGreaterThan(0);
    expect(classes[0].start).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns validated subjects", async () => {
    const subjects = await listSubjects();

    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects[0].activities.length).toBeGreaterThan(0);
  });

  it("returns a subject by id", async () => {
    await expect(getSubjectById("s1")).resolves.toMatchObject({ id: "s1" });
  });
});
