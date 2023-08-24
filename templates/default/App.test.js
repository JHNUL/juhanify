import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe("App.jsx", () => {
  it("Text is found", () => {
    const { unmount } = render(<App />);
    expect(screen.getByText("y halo thar", { exact: false })).toBeInTheDocument();
    unmount();
  });
});
