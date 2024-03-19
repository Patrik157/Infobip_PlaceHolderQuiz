using System.Text;
using System.Text.Json.Serialization;
using QuizBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuizBackend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options => 
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles
);
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
var connectionStringEnv = Environment.GetEnvironmentVariable("ConnectionString");
var jwtKeyEnv = Environment.GetEnvironmentVariable("JwtKey");
var jwtIssuerEnv = Environment.GetEnvironmentVariable("JwtIssuer");

builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionStringEnv));
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<FriendService>();
builder.Services.AddScoped<QuizService>();
builder.Services.AddScoped<QuestionService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddCookie(option =>
    {
        option.Cookie.Name = "X-Access-Token";
    })
    .AddJwtBearer(option =>
    {
        option.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKeyEnv!)),
            ValidIssuer = jwtIssuerEnv,
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        option.SaveToken = true;
        option.RequireHttpsMetadata = false;
        option.Events = new JwtBearerEvents()
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["X-Access-Token"];
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
/*if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}*/
app.UseAuthentication();

app.UseHttpsRedirection();

app.UseCors(x => x
    .WithOrigins("https://frontend.d2j1yhfmbanemn.amplifyapp.com", "http://localhost:3000")
    .AllowAnyMethod()
    .AllowCredentials()
    .AllowAnyHeader());

app.UseAuthorization();

app.MapControllers();

app.Run();