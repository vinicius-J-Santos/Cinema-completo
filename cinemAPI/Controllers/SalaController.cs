using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.DTOs;
using System.Data.SqlTypes;

namespace cinemAPI.Controllers;

[ApiController]
[Route ("api/[controller]")]

public class SalaController : ControllerBase
{
    private readonly IConfiguration configuration;

    public SalaController(IConfiguration configuration){
        this.configuration = configuration;
    }

//Get all
    [HttpGet]
    public List<Sala> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = "SELECT * FROM salas";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<Sala> salas = new List<Sala>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idSala");
            string nome = reader.GetString("nomeSala");
            int capacidade = reader.GetInt32("capacidade");

            Sala sala = new Sala(
                id,
                nome,
                capacidade
            );

            salas.Add(sala);
        }

        return salas;
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
            "SELECT * FROM salas WHERE idSala = @id";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@id", id);

        using MySqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound();
        }

        int idSala = reader.GetInt32("idSala");
        string nome = reader.GetString("nomeSala");
        int capacidade = reader.GetInt32("capacidade");

        Sala sala = new Sala(
            idSala,
            nome,
            capacidade
        );

        return Ok(sala);
    }

    [HttpPost]
    public IActionResult Create(CreateSalaDto dto)
    {
        Sala sala = new Sala();
        sala.NomeSala = dto.NomeSala;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "INSERT INTO salas (NomeSala, capacidade) VALUES (@nome,@capacidade)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@nome",sala.NomeSala);
        command.Parameters.AddWithValue("@capacidade",sala.Capacidade);

        command.ExecuteNonQuery();
        return Ok(sala);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Sala sala)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE salas SET NomeSala = @name, capacidade = @capacidade WHERE idSala = @id";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@name", sala.NomeSala);
        command.Parameters.AddWithValue("@capacidade", sala.Capacidade);
        command.Parameters.AddWithValue("@id", id);

        int rowsAffected = command.ExecuteNonQuery();

        command.Dispose();
        connection.Close();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok(sala);
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
            "DELETE FROM salas WHERE idSala = @id";

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