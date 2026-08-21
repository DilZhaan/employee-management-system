using EMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EMS.Infrastructure.Persistence.Configurations;

internal sealed class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.ToTable("LeaveRequests");

        builder.HasKey(leaveRequest => leaveRequest.Id);

        builder.Property(leaveRequest => leaveRequest.LeaveType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(leaveRequest => leaveRequest.StartDate)
            .IsRequired();

        builder.Property(leaveRequest => leaveRequest.EndDate)
            .IsRequired();

        builder.Property(leaveRequest => leaveRequest.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(leaveRequest => leaveRequest.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(leaveRequest => leaveRequest.AppliedOn)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(leaveRequest => leaveRequest.ReviewedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(leaveRequest => leaveRequest.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(leaveRequest => leaveRequest.UpdatedAt)
            .HasColumnType("timestamp with time zone");

        builder.HasOne<Employee>()
            .WithMany()
            .HasForeignKey(leaveRequest => leaveRequest.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne<Employee>()
            .WithMany()
            .HasForeignKey(leaveRequest => leaveRequest.ApprovedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(leaveRequest => new { leaveRequest.EmployeeId, leaveRequest.Status });

        builder.HasIndex(leaveRequest => leaveRequest.Status);

        builder.HasIndex(leaveRequest => leaveRequest.StartDate);
    }
}
