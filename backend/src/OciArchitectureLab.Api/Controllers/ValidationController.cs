using Microsoft.AspNetCore.Mvc;
using OciArchitectureLab.Application.Architectures.Dtos;
using OciArchitectureLab.Application.Validation.Services;
using OciArchitectureLab.Domain.Validation;

namespace OciArchitectureLab.Api.Controllers;

[ApiController]
[Route("api/validation")]
[Produces("application/json")]
public class ValidationController(ValidationService validationService) : ControllerBase
{
    [HttpPost("validate")]
    [ProducesResponseType(typeof(ValidationResult), StatusCodes.Status200OK)]
    public IActionResult Validate([FromBody] SaveArchitectureStateRequest request)
    {
        var result = validationService.ValidateArchitecture(request);
        return Ok(result);
    }
}
