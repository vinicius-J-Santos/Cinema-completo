
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.Enums;
using cinemAPI.DTOs;

namespace cinemAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilmeController : ControllerBase
{
    private readonly IConfiguration configuration;
    private readonly IWebHostEnvironment environment;

    public FilmeController(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        this.configuration = configuration;
        this.environment = environment;
    }

    // Upload de imagem
    [HttpPost("upload-poster")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPoster(IFormFile arquivo)
    {
        if (arquivo == null || arquivo.Length == 0)
        {
            return BadRequest("Nenhuma imagem foi enviada.");
        }

        // Limite de 5 MB
        if (arquivo.Length > 5 * 1024 * 1024)
        {
            return BadRequest("A imagem deve ter no máximo 5 MB.");
        }

        // Extensões permitidas
        string extensao = Path.GetExtension(arquivo.FileName).ToLowerInvariant();

        string[] extensoesPermitidas = { ".jpg", ".jpeg", ".png", ".webp" };

        if (!extensoesPermitidas.Contains(extensao))
        {
            return BadRequest("Formato de imagem não permitido.");
        }

        // Nome único para evitar arquivos com nomes repetidos
        string nomeArquivo = $"{Guid.NewGuid()}{extensao}";

        // Caminho da pasta wwwroot/imagens
        string pastaWeb = environment.WebRootPath
            ?? Path.Combine(environment.ContentRootPath, "wwwroot");

        string pastaImagens = Path.Combine(pastaWeb, "imagens");

        Directory.CreateDirectory(pastaImagens);

        string caminhoArquivo = Path.Combine(pastaImagens, nomeArquivo);

        // Salva a imagem
        using (FileStream stream = new FileStream(caminhoArquivo, FileMode.CreateNew))
        {
            await arquivo.CopyToAsync(stream);
        }

        return Ok(new
        {
            nomeArquivo = nomeArquivo
        });
    }

    // Get all
    [HttpGet]
    public List<Filme> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection")!;

        using MySqlConnection connection = new MySqlConnection(connectionString);
        connection.Open();

        string sql = "SELECT * FROM filmes";

        using MySqlCommand command = new MySqlCommand(sql, connection);
        using MySqlDataReader reader = command.ExecuteReader();

        List<Filme> filmes = new List<Filme>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idFilme");
            string titulo = reader.GetString("tituloFilme");

            string sinopse = reader.IsDBNull(reader.GetOrdinal("sinopse"))
                ? string.Empty
                : reader.GetString("sinopse");

            int duracao = reader.GetInt32("duracao");

            ClassificacaoFilme classificacao =
                (ClassificacaoFilme)reader.GetInt32("classificacao");

            DateOnly dataLancamento =
                DateOnly.FromDateTime(reader.GetDateTime("dataLancamento"));

            string posterUrl = reader.GetString("poster");

            StatusFilme status =
                (StatusFilme)reader.GetInt32("statusFilme");

            Filme filme = new Filme(
                id,
                titulo,
                sinopse,
                duracao,
                classificacao,
                dataLancamento,
                posterUrl,
                status
            );

            filmes.Add(filme);
        }

