using cinemAPI.Enums;

namespace cinemAPI.DTOs;

public class SessaoDisponivelDto
{
    public int IdSessao { get; set; }
    public int IdFilme { get; set; }
    public int IdSala { get; set; }

    public string NomeSala { get; set; }

    public DateTime DataHora { get; set; }

    public decimal Preco { get; set; }

    public StatusSessao Status { get; set; }

    public int Capacidade { get; set; }

    public int IngressosDisponiveis { get; set; }
}