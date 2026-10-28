namespace cinemAPI.Models;

public class Venda
{
    public int Id { get; set; }
    public int IdSessao { get; set; }
    public int Quantidade { get; set; }
    public decimal ValorTotal { get; set; }
    public DateTime DataVenda { get; set; }

    public Venda(){

    }

    public Venda(int id, int idSessao, int quantidade, decimal valorTotal, DateTime dataVenda)
    {
        Id = id;
        IdSessao = idSessao;
        Quantidade = quantidade;
        ValorTotal = valorTotal;
        DataVenda = dataVenda;
    }
}