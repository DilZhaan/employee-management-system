import { render } from "@testing-library/react-native";

import { TextField } from "@/components/ui/TextField";

describe("TextField", () => {
  it("renders the label and validation error", async () => {
    const view = await render(<TextField label="Email" error="Email is required" />);

    expect(view.getByLabelText("Email")).toBeTruthy();
    expect(view.getByText("Email is required")).toBeTruthy();
  });
});
