namespace EMS.Application.Exceptions;

public sealed class AuthenticationException : ApplicationExceptionBase
{
    public AuthenticationException(string message)
        : base(message)
    {
    }
}
