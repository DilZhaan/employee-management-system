import { useNavigation } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import { Pressable as MockPressable } from "react-native";

import { useCreateLeaveRequest } from "@/features/leave/hooks/useLeave";
import { RequestLeaveScreen } from "@/features/leave/screens/RequestLeaveScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn()
}));

jest.mock("@/features/leave/hooks/useLeave", () => ({
  useCreateLeaveRequest: jest.fn(),
  getLeaveErrorMessage: jest.fn(() => "Unable to submit leave request.")
}));

jest.mock("@react-native-community/datetimepicker", () => {
  return function MockDateTimePicker(props: { onChange: (event: { type: string }, date?: Date) => void }) {
    return (
      <MockPressable
        accessibilityRole="button"
        accessibilityLabel="Mock date picker"
        onPress={() => props.onChange({ type: "set" }, new Date(2026, 7, 25))}
      />
    );
  };
});

const mockedUseNavigation = jest.mocked(useNavigation);
const mockedUseCreateLeaveRequest = jest.mocked(useCreateLeaveRequest);

describe("RequestLeaveScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({
      goBack: jest.fn()
    } as never);
  });

  it("renders request leave form fields", async () => {
    mockedUseCreateLeaveRequest.mockReturnValue(createMutationResult(jest.fn()));

    const view = await render(<RequestLeaveScreen />);

    expect(view.getByText("Leave Type")).toBeTruthy();
    expect(view.getByText("Start Date")).toBeTruthy();
    expect(view.getByText("End Date")).toBeTruthy();
    expect(view.getByLabelText("Reason")).toBeTruthy();
    expect(view.getByRole("button", { name: "Submit Request" })).toBeTruthy();
  });

  it("shows mutation error message when submission fails", async () => {
    mockedUseCreateLeaveRequest.mockReturnValue(
      createMutationResult(jest.fn(), {
        error: new Error("failed")
      })
    );

    const view = await render(<RequestLeaveScreen />);
    expect(view.getAllByText("Unable to submit leave request.").length).toBeGreaterThan(0);
  });
});

function createMutationResult(mutate: jest.Mock, overrides: Record<string, unknown> = {}): ReturnType<typeof useCreateLeaveRequest> {
  return {
    mutate,
    isPending: false,
    error: null,
    ...overrides
  } as unknown as ReturnType<typeof useCreateLeaveRequest>;
}
