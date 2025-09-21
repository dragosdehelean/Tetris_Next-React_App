import "@testing-library/jest-dom/vitest";

const globalTarget = globalThis as typeof globalThis & {
  requestAnimationFrame?: typeof requestAnimationFrame;
  cancelAnimationFrame?: typeof cancelAnimationFrame;
};

if (typeof globalTarget.requestAnimationFrame === "undefined") {
  globalTarget.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    const timeoutId = setTimeout(() => {
      callback(Date.now());
    }, 16);
    return timeoutId as unknown as number;
  };
}

if (typeof globalTarget.cancelAnimationFrame === "undefined") {
  globalTarget.cancelAnimationFrame = (handle: number) => {
    clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
  };
}

if (typeof window !== "undefined") {
  if (typeof window.requestAnimationFrame === "undefined") {
    window.requestAnimationFrame = globalTarget.requestAnimationFrame!;
  }
  if (typeof window.cancelAnimationFrame === "undefined") {
    window.cancelAnimationFrame = globalTarget.cancelAnimationFrame!;
  }
}
