using EMS.Domain.Entities;
using EMS.Domain.Exceptions;

namespace EMS.Domain.Tests;

public sealed class DepartmentTests
{
    [Fact]
    public void Create_WithValidValues_Succeeds()
    {
        var department = new Department(" Human Resources ", " HR ");

        Assert.NotEqual(Guid.Empty, department.Id);
        Assert.Equal("Human Resources", department.Name);
        Assert.Equal("HR", department.Code);
        Assert.True(department.IsActive);
        Assert.Equal(DateTimeKind.Utc, department.CreatedAt.Kind);
        Assert.Null(department.UpdatedAt);
    }

    [Theory]
    [InlineData("", "HR")]
    [InlineData("Human Resources", "")]
    [InlineData(" ", "HR")]
    [InlineData("Human Resources", " ")]
    public void Create_WithMissingRequiredValues_ThrowsDomainException(string name, string code)
    {
        Assert.Throws<DomainException>(() => new Department(name, code));
    }

    [Fact]
    public void Deactivate_WhenActive_Succeeds()
    {
        var department = new Department("Finance", "FIN");

        department.Deactivate();

        Assert.False(department.IsActive);
        Assert.NotNull(department.UpdatedAt);
    }

    [Fact]
    public void Deactivate_WhenInactive_ThrowsDomainException()
    {
        var department = new Department("Finance", "FIN");
        department.Deactivate();

        Assert.Throws<DomainException>(department.Deactivate);
    }
}
