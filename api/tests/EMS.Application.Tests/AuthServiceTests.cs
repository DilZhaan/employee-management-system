using EMS.Application.DTOs.Auth;
using EMS.Application.Exceptions;
using EMS.Application.Services;
using EMS.Application.Validators.Auth;

namespace EMS.Application.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken()
    {
        var department = TestEntities.Department();
        var employee = TestEntities.Employee(department.Id);
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(employee);
        var passwordHasher = new RecordingPasswordHasher();
        var tokenService = new RecordingTokenService { Token = "jwt-token" };
        var service = new AuthService(employeeRepository, passwordHasher, tokenService, new LoginRequestValidator());

        var response = await service.LoginAsync(new LoginRequest(" EMPLOYEE@EXAMPLE.COM ", "password"));

        Assert.Equal("jwt-token", response.Token);
        Assert.Equal(employee.Id, response.Employee.Id);
        Assert.Equal("password", passwordHasher.VerifiedPassword);
        Assert.Equal(employee.PasswordHash, passwordHasher.VerifiedHash);
        Assert.Equal(employee, tokenService.Employee);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ThrowsAuthenticationException()
    {
        var department = TestEntities.Department();
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(TestEntities.Employee(department.Id));
        var passwordHasher = new RecordingPasswordHasher { VerificationResult = false };
        var service = new AuthService(
            employeeRepository,
            passwordHasher,
            new RecordingTokenService(),
            new LoginRequestValidator());

        await Assert.ThrowsAsync<AuthenticationException>(() =>
            service.LoginAsync(new LoginRequest("employee@example.com", "bad-password")));
    }

    [Fact]
    public async Task LoginAsync_WithUnknownEmail_ThrowsAuthenticationException()
    {
        var service = new AuthService(
            new InMemoryEmployeeRepository(),
            new RecordingPasswordHasher(),
            new RecordingTokenService(),
            new LoginRequestValidator());

        await Assert.ThrowsAsync<AuthenticationException>(() =>
            service.LoginAsync(new LoginRequest("missing@example.com", "password")));
    }

    [Fact]
    public async Task LoginAsync_WithInactiveEmployee_ThrowsAuthenticationException()
    {
        var department = TestEntities.Department();
        var employee = TestEntities.Employee(department.Id);
        employee.Deactivate();
        var employeeRepository = new InMemoryEmployeeRepository();
        employeeRepository.Employees.Add(employee);
        var service = new AuthService(
            employeeRepository,
            new RecordingPasswordHasher(),
            new RecordingTokenService(),
            new LoginRequestValidator());

        await Assert.ThrowsAsync<AuthenticationException>(() =>
            service.LoginAsync(new LoginRequest("employee@example.com", "password")));
    }
}
