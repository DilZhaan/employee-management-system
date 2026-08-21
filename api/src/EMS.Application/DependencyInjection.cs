using EMS.Application.Abstractions.Attendance;
using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Auth;
using EMS.Application.DTOs.Departments;
using EMS.Application.DTOs.Employees;
using EMS.Application.DTOs.Leave;
using EMS.Application.Services;
using EMS.Application.Validators.Attendance;
using EMS.Application.Validators.Auth;
using EMS.Application.Validators.Departments;
using EMS.Application.Validators.Employees;
using EMS.Application.Validators.Leave;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EMS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ILeaveService, LeaveService>();

        services.AddSingleton<IAttendancePolicy, StandardAttendancePolicy>();

        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
        services.AddScoped<IValidator<CreateEmployeeRequest>, CreateEmployeeRequestValidator>();
        services.AddScoped<IValidator<UpdateEmployeeRequest>, UpdateEmployeeRequestValidator>();
        services.AddScoped<IValidator<EmployeeQuery>, EmployeeQueryValidator>();
        services.AddScoped<IValidator<CreateDepartmentRequest>, CreateDepartmentRequestValidator>();
        services.AddScoped<IValidator<UpdateDepartmentRequest>, UpdateDepartmentRequestValidator>();
        services.AddScoped<IValidator<DepartmentQuery>, DepartmentQueryValidator>();
        services.AddScoped<IValidator<CheckInRequest>, CheckInRequestValidator>();
        services.AddScoped<IValidator<AttendanceQuery>, AttendanceQueryValidator>();
        services.AddScoped<IValidator<CreateLeaveRequestDto>, CreateLeaveRequestDtoValidator>();
        services.AddScoped<IValidator<LeaveRequestQuery>, LeaveRequestQueryValidator>();

        return services;
    }
}