        return filmes;
    }

    // Get por ID
    [HttpGet("{id}")]
    public IActionResult Get(int id)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection")!;

        using MySqlConnection connection = new MySqlConnection(connectionString);
        connection.Open();

        string sql = "SELECT * FROM filmes WHERE idFilme = @id";

        using MySqlCommand command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@id", id);

        using MySqlDataReader reader = command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound();
        }

        int idFilme = reader.GetInt32("idFilme");
        string titulo = reader.GetString("tituloFilme");

        string sinopse = reader.IsDBNull(reader.GetOrdinal("sinopse"))
            ? string.Empty
            : reader.GetString("sinopse");

        int duracao = reader.GetInt32("duracao");

        ClassificacaoFilme classificacao =
            (ClassificacaoFilme)reader.GetInt32("classificacao");

        DateOnly dataLancamento =
            DateOnly.FromDateTime(reader.GetDateTime("dataLancamento"));

        string posterUrl = reader.GetString("poster");

        StatusFilme status =
            (StatusFilme)reader.GetInt32("statusFilme");

        Filme filme = new Filme(
            idFilme,
            titulo,
            sinopse,
            duracao,
            classificacao,
            dataLancamento,
            posterUrl,
            status
        );

        return Ok(filme);
    }

    // Create
    [HttpPost]
    public IActionResult Create(CreateFilmeDto dto)
    {
        Filme filme = new Filme();

        filme.Titulo = dto.Titulo;
        filme.Sinopse = dto.Sinopse;
        filme.Duracao = dto.Duracao;
        filme.Classificacao = dto.Classificacao;
        filme.DataLancamento = dto.DataLancamento;
        filme.PosterUrl = dto.PosterUrl;
        filme.Status = dto.Status;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection")!;

        using MySqlConnection connection = new MySqlConnection(connectionString);
        connection.Open();

        string sql = @"
            INSERT INTO filmes
            (tituloFilme, sinopse, duracao, classificacao, dataLancamento, poster, statusFilme)
            VALUES
            (@titulo, @sinopse, @duracao, @classificacao, @dataLancamento, @posterUrl, @status)";

        using MySqlCommand command = new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@titulo", filme.Titulo);
        command.Parameters.AddWithValue("@sinopse", filme.Sinopse);
        command.Parameters.AddWithValue("@duracao", filme.Duracao);
        command.Parameters.AddWithValue("@classificacao", (int)filme.Classificacao);
        command.Parameters.AddWithValue("@dataLancamento", filme.DataLancamento);
        command.Parameters.AddWithValue("@posterUrl", filme.PosterUrl);
        command.Parameters.AddWithValue("@status", (int)filme.Status);

        command.ExecuteNonQuery();

        return Ok(filme);
    }

    // Update
    [HttpPut("{id}")]
    public IActionResult Update(int id, Filme filme)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection")!;

        using MySqlConnection connection = new MySqlConnection(connectionString);
        connection.Open();

        string sql = @"
            UPDATE filmes SET
                tituloFilme = @titulo,
                sinopse = @sinopse,
                duracao = @duracao,
                classificacao = @classificacao,
                dataLancamento = @dataLancamento,
                poster = @posterUrl,
                statusFilme = @status
            WHERE idFilme = @idFilme";

        using MySqlCommand command = new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme", id);
        command.Parameters.AddWithValue("@titulo", filme.Titulo);
        command.Parameters.AddWithValue("@sinopse", filme.Sinopse);
        command.Parameters.AddWithValue("@duracao", filme.Duracao);
        command.Parameters.AddWithValue("@classificacao", (int)filme.Classificacao);
        command.Parameters.AddWithValue("@dataLancamento", filme.DataLancamento);
        command.Parameters.AddWithValue("@posterUrl", filme.PosterUrl);
        command.Parameters.AddWithValue("@status", (int)filme.Status);

        int rowsAffected = command.ExecuteNonQuery();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok(filme);
    }

    // Delete
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection")!;

        using MySqlConnection connection = new MySqlConnection(connectionString);
        connection.Open();

        string sql = "DELETE FROM filmes WHERE idFilme = @id";

        using MySqlCommand command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@id", id);

        int rowsAffected = command.ExecuteNonQuery();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok();
    }

    // Get por categoria
    [HttpGet("categoria/{idCategoria}")]
    public IActionResult GetByCategoria(int idCategoria)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection")!;

        using MySqlConnection connection = new MySqlConnection(connectionString);
        connection.Open();

        string sql = @"
            SELECT f.*
            FROM filmes AS f
            INNER JOIN filme_categorias AS fc
                ON f.idFilme = fc.idFilme_FK
            WHERE fc.idCategoria_FK = @idCategoria";

        using MySqlCommand command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@idCategoria", idCategoria);

        using MySqlDataReader reader = command.ExecuteReader();

        List<Filme> filmes = new List<Filme>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idFilme");
            string titulo = reader.GetString("tituloFilme");

            string sinopse = reader.IsDBNull(reader.GetOrdinal("sinopse"))
                ? string.Empty
                : reader.GetString("sinopse");

            int duracao = reader.GetInt32("duracao");

            ClassificacaoFilme classificacao =
                (ClassificacaoFilme)reader.GetInt32("classificacao");

            DateOnly dataLancamento =
                DateOnly.FromDateTime(reader.GetDateTime("dataLancamento"));

            string posterUrl = reader.GetString("poster");

            StatusFilme status =
                (StatusFilme)reader.GetInt32("statusFilme");

            Filme filme = new Filme(
                id,
                titulo,
                sinopse,
                duracao,
                classificacao,
                dataLancamento,
                posterUrl,
                status
            );

            filmes.Add(filme);
        }

        if (filmes.Count == 0)
        {
            return NotFound();
        }

        return Ok(filmes);
    }
}
