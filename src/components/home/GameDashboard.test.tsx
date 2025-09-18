import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GameDashboard } from "@/components/home/GameDashboard";
import { pauseGame, startGame } from "@/features/game/gameSlice";
import { renderWithProviders } from "@/test/testUtils";

describe("GameDashboard", () => {
  it("renders stats and allows starting the game", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GameDashboard />);

    expect(screen.getByText(/Tetris Neon Odyssey/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Începe jocul" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Începe jocul" }));

    const state = store.getState().game;
    expect(state.status).toBe("running");
    expect(state.score).toBe(0);
  });

  it("shows resume action when game is paused", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GameDashboard />);

    await act(async () => {
      store.dispatch(startGame({ difficulty: "Classic" }));
      store.dispatch(pauseGame());
    });

    const resumeButton = await screen.findByRole("button", { name: "Reia jocul" });
    await user.click(resumeButton);

    expect(store.getState().game.status).toBe("running");
  });
});