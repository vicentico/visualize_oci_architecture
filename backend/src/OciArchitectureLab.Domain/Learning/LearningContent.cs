namespace OciArchitectureLab.Domain.Learning;

public class QuizQuestion
{
    public string QuestionText { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public int CorrectOptionIndex { get; set; }
    public string Explanation { get; set; } = string.Empty;
}

public class LearningContent
{
    public string ResourceType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> UseCases { get; set; } = new();
    public QuizQuestion Quiz { get; set; } = new();
}
