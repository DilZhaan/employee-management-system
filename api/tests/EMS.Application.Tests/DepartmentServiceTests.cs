using EMS.Application.Services;
using EMS.Application.Validators.Departments;

namespace EMS.Application.Tests;

public sealed class DepartmentServiceTests
{
    [Fact]
    public async Task ActivateDepartmentAsync_WhenDepartmentIsInactive_ActivatesDepartment()
    {
        var department = TestEntities.Department();
        department.Deactivate();
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(departmentRepository);

        await service.ActivateDepartmentAsync(department.Id);

        Assert.True(department.IsActive);
        Assert.Equal(department, departmentRepository.UpdatedDepartment);
    }

    [Fact]
    public async Task DeactivateDepartmentAsync_WhenDepartmentExists_DeactivatesDepartment()
    {
        var department = TestEntities.Department();
        var departmentRepository = new InMemoryDepartmentRepository();
        departmentRepository.Departments.Add(department);
        var service = CreateService(departmentRepository);

        await service.DeactivateDepartmentAsync(department.Id);

        Assert.False(department.IsActive);
        Assert.Equal(department, departmentRepository.UpdatedDepartment);
    }

    private static DepartmentService CreateService(InMemoryDepartmentRepository departmentRepository)
    {
        return new DepartmentService(
            departmentRepository,
            new CreateDepartmentRequestValidator(),
            new UpdateDepartmentRequestValidator(),
            new DepartmentQueryValidator());
    }
}
