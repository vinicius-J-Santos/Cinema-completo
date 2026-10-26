namespace cinemAPI.Models;

public class Sala{
    public int Id { get; set; }
    public string NomeSala { get; set; }
    public int Capacidade { get; set; }

    public Sala(){

    }
    public Sala(int id, string nomeSala, int capacidade){
        Id = id;
        NomeSala = nomeSala;
        Capacidade = capacidade;
    }
}