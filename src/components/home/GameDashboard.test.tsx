import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GameDashboard } from "@/components/home/GameDashboard";
import { pauseGame, startGame } from "@/features/game/gameSlice";
import type { RootState } from "@/features/store/store";
import { renderWithProviders } from "@/test/testUtils";

describe("GameDashboard", () => {
  it("renders stats and allows starting the game", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GameDashboard />);

    expect(screen.getByText(/Tetris Neon Odyssey/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Incepe jocul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schimba tema/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Incepe jocul" }));

    const state = store.getState().game;
    expect(state.status).toBe("running");
    expect(state.frame?.score).toBe(0);
    expect(screen.getByTestId("game-canvas")).toBeInTheDocument();
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

  it("cycles theme when pressing the theme switch", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GameDashboard />);

    const button = screen.getByTestId("theme-switch");
    expect(button).toHaveTextContent("Neon Odyssey");

    await user.click(button);
    expect(button).toHaveTextContent("Cityscape Dusk");

    await user.click(button);
    expect(button).toHaveTextContent("Aurora Borealis");
  });

  it("respects preloaded theme state", () => {
    const preloadedState: Partial<RootState> = {
      theme: { current: "aurora" },
    };

    renderWithProviders(<GameDashboard />, { preloadedState });

    expect(screen.getByTestId("theme-switch")).toHaveTextContent("Aurora Borealis");
  });
});

