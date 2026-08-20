using EMS.Application.DTOs.Leave;
using EMS.Application.Exceptions;
using EMS.Application.Services;
using EMS.Application.Validators.Leave;
using EMS.Domain.Entities;
using EMS.Domain.Enums;

namespace EMS.Application.Tests;

public sealed class LeaveServiceTests
{
    [Fact]
    public async Task CreateLeaveRequestAsync_WithEmployee_CreatesOwnLeaveRequest()
    {
        var fixture = CreateFixture();

        var response = await fixture.Service.CreateLeaveRequestAsync(CreateRequest());

        Assert.Equal(fixture.Employee.Id, response.EmployeeId);
        Assert.Equal(LeaveStatus.Pending, response.Status);
        Assert.Equal(fixture.Employee.Id, fixture.LeaveRepository.AddedLeaveRequest?.EmployeeId);
    }

    [Fact]
    public async Task ApproveLeaveAsync_WhenCurrentUserIsEmployee_ThrowsForbiddenException()
    {
        var fixture = CreateFixture();
        var leaveRequest = AddLeaveRequest(fixture.LeaveRepository, fixture.Employee.Id);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            fixture.Service.ApproveLeaveAsync(leaveRequest.Id));
    }

    [Fact]
    public async Task ApproveLeaveAsync_WhenManagerOwnsDirectSubordinate_Succeeds()
    {
        var fixture = CreateManagerFixture(isDirectManager: true);
        var leaveRequest = AddLeaveRequest(fixture.LeaveRepository, fixture.Employee.Id);

        var response = await fixture.Service.ApproveLeaveAsync(leaveRequest.Id);

        Assert.Equal(LeaveStatus.Approved, response.Status);
        Assert.Equal(fixture.Manager!.Id, response.ApprovedById);
        Assert.Equal(leaveRequest, fixture.LeaveRepository.UpdatedLeaveRequest);
    }

    [Fact]
    public async Task ApproveLeaveAsync_WhenManagerDoesNotOwnEmployee_ThrowsForbiddenException()
    {
        var fixture = CreateManagerFixture(isDirectManager: false);
        var leaveRequest = AddLeaveRequest(fixture.LeaveRepository, fixture.Employee.Id);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            fixture.Service.ApproveLeaveAsync(leaveRequest.Id));
    }

    [Fact]
    public async Task ApproveLeaveAsync_WhenCurrentUserIsAdmin_Succeeds()
    {
        var fixture = CreateAdminFixture();
        var leaveRequest = AddLeaveRequest(fixture.LeaveRepository, fixture.Employee.Id);

        var response = await fixture.Service.ApproveLeaveAsync(leaveRequest.Id);

        Assert.Equal(LeaveStatus.Approved, response.Status);
        Assert.Equal(fixture.Admin!.Id, response.ApprovedById);
    }

    [Fact]
    public async Task RejectLeaveAsync_UsesDomainRejectBehaviour()
    {
        var fixture = CreateAdminFixture();
        var leaveRequest = AddLeaveRequest(fixture.LeaveRepository, fixture.Employee.Id);

        var response = await fixture.Service.RejectLeaveAsync(leaveRequest.Id);

        Assert.Equal(LeaveStatus.Rejected, response.Status);
        Assert.Equal(fixture.Admin!.Id, response.ApprovedById);
    }

    private static LeaveFixture CreateFixture()
    {
        var department = TestEntities.Department();
        var employee = TestEntities.Employee(department.Id);
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(employee);
        var leaveRepository = new InMemoryLeaveRequestRepository();
        var currentUser = new TestCurrentUser
        {
            EmployeeId = employee.Id,
            Role = EmployeeRole.Employee,
            IsAuthenticated = true
        };

        return new LeaveFixture(
            CreateService(leaveRepository, employeeRepository, currentUser),
            department,
            employee,
            null,
            null,
            employeeRepository,
            leaveRepository,
            currentUser);
    }

    private static LeaveFixture CreateManagerFixture(bool isDirectManager)
    {
        var department = TestEntities.Department();
        var manager = TestEntities.Employee(
            department.Id,
            EmployeeRole.Manager,
            email: "manager@example.com",
            employeeCode: "MGR-001");
        var employee = TestEntities.Employee(
            department.Id,
            managerId: isDirectManager ? manager.Id : Guid.NewGuid(),
            email: "employee@example.com",
            employeeCode: "EMP-001");
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(manager);
        employeeRepository.Employees.Add(employee);
        var leaveRepository = new InMemoryLeaveRequestRepository();
        var currentUser = new TestCurrentUser
        {
            EmployeeId = manager.Id,
            Role = EmployeeRole.Manager,
            IsAuthenticated = true
        };

        return new LeaveFixture(
            CreateService(leaveRepository, employeeRepository, currentUser),
            department,
            employee,
            manager,
            null,
            employeeRepository,
            leaveRepository,
            currentUser);
    }

    private static LeaveFixture CreateAdminFixture()
    {
        var department = TestEntities.Department();
        var admin = TestEntities.Employee(
            department.Id,
            EmployeeRole.Admin,
            email: "admin@example.com",
            employeeCode: "ADM-001");
        var employee = TestEntities.Employee(department.Id);
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(admin);
        employeeRepository.Employees.Add(employee);
        var leaveRepository = new InMemoryLeaveRequestRepository();
        var currentUser = new TestCurrentUser
        {
            EmployeeId = admin.Id,
            Role = EmployeeRole.Admin,
            IsAuthenticated = true
        };

        return new LeaveFixture(
            CreateService(leaveRepository, employeeRepository, currentUser),
            department,
            employee,
            null,
            admin,
            employeeRepository,
            leaveRepository,
            currentUser);
    }

    private static LeaveService CreateService(
        InMemoryLeaveRequestRepository leaveRepository,
        InMemoryEmployeeRepository employeeRepository,
        TestCurrentUser currentUser)
    {
        return new LeaveService(
            leaveRepository,
            employeeRepository,
            currentUser,
            new CreateLeaveRequestDtoValidator(),
            new LeaveRequestQueryValidator());
    }

    private static LeaveRequest AddLeaveRequest(InMemoryLeaveRequestRepository repository, Guid employeeId)
    {
        var leaveRequest = new LeaveRequest(
            employeeId,
            LeaveType.Annual,
            new DateOnly(2026, 8, 20),
            new DateOnly(2026, 8, 21),
            "Family event");
        repository.LeaveRequests.Add(leaveRequest);
        return leaveRequest;
    }

    private static CreateLeaveRequestDto CreateRequest()
    {
        return new CreateLeaveRequestDto(
            LeaveType.Annual,
            new DateOnly(2026, 8, 20),
            new DateOnly(2026, 8, 21),
            "Family event");
    }

    private sealed record LeaveFixture(
        LeaveService Service,
        Department Department,
        Employee Employee,
        Employee? Manager,
        Employee? Admin,
        InMemoryEmployeeRepository EmployeeRepository,
        InMemoryLeaveRequestRepository LeaveRepository,
        TestCurrentUser CurrentUser);
}
