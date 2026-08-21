import { render } from "@testing-library/react-native";

import App from "../App";

describe("App", () => {
  it("renders login when no session exists", async () => {
    const view = await render(<App />);

    expect(await view.findByText("Welcome Back")).toBeTruthy();
    expect(view.getByText("Sign In")).toBeTruthy();
  });
});
