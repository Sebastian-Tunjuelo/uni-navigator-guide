import { describe, expect, it } from "vitest";
import { subjects } from "./mockData";
import { getGradeSummary } from "./gradeSummary";

describe("grade summary", () => {
  it("summarizes completed activities for a subject", () => {
    const summary = getGradeSummary(subjects[0]);

    expect(summary.completed).toHaveLength(3);
    expect(summary.completedWeight).toBe(50);
    expect(summary.pendingWeight).toBe(50);
    expect(summary.earned).toBeCloseTo(2.095);
  });

  it("marks subjects as passing from current grade", () => {
    expect(getGradeSummary(subjects[0]).isPassing).toBe(true);
  });
});
