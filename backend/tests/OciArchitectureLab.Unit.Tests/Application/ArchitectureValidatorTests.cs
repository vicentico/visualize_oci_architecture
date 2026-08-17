using FluentValidation;
using OciArchitectureLab.Application.Architectures.Dtos;
using OciArchitectureLab.Application.Architectures.Validators;

namespace OciArchitectureLab.Unit.Tests.Application;

public class ArchitectureValidatorTests
{
    private readonly CreateArchitectureRequestValidator _validator = new();

    [Fact]
    public async Task ValidRequest_ShouldPassValidation()
    {
        var request = new CreateArchitectureRequest("My Architecture", "us-ashburn-1", "Description");
        var result = await _validator.ValidateAsync(request);
        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task EmptyName_ShouldFailValidation()
    {
        var request = new CreateArchitectureRequest("", "us-ashburn-1");
        var result = await _validator.ValidateAsync(request);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Name");
    }

    [Fact]
    public async Task InvalidRegion_ShouldFailValidation()
    {
        var request = new CreateArchitectureRequest("Test", "invalid-region-1");
        var result = await _validator.ValidateAsync(request);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Region");
    }

    [Theory]
    [InlineData("sa-santiago-1")]
    [InlineData("us-ashburn-1")]
    [InlineData("eu-frankfurt-1")]
    public async Task ValidRegions_ShouldPassValidation(string region)
    {
        var request = new CreateArchitectureRequest("Test", region);
        var result = await _validator.ValidateAsync(request);
        Assert.DoesNotContain(result.Errors, e => e.PropertyName == "Region");
    }
}
