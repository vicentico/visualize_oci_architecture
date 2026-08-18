using Microsoft.AspNetCore.Mvc;
using OciArchitectureLab.Application.Simulation.Dtos;
using OciArchitectureLab.Application.Simulation.Services;
using OciArchitectureLab.Domain.Simulation;

namespace OciArchitectureLab.Api.Controllers;

[ApiController]
[Route("api/simulation")]
[Produces("application/json")]
public class SimulationController(SimulationService simulationService) : ControllerBase
{
    [HttpPost("path")]
    [ProducesResponseType(typeof(TrafficSimulationResult), StatusCodes.Status200OK)]
    public IActionResult SimulatePath([FromBody] SimulationRequest request)
    {
        var result = simulationService.SimulateTraffic(request);
        return Ok(result);
    }
}
