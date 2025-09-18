import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { Providers } from "@/app/providers";
import { makeStore, type AppStore, type RootState } from "@/features/store/store";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store: providedStore, ...renderOptions }: ExtendedRenderOptions = {},
) {
  const baseState = makeStore().getState();
  const mergedState = preloadedState ? { ...baseState, ...preloadedState } : undefined;
  const store = providedStore ?? makeStore(mergedState);

  function Wrapper({ children }: PropsWithChildren) {
    return <Providers storeOverride={store}>{children}</Providers>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}