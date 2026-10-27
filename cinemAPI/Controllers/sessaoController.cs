using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.DTOs;
using System.Data.SqlTypes;

namespace cinemAPI.Controllers;

[ApiController]
[Route ("api/[controller]")]

public class SessaoController : ControllerBase
{
    private readonly IConfiguration configuration;

    public SessaoController(IConfiguration configuration){
        this.configuration = configuration;
    }

//Get all
    [HttpGet]
    public List<Sessao> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = "SELECT * FROM sessoes";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<Sessao> sessoes = new List<Sessao>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idSessao");
            int idFilme = reader.GetInt32("idFilme_FK");
            int idSala = reader.GetInt32("idSala_FK");
            DateTime dataHora = reader.GetDateTime("dataLancamento");
            float preco = reader.GetFloat("preco");

            Sessao sessao = new Sessao(
                id,
                idFilme,
                idSala,
                dataHora,
                preco
            );

            sessoes.Add(sessao);
        }

        return sessoes;
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
            "SELECT * FROM sessoes WHERE idSessao = @id";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@id", id);

        using MySqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound();
        }

        int idSessao = reader.GetInt32("idSessao");
        int idFilme = reader.GetInt32("idFilme_FK");
        int idSala = reader.GetInt32("idSala_FK");
        DateTime dataHora = reader.GetDateTime("dataHora");
        float preco = reader.GetFloat("preco");

        Sessao sessao = new Sessao(
            idSessao,
            idFilme,
            idSala,
            dataHora,
            preco
        );

        return Ok(sessao);
    }

    [HttpPost]
    public IActionResult Create(CreateSessaoDto dto)
    {
        Sessao sessao = new Sessao();
        sessao.IdFilme = dto.IdFilme;
        sessao.IdSala = dto.IdSala;
        sessao.DataHora = dto.DataHora;
        sessao.Preco = dto.Preco;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "INSERT INTO sessoes (idFilme_FK, idSala_FK, dataHora, preco) VALUES (@idFilme,@idSala,@dataHora,@preco)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme",sessao.IdFilme);
        command.Parameters.AddWithValue("@idSala",sessao.IdSala);
        command.Parameters.AddWithValue("@dataHora",sessao.DataHora);
        command.Parameters.AddWithValue("@preco",sessao.Preco);

        command.ExecuteNonQuery();
        return Ok(sessao);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Sessao sessao)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE sessoes SET idFilme_FK = @idFilme, idSala_FK = @idSala, dataHora = @dataHora, preco = @preco WHERE idSessao = @id";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme",sessao.IdFilme);
        command.Parameters.AddWithValue("@idSala",sessao.IdSala);
        command.Parameters.AddWithValue("@dataHora",sessao.DataHora);
        command.Parameters.AddWithValue("@preco",sessao.Preco);
        command.Parameters.AddWithValue("@id", id);

        int rowsAffected = command.ExecuteNonQuery();

        command.Dispose();
        connection.Close();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok(sessao);
    }

    //Delete(Delete)
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "DELETE FROM sessoes WHERE idSessao = @id";

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