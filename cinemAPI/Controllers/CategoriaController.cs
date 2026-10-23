using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.DTOs;
using System.Data.SqlTypes;

namespace cinemAPI.Controllers;

[ApiController]
[Route ("api/[controller]")]

public class CategoriaController : ControllerBase
{
    private readonly IConfiguration configuration;

    public CategoriaController(IConfiguration configuration){
        this.configuration = configuration;
    }

//Get all
    [HttpGet]
    public List<Categoria> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = "SELECT * FROM categorias";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<Categoria> categorias = new List<Categoria>();

        while (reader.Read())
        {
            int id = reader.GetInt32("idCategoria");
            string nome = reader.GetString("nomeCategoria");

            Categoria categoria = new Categoria(
                id,
                nome
            );

            categorias.Add(categoria);
        }

        return categorias;
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
            "SELECT * FROM categorias WHERE idCategoria = @id";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@id", id);

        using MySqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound();
        }

        int idCategoria = reader.GetInt32("idCategoria");
        string nomeCategoria = reader.GetString("nomeCategoria");

        Categoria categoria = new Categoria(
            idCategoria,
            nomeCategoria
        );

        return Ok(categoria);
    }

    [HttpPost]
    public IActionResult Create(CreateCategoriaDto dto)
    {
        Categoria categoria = new Categoria();
        categoria.Nome = dto.Nome;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "INSERT INTO categorias (nomeCategoria) VALUES (@nome)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@nome",categoria.Nome);

        command.ExecuteNonQuery();
        return Ok(categoria);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Categoria categoria)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE categorias SET nomeCategoria = @name WHERE idCategoria = @id";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@name", categoria.Nome);
        command.Parameters.AddWithValue("@id", id);

        int rowsAffected = command.ExecuteNonQuery();

        command.Dispose();
        connection.Close();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok(categoria);
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
            "DELETE FROM categorias WHERE idCategoria = @id";

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