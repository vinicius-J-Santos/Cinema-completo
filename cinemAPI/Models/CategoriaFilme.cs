namespace cinemAPI.Models;

public class CategoriaFilme
{
    public int IdFilme { get; set; }
    public int IdCategoria { get; set; }

    public CategoriaFilme()
    {
    }

    public CategoriaFilme(int idFilme, int idCategoria)
    {
        IdFilme = idFilme;
        IdCategoria = idCategoria;
    }
}