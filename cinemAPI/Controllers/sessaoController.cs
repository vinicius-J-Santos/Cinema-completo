using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.DTOs;
using System.Data.SqlTypes;
using cinemAPI.Enums;

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
            DateTime dataHora = DateTime.SpecifyKind(
                reader.GetDateTime("dataHora"),
                DateTimeKind.Utc
            );
            float preco = reader.GetFloat("preco");
            StatusSessao status =
                (StatusSessao)reader.GetInt32("status");

            Sessao sessao = new Sessao(
                id,
                idFilme,
                idSala,
                dataHora,
                preco,
                status
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
        DateTime dataHora = DateTime.SpecifyKind(
            reader.GetDateTime("dataHora"),
            DateTimeKind.Utc
        );
        float preco = reader.GetFloat("preco");
        StatusSessao status =
                (StatusSessao)reader.GetInt32("status");

        Sessao sessao = new Sessao(
            idSessao,
            idFilme,
            idSala,
            dataHora,
            preco,
            status
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
        sessao.Status = StatusSessao.Disponivel;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = @"
            INSERT INTO sessoes
                (idFilme_FK, idSala_FK, dataHora, preco, status)
            VALUES
                (@idFilme, @idSala, @dataHora, @preco, @status)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme", sessao.IdFilme);
        command.Parameters.AddWithValue("@idSala", sessao.IdSala);
        command.Parameters.AddWithValue("@dataHora", sessao.DataHora);
        command.Parameters.AddWithValue("@preco", sessao.Preco);
        command.Parameters.AddWithValue("@status", (int)sessao.Status);

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
            "UPDATE sessoes SET idFilme_FK = @idFilme, idSala_FK = @idSala, dataHora = @dataHora, preco = @preco, status = @status WHERE idSessao = @id";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme",sessao.IdFilme);
        command.Parameters.AddWithValue("@idSala",sessao.IdSala);
        command.Parameters.AddWithValue("@dataHora",sessao.DataHora);
        command.Parameters.AddWithValue("@preco",sessao.Preco);
        command.Parameters.AddWithValue("@status",sessao.Status);
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
            return Conflict(new
            {
                mensagem = "Não é possível excluir esta sessão, pois existem vendas vinculadas a ela."
            });
        }

        return Ok();
    }

    [HttpGet("filme/{idFilme}")]
    public IActionResult GetPorFilme(int idFilme)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = @"
            SELECT
                se.idSessao,
                se.idFilme_FK,
                se.idSala_FK,
                sa.nomeSala,
                se.dataHora,
                se.preco,
                se.status,
                sa.capacidade,
                GREATEST(
                    sa.capacidade - COALESCE(SUM(v.quantidade), 0),
                    0
                ) AS ingressosDisponiveis

            FROM sessoes AS se

            INNER JOIN salas AS sa
                ON se.idSala_FK = sa.idSala

            LEFT JOIN vendas AS v
                ON se.idSessao = v.idSessao_FK

            WHERE se.idFilme_FK = @idFilme

            GROUP BY
                se.idSessao,
                se.idFilme_FK,
                se.idSala_FK,
                sa.nomeSala,
                se.dataHora,
                se.preco,
                se.status,
                sa.capacidade

            ORDER BY se.dataHora;
        ";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme", idFilme);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<SessaoDisponivelDto> sessoes =
            new List<SessaoDisponivelDto>();

        while (reader.Read())
        {
            SessaoDisponivelDto sessao =
                new SessaoDisponivelDto();

            sessao.IdSessao = reader.GetInt32("idSessao");
            sessao.IdFilme = reader.GetInt32("idFilme_FK");
            sessao.IdSala = reader.GetInt32("idSala_FK");
            sessao.NomeSala = reader.GetString("nomeSala");
            sessao.DataHora = DateTime.SpecifyKind(
                reader.GetDateTime("dataHora"), DateTimeKind.Utc);
            sessao.Preco = Convert.ToDecimal(reader["preco"]);
            sessao.Status = (StatusSessao)reader.GetInt32("status");
            sessao.Capacidade = reader.GetInt32("capacidade");
            sessao.IngressosDisponiveis =
                reader.GetInt32("ingressosDisponiveis");

            sessoes.Add(sessao);
        }

        return Ok(sessoes);
    }

}