using Microsoft.EntityFrameworkCore;
using QuizBackend.Models;

namespace QuizBackend.Data;

public class AppDbContext : DbContext
{

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserFriend>()
            .HasOne(f => f.User)
            .WithMany(u => u.Friends) 
            .HasForeignKey(f => f.UserId);
        modelBuilder.Entity<UserFriendRequest>()
            .HasOne(rf => rf.Sender)
            .WithMany()
            .HasForeignKey(rf => rf.SenderId);
        modelBuilder.Entity<UserFriendRequest>()
            .HasOne(rf => rf.Receiver)
            .WithMany(u => u.FriendRequests)
            .HasForeignKey(rf => rf.ReceiverId);
        modelBuilder.Entity<Question>()
            .HasKey(q => q.Id);
        modelBuilder.Entity<Quiz>()
            .HasMany(x=> x.Questions)
            .WithMany(x=> x.Quizzes)
            .UsingEntity(j => j.ToTable("QuizQuestion"));
        modelBuilder.Entity<Quiz>()
            .HasMany(x => x.Users)
            .WithMany(y => y.Quizzes)
            .UsingEntity(j => j.ToTable("UserQuiz"));
        modelBuilder.Entity<Quiz>()
            .HasMany(q => q.Leaderboard)
            .WithOne(rt => rt.Quiz)
            .HasForeignKey(rt => rt.QuizId);
        modelBuilder.Entity<User>()
            .HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId);
        modelBuilder.Entity<User>()
            .HasMany(u => u.Leaderboard)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId);
        modelBuilder.Entity<Question>()
            .HasMany(q => q.Choices)
            .WithMany(a => a.Question)
            .UsingEntity(c => c.ToTable("QuestionChoices"));
        modelBuilder.Entity<Question>()
            .HasMany(q => q.Answer)
            .WithMany(a => a.Correct)
            .UsingEntity(c => c.ToTable("QuestionAnswers"));
    }

    public DbSet<User> Users { get; set; }
    
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserFriend> UserFriends { get; set; }
    
    public DbSet<QuizScore> Leaderboards { get; set; }

    public DbSet<UserFriendRequest> UserFriendRequest { get; set; }
    
    public DbSet<Question> Questions { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    
    public  DbSet<Category> Categories { get; set; }
    
    public DbSet<Answer> Answers { get; set; }
    
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    
    public DbSet<Bug> Bugs { get; set; }
}