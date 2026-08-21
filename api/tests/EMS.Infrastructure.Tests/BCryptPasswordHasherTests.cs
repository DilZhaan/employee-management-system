using EMS.Infrastructure.Authentication;

namespace EMS.Infrastructure.Tests;

public sealed class BCryptPasswordHasherTests
{
    [Fact]
    public void Hash_DoesNotReturnPlainText()
    {
        var hasher = new BCryptPasswordHasher();

        var hash = hasher.Hash("DemoPass123!");

        Assert.NotEqual("DemoPass123!", hash);
        Assert.StartsWith("$2", hash, StringComparison.Ordinal);
    }

    [Fact]
    public void Verify_WithValidPassword_ReturnsTrue()
    {
        var hasher = new BCryptPasswordHasher();
        var hash = hasher.Hash("DemoPass123!");

        var result = hasher.Verify("DemoPass123!", hash);

        Assert.True(result);
    }

    [Fact]
    public void Verify_WithInvalidPassword_ReturnsFalse()
    {
        var hasher = new BCryptPasswordHasher();
        var hash = hasher.Hash("DemoPass123!");

        var result = hasher.Verify("wrong-password", hash);

        Assert.False(result);
    }

    [Fact]
    public void Verify_WithMalformedHash_ReturnsFalse()
    {
        var hasher = new BCryptPasswordHasher();

        var result = hasher.Verify("DemoPass123!", "not-a-bcrypt-hash");

        Assert.False(result);
    }
}
