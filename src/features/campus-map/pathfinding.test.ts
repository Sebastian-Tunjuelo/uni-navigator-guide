import { describe, expect, it } from "vitest";
import { findRoute, routeDistance, walkingTime } from "./pathfinding";

describe("campus pathfinding", () => {
  it("returns a direct route when origin and destination are the same", () => {
    expect(findRoute("A", "A")).toEqual(["A"]);
  });

  it("finds a walkable route between campus blocks", () => {
    const route = findRoute("ENT", "D");

    expect(route[0]).toBe("ENT");
    expect(route.at(-1)).toBe("D");
    expect(route.length).toBeGreaterThan(1);
  });

  it("calculates route distance and walking time", () => {
    const meters = routeDistance(["ENT", "CAF", "D"]);

    expect(meters).toBeGreaterThan(0);
    expect(walkingTime(meters)).toBeGreaterThanOrEqual(1);
  });
});
