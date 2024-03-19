using AutoMapper;
using Microsoft.EntityFrameworkCore;
using QuizBackend.Data;
using QuizBackend.Dto.GeneralDto;
using QuizBackend.Dto.QuestionDto;
using QuizBackend.Models;
using Enum = QuizBackend.Models.Enum;

namespace QuizBackend.Services;

public class QuestionService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public QuestionService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Question> AddQuestion(Question question)
    {
        
        question.IsPrivate = false;
        question.IsValidated = true;   //change to false after adding admin verification
        if (question.Answer.ToArray()[0].Text == null)
        {
            throw new Exception("No answer!");
        }

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == question.Category.Name) 
                       ?? throw new Exception("Category doesnt exist!");
        question.Category = category;
        await _context.Questions.AddAsync(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<List<Category>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    public async Task<string> AddCategory(CategoryDto category)
    {
        if (category.CategoryName == null)
        {
            throw new Exception("Category name required");
        }
        var newCategory = new Category
        {
            Name = category.CategoryName
        };
        await _context.Categories.AddAsync(newCategory);
        await _context.SaveChangesAsync();
        return newCategory.Name;
    }
    
    public QuestionLandingDto GetLandingQuestions()
    {
        var r = new Random(); 
        var questions = _context.Questions.Include(q => q.Answer).Where(q => q.QuestionType == Enum.AnswerTypeEnum.Text)
            .ToList();
        var question = questions.ElementAt(r.Next(1, questions.Count));

        var questionLanding = new QuestionLandingDto
        {
            Text = question.Text,
            Answer = question.Answer.ToArray()[0].Text ?? throw new Exception("No answer")
        };
        return questionLanding;
    }

    private IEnumerable<Question> GetVerifiedQuestions()
    {
        return _context.Questions
            .Include(q => q.Answer)
            .Where(q => q.IsValidated)
            .OrderBy(q => Guid.NewGuid())
            .Take(1)
            .AsEnumerable();
    }

    public async Task<List<QuestionIdDto>> ValidateQuestions(List<QuestionIdDto> questions)
    {
        var errorList = new List<QuestionIdDto>();
        foreach (var question in questions)
        {
            var questionDb = await _context.Questions.FirstOrDefaultAsync(q => q.Id == question.Id);
            if (questionDb == null)
            {
                errorList.Add(question);
            }
            else
            {
                questionDb.IsValidated = true;
            }
        }
        await _context.SaveChangesAsync();
        return errorList;
    }

    public async Task<List<QuestionToValidateDto>> ListNonValidated()
    {
        var questions = await _context.Questions
            .Include(q => q.Choices)
            .Include(q => q.Answer)
            .Include(q => q.Category)
            .Where(q => q.IsValidated == false && q.IsPrivate == false)
            .ToListAsync();
        var questionsToValidate = new List<QuestionToValidateDto>();
        questionsToValidate = _mapper.Map(questions, questionsToValidate);
        return questionsToValidate;
    }
}