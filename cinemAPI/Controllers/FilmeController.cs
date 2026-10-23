using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.Enums;
using cinemAPI.DTOs;
using System.Data.SqlTypes;

namespace cinemAPI.Controllers;

[ApiController]
[Route ("api/[controller]")]

public class FilmeController : ControllerBase
{
    private readonly IConfiguration configuration;

    public FilmeController(IConfiguration configuration){
        this.configuration = configuration;
    }

//Get all
    [HttpGet]
    public List<Filme> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = "SELECT * FROM filmes";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<Filme> filmes = new List<Filme>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idFilme");
            string titulo = reader.GetString("tituloFilme");

            string sinopse = reader.IsDBNull(
                reader.GetOrdinal("sinopse"))
                    ? string.Empty
                    : reader.GetString("sinopse");

            int duracao = reader.GetInt32("duracao");

            ClassificacaoFilme classificacao =
                (ClassificacaoFilme)reader.GetInt32("classificacao");

            DateOnly dataLancamento =
                DateOnly.FromDateTime(
                    reader.GetDateTime("dataLancamento"));

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


    [HttpGet("{id}")]
    public IActionResult Get(int id)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "SELECT * FROM filmes WHERE idFilme = @id";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@id", id);

        using MySqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound();
        }

        int idFilme = reader.GetInt32("idFilme");
        string titulo = reader.GetString("tituloFilme");

        string sinopse = reader.IsDBNull(
            reader.GetOrdinal("sinopse"))
                ? string.Empty
                : reader.GetString("sinopse");

        int duracao = reader.GetInt32("duracao");

        ClassificacaoFilme classificacao =
            (ClassificacaoFilme)reader.GetInt32("classificacao");

        DateOnly dataLancamento =
            DateOnly.FromDateTime(
                reader.GetDateTime("dataLancamento"));

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
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "INSERT INTO filmes (tituloFilme,sinopse,duracao,classificacao,dataLancamento,poster,statusFilme) VALUES (@titulo,@sinopse,@duracao,@classificacao,@dataLancamento,@posterUrl,@status)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@titulo",filme.Titulo);
        command.Parameters.AddWithValue("@sinopse",filme.Sinopse);
        command.Parameters.AddWithValue("@duracao",filme.Duracao);
        command.Parameters.AddWithValue("@classificacao",(int)filme.Classificacao);
        command.Parameters.AddWithValue("@dataLancamento",filme.DataLancamento);
        command.Parameters.AddWithValue("@posterUrl",filme.PosterUrl);
        command.Parameters.AddWithValue("@status",(int)filme.Status);

        command.ExecuteNonQuery();
        return Ok(filme);
    }

    

    [HttpPut("{id}")]
    public IActionResult Update(int id, Filme filme)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE filmes SET tituloFilme = @titulo, sinopse = @sinopse ,duracao = @duracao, classificacao = @classificacao, dataLancamento = @dataLancamento, poster = @posterUrl, statusFilme = @status";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@titulo",filme.Titulo);
        command.Parameters.AddWithValue("@sinopse",filme.Sinopse);
        command.Parameters.AddWithValue("@duracao",filme.Duracao);
        command.Parameters.AddWithValue("@classificacao",(int)filme.Classificacao);
        command.Parameters.AddWithValue("@dataLancamento",filme.DataLancamento);
        command.Parameters.AddWithValue("@posterUrl",filme.PosterUrl);
        command.Parameters.AddWithValue("@status",(int)filme.Status);

        int rowsAffected = command.ExecuteNonQuery();

        command.Dispose();
        connection.Close();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok(filme);
    }


    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "DELETE FROM filmes WHERE idFilme = @id";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@id", id);

        int rowsAffected = command.ExecuteNonQuery();

        command.Dispose();
        connection.Close();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok();
    }

}