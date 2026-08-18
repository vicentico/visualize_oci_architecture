using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using OciArchitectureLab.Application.Architectures.Dtos;
using OciArchitectureLab.Application.Architectures.Services;

namespace OciArchitectureLab.Api.Controllers;

/// <summary>
/// REST API for managing OCI Architectures.
/// Thin controller — delegates all logic to ArchitectureService.
/// </summary>
[ApiController]
[Route("api/architectures")]
[Produces("application/json")]
public class ArchitecturesController(
    ArchitectureService service,
    IValidator<CreateArchitectureRequest> createValidator,
    IValidator<UpdateArchitectureRequest> updateValidator) : ControllerBase
{
    /// <summary>Gets all saved architectures (summary list).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ArchitectureSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var architectures = await service.GetAllAsync(ct);
        return Ok(architectures);
    }

    /// <summary>Gets a single architecture with full detail.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ArchitectureDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var architecture = await service.GetByIdAsync(id, ct);
        return architecture is null ? NotFound() : Ok(architecture);
    }

    /// <summary>Creates a new architecture.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ArchitectureDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateArchitectureRequest request, CancellationToken ct)
    {
        var validation = await createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return ValidationProblem(new ValidationProblemDetails(errors));
        }

        var created = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Updates an existing architecture's metadata.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ArchitectureDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateArchitectureRequest request, CancellationToken ct)
    {
        var validation = await updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return ValidationProblem(new ValidationProblemDetails(errors));
        }

        var updated = await service.UpdateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    /// <summary>Updates an existing architecture's full state (Canvas sync).</summary>
    [HttpPut("{id}/state")]
    [ProducesResponseType(typeof(ArchitectureDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateState(string id, [FromBody] SaveArchitectureStateRequest request, CancellationToken ct)
    {
        var updated = await service.SaveStateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    /// <summary>Deletes an architecture.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await service.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }
}
