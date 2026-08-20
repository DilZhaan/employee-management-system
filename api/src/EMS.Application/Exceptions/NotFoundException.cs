namespace EMS.Application.Exceptions;

public sealed class NotFoundException : ApplicationExceptionBase
{
    public NotFoundException(string message)
        : base(message)
    {
    }
}
