namespace cinemAPI.Models;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;

    public Categoria(){
    }
    public Categoria(int id, string nome)
    {
        Id = id;
        Nome = nome;
    }

}