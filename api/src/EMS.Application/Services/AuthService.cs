using EMS.Application.Abstractions.Authentication;
using EMS.Application.Abstractions.Persistence;
using EMS.Application.DTOs.Auth;
using EMS.Application.Exceptions;
using EMS.Application.Mapping;
using FluentValidation;

namespace EMS.Application.Services;

public sealed class AuthService : IAuthService
{
    private const string InvalidCredentialsMessage = "Invalid email or password.";

    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IValidator<LoginRequest> _validator;

    public AuthService(
        IEmployeeRepository employeeRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IValidator<LoginRequest> validator)
    {
        _employeeRepository = employeeRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _validator = validator;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(request, cancellationToken);

        var email = NormalizeEmail(request.Email);
        var employee = await _employeeRepository.GetByEmailAsync(email, cancellationToken);
        if (employee is null || !employee.IsActive)
        {
            throw new AuthenticationException(InvalidCredentialsMessage);
        }

        if (!_passwordHasher.Verify(request.Password, employee.PasswordHash))
        {
            throw new AuthenticationException(InvalidCredentialsMessage);
        }

        var token = _tokenService.GenerateToken(employee);
        return new LoginResponse(token, employee.ToResponse());
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
