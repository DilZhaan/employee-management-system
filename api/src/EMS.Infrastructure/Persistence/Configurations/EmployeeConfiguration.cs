using EMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EMS.Infrastructure.Persistence.Configurations;

internal sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");

        builder.HasKey(employee => employee.Id);

        builder.Property(employee => employee.EmployeeCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(employee => employee.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(employee => employee.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(employee => employee.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(employee => employee.PasswordHash)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(employee => employee.PhoneNumber)
            .HasMaxLength(30);

        builder.Property(employee => employee.Role)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(employee => employee.IsActive)
            .IsRequired();

        builder.Property(employee => employee.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(employee => employee.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        builder.HasOne<Department>()
            .WithMany()
            .HasForeignKey(employee => employee.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne<Employee>()
            .WithMany()
            .HasForeignKey(employee => employee.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(employee => employee.EmployeeCode)
            .IsUnique();

        builder.HasIndex(employee => employee.Email)
            .IsUnique();

        builder.HasIndex(employee => employee.DepartmentId);

        builder.HasIndex(employee => employee.ManagerId);

        builder.HasIndex(employee => employee.IsActive);
    }
}
