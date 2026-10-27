namespace cinemAPI.Models;

public class Sessao{
    public int Id { get; set; }
    public int IdFilme { get; set; }
    public int IdSala { get; set; }
    public DateTime DataHora { get; set; }
    public float Preco { get; set; }

    public Sessao(){

    }
    public Sessao(int id, int idFilme, int idSala, DateTime dataHora, float preco)
    {
        Id = id;
        IdFilme = idFilme;
        IdSala = idSala;
        DataHora = dataHora;
        Preco = preco;
    }
}