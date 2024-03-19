using AutoMapper;
using QuizBackend.Dto.FriendDto;
using QuizBackend.Dto.QuestionDto;
using QuizBackend.Dto.QuizDto;
using QuizBackend.Dto.UserDto;
using QuizBackend.Models;

namespace QuizBackend.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<UserDto, User>();
        CreateMap<User, UserDto>();
        CreateMap<Quiz, QuizBasicDto>();
        CreateMap<Quiz, QuizFullDto>();
        CreateMap<Question, QuestionToValidateDto>();
        CreateMap<Question, QuestionBasicDto>();
        CreateMap<User, FriendDto>();
        CreateMap<QuizBasicDto, Quiz>();
        CreateMap<User, UserBasicDto>();
        CreateMap<Quiz, UserQuizScoreDto>();
        CreateMap<User, UserGlobalRankingDto>();
        CreateMap<User, UserHomepageDto>();
    }
}