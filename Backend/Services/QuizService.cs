using AutoMapper;
using Microsoft.EntityFrameworkCore;
using QuizBackend.Data;
using QuizBackend.Dto.QuestionDto;
using QuizBackend.Dto.QuizDto;
using QuizBackend.Dto.UserDto;
using QuizBackend.Models;
using RestSharp;
using Enum = QuizBackend.Models.Enum;

namespace QuizBackend.Services;

public class QuizService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public QuizService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<QuizBasicPaginationDto> GetAll(int page)
    {
        const float pageResults = 10f;  //number of quizzes per page
        var pageCount = Math.Ceiling(_context.Quizzes.Count() / pageResults);
        var quizzes = await _context.Quizzes
            .Include(q => q.MainCategory)
            .Skip((page) * (int)pageResults)
            .Take((int)pageResults)
            .ToListAsync();
        
        var quizzesDto = _mapper.Map<List<QuizBasicDto>>(quizzes);
        var quizzesResponseDto = new QuizBasicPaginationDto(quizzesDto, (int)pageCount, page);
        return quizzesResponseDto;
    }

    public async Task<QuestionFetchDto> FetchQuiz(QuizBasicWPasswordDto quiz, string username)
    {
        var quizPrivate = await _context.Quizzes
            .Include(q => q.MainCategory)
            .Include(q => q.Questions)
            .ThenInclude(qu => qu.Choices)
            .Include(q => q.Questions)
            .ThenInclude(qu => qu.Category)
            .Include(q => q.Users)
            .FirstOrDefaultAsync(q =>q.Id == quiz.Id) 
                          ?? throw new Exception("Quiz not found");
        
        if(quiz.Password != quizPrivate.Password && quizPrivate.IsPrivate == true)
        {
            throw new Exception("Wrong password");
        }
        var willScore = quizPrivate.Users.Any(u => u.Username == username) == false;
        var questionResponse = new QuestionFetchDto(quizPrivate.Questions, willScore, quizPrivate.Name);
        return questionResponse;
    }
    
    public async Task<QuizCheckDto> CheckPoints(Quiz quiz, string username)     
    {
        var user = await _context.Users
            .Include(user => user.Leaderboard)
            .Include(user => user.Friends)
            .FirstOrDefaultAsync(user => user.Username == username) 
                   ?? throw new Exception("Invalid user");
        var points = 0;
        var quizCheckResponse = new QuizCheckDto();
        var quizAnswered = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(question => question.Category)
            .Include(q => q.Questions)
                .ThenInclude(question => question.Choices)
            .Include(q => q.Questions)
            .ThenInclude(question => question.Answer)
            .Include(q => q.Leaderboard)
            .Include(q => q.Users)
            .FirstAsync(q => q.Id == quiz.Id);
        
        if(quizAnswered.Password != quiz.Password && quizAnswered.IsPrivate == true)
        {
            throw new Exception("Wrong password");
        }
        
        var q1 = quiz.Questions.ToArray();
        var q2 = quizAnswered.Questions.ToArray();
        foreach (var question in q1)
        {
            var questionDb = q2.FirstOrDefault(q => q.Id == question.Id) 
                             ?? throw new Exception("Question not found");
            var answerDb = questionDb.Answer.ToArray()[0].Text;
            var answerInput = question.Answer.ToArray()[0].Text;
            if (answerInput == null)
            {
                continue;
            }

            if (question.QuestionType == Enum.AnswerTypeEnum.MultipleChoice)
            {
                    double tempPoints = 0;
                    foreach (var singleAnswer in question.Answer)
                    {
                        if (questionDb.Answer.Select(q=> q.Text).Contains(singleAnswer.Text))
                        {
                            tempPoints += (float)questionDb.Points / questionDb.Answer.Count; //value of fraction of answer
                        }
                        else
                        {
                            tempPoints -= (float)questionDb.Points / questionDb.Answer.Count;
                            quizCheckResponse.CorrectAnswers?.Add(_mapper.Map<QuestionBasicDto>(questionDb));
                        }
                    }
                    if (tempPoints < 0)
                    {
                        tempPoints = 0;
                    }
                    else if (tempPoints > questionDb.Points)
                    {
                        tempPoints = questionDb.Points;
                    }
                    points += (int) Math.Floor(tempPoints);
            }
            else
            {
                    if (string.Equals(answerDb, answerInput, StringComparison.CurrentCultureIgnoreCase))
                    {
                        points += questionDb.Points;
                    }
                    else
                    {
                        quizCheckResponse.CorrectAnswers?.Add(_mapper.Map<QuestionBasicDto>(questionDb));
                    }
            }
        }
        quizCheckResponse.Points = points;
        if (quizAnswered.Users.Contains(user))
        {
            //return quizCheckResponse;
        }

        var quizScore = new QuizScore
        {
            QuizId = quizAnswered.Id,
            Score = points,
        };
        quizAnswered.Users.Add(user);
        
        if (user.Friends != null)
                foreach (var friendId in user.Friends)
                {
                    var friend = await _context.Users.FirstOrDefaultAsync(f => f.Id == friendId.FriendId)
                                 ?? throw new Exception("Invalid user!");
                    if (friend.TotalRanking < user.TotalRanking ||
                        friend.TotalRanking >= user.TotalRanking + points)  continue;
                    var options = new RestClientOptions("https://j39g1v.api.infobip.com")
                    {
                        MaxTimeout = -1,
                    };

                    var client = new RestClient(options);
                    var r = new RestRequest("/email/3/send", Method.Post);
                    var infobipApi = Environment.GetEnvironmentVariable("InfobipAPI");
                    r.AddHeader("Authorization", $"App {infobipApi}");
                    r.AddHeader("Accept", "application/json");
                    r.AlwaysMultipartFormData = true;
                    r.AddParameter("from", "Quiz <patrik.misura44@gmail.com>");
                    r.AddParameter("subject", "Ranking update");
                    r.AddParameter("to",
                        "{\"to\":\"patrik.misura44@gmail.com\",\"placeholders\":{\"firstName\":\"Patrik\"}}");
                    r.AddParameter("text",
                        $"Hi {friendId.Friend.Username} your friend {user.Username} has overtaken you in ranking!");
                    var response = await client.ExecuteAsync(r);
                }
        user.TotalRanking += points;
        user.Quizzes.Add(quizAnswered);
        user.Leaderboard.Add(quizScore);
        await _context.SaveChangesAsync();
        return quizCheckResponse;
    }

    public async Task AddQuiz(Quiz quiz, string username, bool addToValidation)
    {
        var user = await _context.Users
                       .FirstAsync(user => user.Username == username)
                   ?? throw new Exception("Invalid user");
        if (string.IsNullOrEmpty(quiz.Name))
        {
            throw new Exception("No quiz name");
        }

        if (quiz.Password != null)
        {
            quiz.IsPrivate = true;
        }

        quiz.Length = quiz.Questions.Count;
        switch (quiz.Length)
        {
            case > 50:
                throw new Exception("Too many questions");
            case <= 0:
                throw new Exception("Please add at least one question");
        }
        quiz.Owner = user.Username;
        var answers = _context.Answers.ToList();
        var questions = _context.Questions
            .Include(question => question.Category).ToList();
        var quizQuestions = quiz.Questions.ToList();
        var questionsCopy = new List<Question>(quizQuestions.Count);
        foreach (var t in quizQuestions)
        {
            var question = t;
            if (question.Answer.ToArray()[0].Text == null)
            {
                throw new Exception("No answer");
            }
            //keeps points in bounds if somehow a wrong number gets sent
            question.Points = question.Points switch
            {
                > 10 => 10,
                < 0 => 0,
                _ => question.Points
            };
            //Related to auto generation of quizzes
            question.IsPrivate = !addToValidation;
            question.IsValidated = true;    //in future change to false when adding admin validation
            //handling of multiple answers
            //
            //
            //OVDJE MJENJATI OPTIMIZACIJU
            //
            //
            if (question.QuestionType == Enum.AnswerTypeEnum.MultipleChoice)
            {
                if (question.Choices.Count < 2)
                {
                    throw new Exception("Multiple choice question must have more than one choice!");
                }
                foreach (var choice in question.Choices)
                {
                    var foundAnswer = answers
                        .FirstOrDefault(a => string.Equals(
                            a.Text, choice.Text,
                            StringComparison.CurrentCultureIgnoreCase));
                    if (foundAnswer != null)
                    {
                        question.Choices.ToArray()[0] = foundAnswer;
                    }
                }
            }
            var foundQuestion = questions
                .FirstOrDefault(q => q.Text.ToLower() == question.Text.ToLower()
                                     && (q.Category.Id == question.Category.Id)
                                     && q.Points == question.Points
                                     && q.QuestionType == question.QuestionType
                                     && q.Answer.ToArray()[0] == question.Answer.ToArray()[0]
                                     && q.IsPrivate == question.IsPrivate);
            if (foundQuestion != null)
            {  
                var foundAnswer = answers
                    .FirstOrDefault(a => string.Equals(
                        a.Text, question.Answer.ToArray()[0].Text,
                        StringComparison.CurrentCultureIgnoreCase));
                if (foundAnswer != null)
                {
                    question.Answer.ToArray()[0] = foundAnswer;
                    question = foundQuestion;
                }
            }
            else
            {
                var foundAnswer = answers
                    .FirstOrDefault(a => string.Equals(
                        a.Text, question.Answer.ToArray()[0].Text,
                        StringComparison.CurrentCultureIgnoreCase));
                if (foundAnswer != null)
                {
                    question.Answer.ToArray()[0] = foundAnswer;
                }
                question.Category = await _context.Categories
                                        .FirstOrDefaultAsync(c => c.Id == question.Category.Id) 
                                    ?? throw new Exception("No category");
            }
            questionsCopy.Add(question);
        }
        
        quiz.Questions = questionsCopy;
        var mainCategoryId = quiz.Questions.Max(q => q.Category.Id);
        var mainCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Id == mainCategoryId);
        quiz.MainCategory = mainCategory;
        quiz.Users.Add(user);
        user.Quizzes.Add(quiz);
        await _context.Quizzes.AddAsync(quiz);
        await _context.SaveChangesAsync();
    }
    
    private async Task<(List<Quiz>, int)> FilteredQuizzes(QuizFilterDto filter, int page, float pageResults, User user)
    {
        var filteredQuizzes = await _context.Quizzes
            .Where(q => q.Name.Contains(filter.Name) || string.IsNullOrEmpty(filter.Name))
            .Where(q => q.IsPrivate == filter.IsPrivate || filter.IsPrivate == null)
            .Where(q=> q.Length >= filter.LengthMin && q.Length <= filter.LengthMax)
            .Where(q=> q.MainCategory!.Id == filter.MainCategoryId || filter.MainCategoryId == null)
            .Where(q => filter.ShowPlayed || !q.Users.Contains(user))
            .Include(q => q.MainCategory)
            .Include(q => q.Questions)
            .ThenInclude(qu => qu.Category)
            .Where(q => filter.ExcludedId == null || filter.ExcludedId.Count == 0 || !q.Questions
                .Any(qu => filter.ExcludedId.Contains(qu.Category.Id)))
            .ToListAsync();
        var pageCount = Math.Ceiling(filteredQuizzes.Count / pageResults);
        filteredQuizzes = filteredQuizzes
            .Skip((page) * (int)pageResults)
            .Take((int)pageResults)
            .ToList();
        return (filteredQuizzes.OrderBy(q => string.IsNullOrEmpty(filter.Name) ? 0 : LevenshteinDistance(q.Name, filter.Name))
            .ToList(), (int) pageCount);
    }

    private static int LevenshteinDistance(string s, string t)  //edit distance algorithm to find strings that match the most
    {
        var n = s.Length;
        var m = t.Length;
        var d = new int[n + 1, m + 1];
        
        if (n == 0)
        {
            return m;
        }

        if (m == 0)
        {
            return n;
        }
        
        for (var i = 0; i <= n; d[i, 0] = i++)
        {
        }

        for (var j = 0; j <= m; d[0, j] = j++)
        {
        }
        
        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                var cost = (t[j - 1] == s[i - 1]) ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }
        return d[n, m];
    }

    public async Task<QuizBasicPaginationDto> GetFilterQuizzesPagination(QuizFilterDto filter, int page, string username)
    {
        var user = await _context.Users
                       .FirstOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        const float pageResults = 10f;  //number of quizzes per page
        var (filteredQuizzes, pageCount) = await FilteredQuizzes(filter, page, pageResults, user);
        
        var quizzesDto = _mapper.Map<List<QuizBasicDto>>(filteredQuizzes);
        var quizzesResponseDto = new QuizBasicPaginationDto(quizzesDto, pageCount, page);
        
        return quizzesResponseDto;
    }
    public async Task<int> QuickJoin(QuizFilterDto filter, string username)
    {
        filter.Name = null!;
        filter.IsPrivate = false;
        var user = await _context.Users
                       .FirstOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        
        var (filteredQuizzes, pageCount) = await FilteredQuizzes(filter, 0, 20f, user);
        var index = new Random().Next(filteredQuizzes.Count);
        return filteredQuizzes[index].Id;
    }

    public async Task<IndividualLeaderboardDto> GetLeaderboard(int id, int page, string username)
    {
        const float pageResults = 10f;
        var quiz = await _context.Quizzes.Include(q => q.Leaderboard)!
            .ThenInclude(quizScore => quizScore.User)
            .Include(q => q.Users)
            .FirstOrDefaultAsync(q => q.Id == id) 
                   ?? throw new Exception("Quiz not found");
        var user = await _context.Users
                       .FirstOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        if (quiz.IsPrivate == true && !quiz.Users.Contains(user))
        {
            throw new Exception("private");
        }
        var entries = new List<UserBasicWScoreDto>();
        var leaderboard = new IndividualLeaderboardDto()
        {
            QuizName = quiz.Name,
            Rankings = entries
        };
        if (quiz.Leaderboard == null)
        {
            return leaderboard;
        }
        var pageCount = Math.Ceiling(quiz.Leaderboard.Count / pageResults);
        entries.AddRange(quiz.Leaderboard
                .Skip((page) * (int)pageResults)
                .Take((int)pageResults)
            .Select(entry => new UserBasicWScoreDto 
                { User = _mapper.Map<UserBasicDto>(entry.User), Score = entry.Score }));
        leaderboard.Rankings  = entries;
        leaderboard.Pages = (int)pageCount;
        leaderboard.CurrentPage = page;
        return leaderboard;
    }

    public async Task<Quiz> GenerateQuiz(QuizGenerateDto filter, string username)
    {
        var r = new Random(); 
        var quiz = new Quiz()
        {
            Name = filter.Name,
            Description = $"Quiz autogenerated by {username}",
            Owner = username
        };
        var questions =await _context.Questions
            .Where(q => filter.ExcludedId != null && !filter.ExcludedId.Contains(q.Category.Id))
            .Include(q => q.Category)
            .Include(q => q.Choices)
            .ToListAsync();
        int cnt = 0;
        for (var i = 0; i < filter.Length; i++)
        {
            var question = questions.ElementAt(r.Next(1, questions.Count));
            quiz.Questions.Add(question);
            questions.Remove(question);
            cnt++;
            if (questions.Count == 0)
            {
                break;
            }
        }

        quiz.Length = cnt;
        var mainCategoryId = quiz.Questions.Max(q => q.Category.Id);
        var mainCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Id == mainCategoryId);
        quiz.MainCategory = mainCategory;

        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();
        return quiz;
    }
}