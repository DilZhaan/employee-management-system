using EMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EMS.Infrastructure.Persistence.Configurations;

internal sealed class AttendanceLogConfiguration : IEntityTypeConfiguration<AttendanceLog>
{
    public void Configure(EntityTypeBuilder<AttendanceLog> builder)
    {
        builder.ToTable("AttendanceLogs");

        builder.HasKey(attendanceLog => attendanceLog.Id);

        builder.Property(attendanceLog => attendanceLog.CheckInTime)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(attendanceLog => attendanceLog.CheckOutTime)
            .HasColumnType("timestamp with time zone");

        builder.Property(attendanceLog => attendanceLog.WorkDate)
            .IsRequired();

        builder.Property(attendanceLog => attendanceLog.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(attendanceLog => attendanceLog.DeviceType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(attendanceLog => attendanceLog.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(attendanceLog => attendanceLog.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        builder.HasOne<Employee>()
            .WithMany()
            .HasForeignKey(attendanceLog => attendanceLog.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex(attendanceLog => new { attendanceLog.EmployeeId, attendanceLog.WorkDate });

        builder.HasIndex(attendanceLog => attendanceLog.WorkDate);

        builder.HasIndex(attendanceLog => attendanceLog.EmployeeId)
            .IsUnique()
            .HasFilter("\"CheckOutTime\" IS NULL");
    }
}
