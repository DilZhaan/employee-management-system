using EMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EMS.Infrastructure.Persistence.Configurations;

internal sealed class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");

        builder.HasKey(department => department.Id);

        builder.Property(department => department.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(department => department.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(department => department.IsActive)
            .IsRequired();

        builder.Property(department => department.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(department => department.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(department => department.Code)
            .IsUnique();

        builder.HasIndex(department => department.IsActive);
    }
}
