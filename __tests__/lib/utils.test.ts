import { cn } from "@/lib/utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("merges class names correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("handles conditional classes", () => {
      expect(cn("base-class", { "conditional-class": true })).toBe(
        "base-class conditional-class",
      );
      expect(cn("base-class", { "conditional-class": false })).toBe(
        "base-class",
      );
    });

    it("handles multiple conditional classes", () => {
      expect(cn("base", { class1: true, class2: false, class3: true })).toBe(
        "base class1 class3",
      );
    });

    it("handles arrays of classes", () => {
      expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
    });

    it("handles empty inputs", () => {
      expect(cn()).toBe("");
      expect(cn("")).toBe("");
      expect(cn(null, undefined)).toBe("");
    });

    it("handles conflicting Tailwind classes", () => {
      expect(cn("px-2 px-4")).toBe("px-4");
      expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    });

    it("handles complex combinations", () => {
      expect(
        cn("base", ["array-class"], { conditional: true }, "px-2 px-4"),
      ).toBe("base array-class conditional px-4");
    });
  });
});
