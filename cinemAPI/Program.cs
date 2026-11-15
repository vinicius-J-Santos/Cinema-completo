
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSwaggerGen();

// Registrando a política CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CinemaPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://aa.netlify.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Aplicando a política CORS
app.UseCors("CinemaPolicy");

app.MapControllers();

app.Run();
