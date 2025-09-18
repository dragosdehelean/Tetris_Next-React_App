import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GameDashboard } from "@/components/home/GameDashboard";
import { renderWithProviders } from "@/test/testUtils";

// Focused tests for the canvas + controls wiring

describe("GameCanvas controls", () => {
  it("reacts to keyboard inputs after starting the game", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GameDashboard />);

    await user.click(screen.getByRole("button", { name: "Incepe jocul" }));

    const before = store.getState().game.frame?.activePiece?.position.x ?? 0;
    await user.keyboard("{ArrowLeft}");
    const after = store.getState().game.frame?.activePiece?.position.x ?? 0;

    expect(after).toBeLessThanOrEqual(before);

    await user.keyboard(" "); // hard drop
    const filled = store.getState().game.frame?.board.flat().filter((c) => c !== null).length ?? 0;
    expect(filled).toBeGreaterThan(0);

    await user.keyboard("p"); // pause
    expect(store.getState().game.status).toBe("paused");
  });
});
