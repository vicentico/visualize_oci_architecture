using Microsoft.AspNetCore.Mvc;
using OciArchitectureLab.Application.Export.Services;
using OciArchitectureLab.Domain.Repositories;

namespace OciArchitectureLab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IArchitectureRepository _repository;
    private readonly IMarkdownGeneratorService _markdownGenerator;
    private readonly ITerraformGeneratorService _terraformGenerator;

    public ExportController(
        IArchitectureRepository repository, 
        IMarkdownGeneratorService markdownGenerator,
        ITerraformGeneratorService terraformGenerator)
    {
        _repository = repository;
        _markdownGenerator = markdownGenerator;
        _terraformGenerator = terraformGenerator;
    }

    [HttpGet("{id}/terraform")]
    public async Task<IActionResult> ExportToTerraform(string id)
    {
        var architecture = await _repository.GetByIdAsync(id);
        if (architecture == null)
        {
            return NotFound(new { Message = $"Architecture with ID {id} not found." });
        }

        var terraform = _terraformGenerator.GenerateTerraform(architecture);
        
        // Return as a downloadable file
        var bytes = System.Text.Encoding.UTF8.GetBytes(terraform);
        return File(bytes, "application/octet-stream", $"architecture_{architecture.Name}.tf");
    }

    [HttpGet("{id}/markdown")]
    public async Task<IActionResult> ExportToMarkdown(string id)
    {
        var architecture = await _repository.GetByIdAsync(id);
        if (architecture == null)
        {
            return NotFound(new { Message = $"Architecture with ID {id} not found." });
        }

        var markdown = _markdownGenerator.GenerateMarkdown(architecture);
        
        // Return as a downloadable file
        var bytes = System.Text.Encoding.UTF8.GetBytes(markdown);
        return File(bytes, "text/markdown", $"Architecture_{architecture.Name}.md");
    }
}
