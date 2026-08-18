using OciArchitectureLab.Domain.Learning;

namespace OciArchitectureLab.Application.Learning.Services;

public interface ILearningContentProvider
{
    LearningContent? GetContentForResource(string resourceType);
}
