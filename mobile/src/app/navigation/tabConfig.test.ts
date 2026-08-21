import { getMainTabsForRole } from "@/app/navigation/tabConfig";

describe("getMainTabsForRole", () => {
  it("does not include approvals tab for Employee", () => {
    expect(getMainTabsForRole("Employee")).toEqual(["Home", "Attendance", "Leave", "Profile"]);
  });

  it("includes approvals tab for Manager", () => {
    expect(getMainTabsForRole("Manager")).toEqual(["Home", "Attendance", "Leave", "Approvals", "Profile"]);
  });

  it("includes approvals tab for Admin", () => {
    expect(getMainTabsForRole("Admin")).toEqual(["Home", "Attendance", "Leave", "Approvals", "Profile"]);
  });
});
