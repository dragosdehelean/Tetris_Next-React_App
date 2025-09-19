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

    expect(screen.getByText(/Tetris Odyssey/i)).toBeInTheDocument();
    expect(screen.getByTestId("primary-action-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tema" })).toBeInTheDocument();

    await user.click(screen.getByTestId("primary-action-button"));

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

    const resumeButton = await screen.findByTestId("primary-action-button");
    await user.click(resumeButton);

    expect(store.getState().game.status).toBe("running");
  });

  it("cycles theme when pressing the theme switch", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GameDashboard />);

    const button = screen.getByTestId("theme-switch");

    const initial = store.getState().theme.current;
    await user.click(button);
    const after1 = store.getState().theme.current;
    expect(after1).not.toBe(initial);

    await user.click(button);
    const after2 = store.getState().theme.current;
    expect(after2).not.toBe(after1);
  });

  it("respects preloaded theme state", () => {
    const preloadedState: Partial<RootState> = {
      theme: { current: "aurora" },
    };

    const { store } = renderWithProviders(<GameDashboard />, { preloadedState });
    expect(store.getState().theme.current).toBe("aurora");
  });
});

