using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Simulation;

public class PathFinder
{
    public TrafficSimulationResult FindPath(Architecture architecture, string sourceId, string targetId)
    {
        var sourceExists = architecture.Resources.Any(r => r.Id == sourceId);
        var targetExists = architecture.Resources.Any(r => r.Id == targetId);

        if (!sourceExists || !targetExists)
        {
            return new TrafficSimulationResult(false, "Source or Target node not found in the architecture.", []);
        }

        if (sourceId == targetId)
        {
            return new TrafficSimulationResult(false, "Source and Target are the same node.", []);
        }

        // BFS to find shortest path
        var queue = new Queue<string>();
        var visited = new HashSet<string>();
        var cameFrom = new Dictionary<string, ResourceConnection>();

        queue.Enqueue(sourceId);
        visited.Add(sourceId);

        bool found = false;

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();

            if (current == targetId)
            {
                found = true;
                break;
            }

            // Find all outgoing connections from 'current'
            var outgoing = architecture.Connections
                .Where(c => c.SourceResourceId == current || 
                            (c.Direction == ConnectionDirection.Bidirectional && c.TargetResourceId == current))
                .ToList();

            foreach (var conn in outgoing)
            {
                var neighbor = conn.SourceResourceId == current ? conn.TargetResourceId : conn.SourceResourceId;

                if (!visited.Contains(neighbor))
                {
                    visited.Add(neighbor);
                    cameFrom[neighbor] = conn;
                    queue.Enqueue(neighbor);
                }
            }
        }

        if (!found)
        {
            return new TrafficSimulationResult(false, "No valid network path found between source and target.", []);
        }

        // Reconstruct path
        var path = new List<TrafficHop>();
        var currentReconstruct = targetId;
        var order = 0;

        while (currentReconstruct != sourceId)
        {
            var conn = cameFrom[currentReconstruct];
            var from = conn.SourceResourceId == currentReconstruct ? conn.TargetResourceId : conn.SourceResourceId;
            
            // Insert at beginning to reverse the path
            path.Insert(0, new TrafficHop(conn.Id, from, currentReconstruct, order));
            currentReconstruct = from;
        }

        // Fix order indices
        for (int i = 0; i < path.Count; i++)
        {
            path[i] = path[i] with { SequenceOrder = i + 1 };
        }

        return new TrafficSimulationResult(true, null, path.AsReadOnly());
    }
}
