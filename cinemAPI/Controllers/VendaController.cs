using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.DTOs;
using System.Data.SqlTypes;

namespace cinemAPI.Controllers;

[ApiController]
[Route ("api/[controller]")]

public class VendaController : ControllerBase
{
    private readonly IConfiguration configuration;

    public VendaController(IConfiguration configuration){
        this.configuration = configuration;
    }

//Get all
    [HttpGet]
    public List<Venda> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = "SELECT * FROM vendas";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<Venda> vendas = new List<Venda>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idVenda");
            int idSessao = reader.GetInt32("idSessao_FK");
            int quantidade = reader.GetInt32("quantidade");
            decimal valorTotal = reader.GetDecimal("valorTotal");
            DateTime dataVenda = reader.GetDateTime("dataVenda");

            Venda venda = new Venda(
                id,
                idSessao,
                quantidade,
                valorTotal,
                dataVenda
            );

            vendas.Add(venda);
        }

        return vendas;
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
            "SELECT * FROM vendas WHERE idVenda = @id";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@id", id);

        using MySqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound();
        }

        int idVenda = reader.GetInt32("idVenda");
        int idSessao = reader.GetInt32("idSessao_FK");
        int quantidade = reader.GetInt32("quantidade");
        decimal valorTotal = reader.GetDecimal("valorTotal");
        DateTime dataVenda = reader.GetDateTime("dataVenda");

        Venda venda = new Venda(
            id,
            idSessao,
            quantidade,
            valorTotal,
            dataVenda
        );

        return Ok(venda);
    }

    
    [HttpPost]
    public IActionResult Create(CreateVendaDto dto)
    {
        Venda venda = new Venda();
        venda.IdSessao = dto.IdSessao;
        venda.Quantidade = dto.Quantidade;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sqlPreco = @"
            SELECT preco
            FROM sessoes
            WHERE idSessao = @idSessao";

        using MySqlCommand commandPreco =
            new MySqlCommand(sqlPreco, connection);

        commandPreco.Parameters.AddWithValue(
            "@idSessao", dto.IdSessao);

        object? resultadoPreco = commandPreco.ExecuteScalar();

        if (resultadoPreco == null ||
            resultadoPreco == DBNull.Value)
        {
            return NotFound(new
            {
                mensagem = "Sessão não encontrada."
            });
        }

        decimal preco = Convert.ToDecimal(resultadoPreco);

        string sqlCap = @"
            SELECT sa.capacidade
            FROM sessoes AS se
            INNER JOIN salas AS sa
                ON se.idSala_FK = sa.idSala
            WHERE se.idSessao = @idSessao";

        using MySqlCommand commandCap =
            new MySqlCommand(sqlCap, connection);

        commandCap.Parameters.AddWithValue(
            "@idSessao", dto.IdSessao);

        object? resultadoCap = commandCap.ExecuteScalar();

        if (resultadoCap == null ||
            resultadoCap == DBNull.Value)
        {
            return NotFound(new
            {
                mensagem = "Sala da sessão não encontrada."
            });
        }

        int capacidade = Convert.ToInt32(resultadoCap);

        string sqlVendidos = @"
            SELECT COALESCE(SUM(quantidade), 0)
            FROM vendas
            WHERE idSessao_FK = @idSessao";

        using MySqlCommand commandVendidos =
            new MySqlCommand(sqlVendidos, connection);

        commandVendidos.Parameters.AddWithValue(
            "@idSessao", dto.IdSessao);

        int vendidos = Convert.ToInt32(
            commandVendidos.ExecuteScalar());

        int disponiveis = capacidade - vendidos;

        if (dto.Quantidade > disponiveis)
        {
            return Conflict(new
            {
                mensagem = $"Ingressos insuficientes. " +
                        $"Disponíveis: {Math.Max(0, disponiveis)}."
            });
        }

        venda.ValorTotal = preco * venda.Quantidade;

        string sql = @"
            INSERT INTO vendas
                (idSessao_FK, quantidade, valorTotal)
            VALUES
                (@idSessao, @quantidade, @valorTotal)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@idSessao", venda.IdSessao);

        command.Parameters.AddWithValue(
            "@quantidade", venda.Quantidade);

        command.Parameters.AddWithValue(
            "@valorTotal", venda.ValorTotal);

        command.ExecuteNonQuery();

        return Ok(venda);
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
            "DELETE FROM vendas WHERE idVenda = @id";

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