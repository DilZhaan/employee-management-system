using EMS.Application.DTOs.Employees;

namespace EMS.Application.DTOs.Auth;

public sealed record LoginResponse(string Token, EmployeeResponse Employee);
