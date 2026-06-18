import { describe, expect, it } from "vitest";
import { readUsdIlsRate } from "./prices";

describe("readUsdIlsRate", () => {
  it("reads the current Frankfurter v2 rates response", () => {
    expect(readUsdIlsRate([{ date: "2026-06-18", base: "USD", quote: "ILS", rate: 2.933 }])).toBe(2.933);
  });
});
