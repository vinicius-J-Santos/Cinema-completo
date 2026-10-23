using cinemAPI.Enums;

namespace cinemAPI.Models;

public class Filme
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Sinopse { get; set; } = string.Empty;
    public int Duracao { get; set; }
    public ClassificacaoFilme Classificacao { get; set; }
    public DateOnly DataLancamento { get; set; }
    public string PosterUrl { get; set; } = string.Empty;
    public StatusFilme Status { get; set; }

    public Filme(){
        
    }
    public Filme(int id, string titulo, string sinopse, int duracao, ClassificacaoFilme classificacao, DateOnly dataLancamento, string posterUrl, StatusFilme status)
    {
        Id = id;
        Titulo = titulo;
        Sinopse = sinopse;
        Duracao = duracao;
        Classificacao = classificacao;
        DataLancamento = dataLancamento;
        PosterUrl = posterUrl;
        Status = status;
    }
}

