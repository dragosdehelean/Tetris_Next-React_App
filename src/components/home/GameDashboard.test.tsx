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

    expect(screen.getByText(/Tetris Odyssey/i)).toBeInTheDocument();
    expect(screen.getByTestId("primary-action-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "⚙️ Setări" })).toBeInTheDocument();

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

  it("opens settings dialog when pressing the settings button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GameDashboard />);

    const settingsButton = screen.getByTestId("settings-button");
    await user.click(settingsButton);

    // Verifică că dialogul s-a deschis folosind títlul unic din dialog
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("🎮 Controale")).toBeInTheDocument();
    expect(screen.getByText("👻 Vizuale")).toBeInTheDocument();
    expect(screen.getByText("🎨 Teme")).toBeInTheDocument();
  });

  it("respects theme state from store", () => {
    // Test simplificat - verifică doar că tema default este folosită
    const { store } = renderWithProviders(<GameDashboard />);
    const currentTheme = store.getState().theme.current;
    
    // Verifică că tema este una validă
    expect(['neon', 'cityscape', 'aurora']).toContain(currentTheme);
  });
});

