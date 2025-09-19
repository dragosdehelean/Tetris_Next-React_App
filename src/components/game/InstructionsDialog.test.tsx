import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/testUtils";
import { GameDashboard } from "@/components/home/GameDashboard";

describe("Instructions dialog", () => {
  it("pauses on open and resumes on close when game is running", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GameDashboard />);

    await user.click(screen.getByTestId("primary-action-button"));
    expect(store.getState().game.status).toBe("running");

    await user.click(screen.getByTestId("instructions-open"));
    expect(store.getState().game.status).toBe("paused");

    await user.click(screen.getByTestId("instructions-close"));
    expect(store.getState().game.status).toBe("running");
  });
});
