import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useAuth } from "@/auth/useAuth";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";

jest.mock("@/auth/useAuth", () => ({
  useAuth: jest.fn()
}));

const mockedUseAuth = jest.mocked(useAuth);

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders authenticated profile details", async () => {
    mockedUseAuth.mockReturnValue({
      user: { employeeId: "emp-1", email: "employee@ems.local", role: "Employee", expiresAt: 9999999999 },
      logout: jest.fn()
    } as never);

    const view = await render(<ProfileScreen />);

    expect(view.getByText("employee@ems.local")).toBeTruthy();
    expect(view.getByText("Employee")).toBeTruthy();
    expect(view.getByText("emp-1")).toBeTruthy();
  });

  it("confirms before logout", async () => {
    const logout = jest.fn();
    mockedUseAuth.mockReturnValue({
      user: { employeeId: "emp-1", email: "employee@ems.local", role: "Employee", expiresAt: 9999999999 },
      logout
    } as never);

    const view = await render(<ProfileScreen />);
    fireEvent.press(view.getByText("Log Out"));

    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    buttons[1].onPress();

    expect(logout).toHaveBeenCalled();
  });
});
