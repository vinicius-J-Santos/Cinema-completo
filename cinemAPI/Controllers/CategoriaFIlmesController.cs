using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using cinemAPI.Models;
using cinemAPI.DTOs;
using System.Data.SqlTypes;

namespace cinemAPI.Controllers;

[ApiController]
[Route ("api/[controller]")]

public class CategoriaFilmeController : ControllerBase
{
    private readonly IConfiguration configuration;

    public CategoriaFilmeController(IConfiguration configuration){
        this.configuration = configuration;
    }

//Get all
    [HttpGet]
    public List<CategoriaFilme> Get()
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = "SELECT * FROM filme_categorias";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        using MySqlDataReader reader =
            command.ExecuteReader();

        List<CategoriaFilme> categoriaFilmes = new List<CategoriaFilme>();

        while (reader.Read())
        {
            int idFilme = reader.GetInt32("idFilme_FK");
            int idCategoria = reader.GetInt32("idCategoria_FK");

            CategoriaFilme categoriaFilme = new CategoriaFilme(
                idFilme,
                idCategoria
            );

            categoriaFilmes.Add(categoriaFilme);
        }

        return categoriaFilmes;
    }

    [HttpGet("{idFilme}")]
    public IActionResult Get(int idFilme)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql = @"
            SELECT c.*
            FROM categorias AS c
            INNER JOIN filme_categorias AS fc
                ON c.idCategoria = fc.idCategoria_FK
            WHERE fc.idFilme_FK = @idFilme";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme", idFilme);

        using MySqlDataReader reader = command.ExecuteReader();

        List<Categoria> categorias = new List<Categoria>();

        while (reader.Read())
        {
            int idCategoria = reader.GetInt32("idCategoria");
            string nomeCategoria = reader.GetString("nomeCategoria");

            Categoria categoria = new Categoria(
                idCategoria,
                nomeCategoria
            );

            categorias.Add(categoria);
        }

        if (categorias.Count == 0)
        {
            return NotFound();
        }

        return Ok(categorias);
    }


    [HttpPost]
    public IActionResult Create(CreateCategoriaFilmeDto dto)
    {
        CategoriaFilme categoriaFilme = new CategoriaFilme();
        categoriaFilme.IdCategoria = dto.IdCategoria;
        categoriaFilme.IdFilme = dto.IdFilme;

        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        using MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "INSERT INTO filme_categorias (idFilme_FK,idCategoria_FK) VALUES (@idFilme,@idCategoria)";

        using MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme",categoriaFilme.IdFilme);
        command.Parameters.AddWithValue("@idCategoria",categoriaFilme.IdCategoria);

        command.ExecuteNonQuery();
        return Ok(categoriaFilme);
    }

    [HttpPut("{idCategoria}/{idFilme}")]
    public IActionResult Update(int idCategoria, int idFilme, CategoriaFilme categoriaFilme)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "UPDATE filme_categorias SET idCategoria_FK = @idCategoria, idFilme_FK = @idFilme";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idCategoria",categoriaFilme.IdCategoria);
        command.Parameters.AddWithValue("@idFilme",categoriaFilme.IdFilme);

        int rowsAffected = command.ExecuteNonQuery();

        command.Dispose();
        connection.Close();

        if (rowsAffected == 0)
        {
            return NotFound();
        }

        return Ok(categoriaFilme);
    }


    [HttpDelete("{idCategoria}/{idFilme}")]
    public IActionResult Delete(int idCategoria, int idFilme)
    {
        string connectionString =
            configuration.GetConnectionString("DefaultConnection");

        MySqlConnection connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string sql =
            "DELETE FROM filme_categorias WHERE idFilme_FK = @idFilme and idCategoria_FK = @idCategoria";

        MySqlCommand command =
            new MySqlCommand(sql, connection);

        command.Parameters.AddWithValue("@idFilme", idFilme);
        command.Parameters.AddWithValue("@idCategoria", idCategoria);
        
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