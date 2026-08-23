using EMS.Application.DTOs.Attendance;
using EMS.Application.DTOs.Common;
using EMS.Application.DTOs.Departments;
using EMS.Application.DTOs.Employees;
using EMS.Application.DTOs.Leave;
using EMS.Domain.Entities;

namespace EMS.Application.Mapping;

internal static class DomainMappingExtensions
{
    public static EmployeeResponse ToResponse(this Employee employee)
    {
        return new EmployeeResponse(
            employee.Id,
            employee.EmployeeCode,
            employee.FirstName,
            employee.LastName,
            employee.Email,
            employee.PhoneNumber,
            employee.DepartmentId,
            employee.Role,
            employee.ManagerId,
            employee.IsActive,
            employee.CreatedAt);
    }

    public static DepartmentResponse ToResponse(this Department department)
    {
        return new DepartmentResponse(
            department.Id,
            department.Name,
            department.Code,
            department.IsActive,
            department.CreatedAt);
    }

    public static AttendanceResponse ToResponse(this AttendanceLog attendanceLog, string employeeCode, string employeeName)
    {
        return new AttendanceResponse(
            attendanceLog.Id,
            attendanceLog.EmployeeId,
            employeeCode,
            employeeName,
            attendanceLog.CheckInTime,
            attendanceLog.CheckOutTime,
            attendanceLog.WorkDate,
            attendanceLog.Status,
            attendanceLog.DeviceType);
    }

    public static LeaveRequestResponse ToResponse(this LeaveRequest leaveRequest, string employeeCode, string employeeName)
    {
        return new LeaveRequestResponse(
            leaveRequest.Id,
            leaveRequest.EmployeeId,
            employeeCode,
            employeeName,
            leaveRequest.LeaveType,
            leaveRequest.StartDate,
            leaveRequest.EndDate,
            leaveRequest.Reason,
            leaveRequest.Status,
            leaveRequest.ApprovedById,
            leaveRequest.AppliedOn,
            leaveRequest.ReviewedAt);
    }

    public static PagedResult<TResponse> MapItems<TEntity, TResponse>(
        this PagedResult<TEntity> result,
        Func<TEntity, TResponse> map)
    {
        return new PagedResult<TResponse>(
            result.Items.Select(map).ToArray(),
            result.Page,
            result.PageSize,
            result.TotalCount);
    }
}
