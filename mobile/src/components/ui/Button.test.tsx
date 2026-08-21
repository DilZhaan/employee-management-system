import { fireEvent, render } from "@testing-library/react-native";

import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("calls onPress when enabled", async () => {
    const onPress = jest.fn();

    const view = await render(<Button label="Save" onPress={onPress} />);
    fireEvent.press(view.getByRole("button", { name: "Save" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();

    const view = await render(<Button label="Save" onPress={onPress} disabled />);
    fireEvent.press(view.getByRole("button", { name: "Save" }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
