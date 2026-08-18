using Microsoft.AspNetCore.Mvc;
using OciArchitectureLab.Application.Learning.Services;

namespace OciArchitectureLab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LearningController : ControllerBase
{
    private readonly ILearningContentProvider _provider;

    public LearningController(ILearningContentProvider provider)
    {
        _provider = provider;
    }

    [HttpGet("{resourceType}")]
    public IActionResult GetLearningContent(string resourceType)
    {
        var content = _provider.GetContentForResource(resourceType);
        if (content == null)
        {
            return NotFound(new { Message = $"Learning content not found for resource type: {resourceType}" });
        }

        return Ok(content);
    }
}
