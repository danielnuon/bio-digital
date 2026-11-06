import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { App } from "./App";

describe("demo dashboard", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders the overview with no axe violations", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    // Colour contrast needs real layout; it is checked by hand against token values.
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it("switches environment, density and motion through the provider", () => {
    const { container } = render(<App />);
    const root = container.querySelector("[data-bio-root]")!;
    act(() => {
      fireEvent.click(screen.getAllByLabelText("Night")[0]);
      fireEvent.click(screen.getAllByLabelText("Immersed")[0]);
      fireEvent.click(screen.getAllByLabelText("Reduced")[0]);
    });
    expect(root.getAttribute("data-bio-environment")).toBe("night");
    expect(root.getAttribute("data-bio-density")).toBe("immersed");
    expect(root.getAttribute("data-bio-motion")).toBe("reduced");
  });

  it("every view renders without axe violations", async () => {
    const { container } = render(<App />);
    for (const name of ["Zones", "Physics", "Library"]) {
      act(() => {
        fireEvent.click(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("button", { name: new RegExp(`^${name}`) }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 400));
      });
      const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
      expect(results.violations.map((v) => `${name} ${v.id}: ${v.help} ${v.nodes[0]?.target}`)).toEqual([]);
    }
  });
});
