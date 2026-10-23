using System.ComponentModel.DataAnnotations;
using cinemAPI.Enums;

namespace cinemAPI.DTOs;

public class CreateFilmeDto
{
    [Required]
    [StringLength(150, MinimumLength = 1)]
    public string Titulo { get; set; } = string.Empty;

    public string Sinopse { get; set; } = string.Empty;
    [Required]
    public int Duracao { get; set; }
    [Required]
    public ClassificacaoFilme Classificacao { get; set; }
    [Required]
    public DateOnly DataLancamento { get; set; }
    [Required]
    public string PosterUrl { get; set; } = string.Empty;
    [Required]
    public StatusFilme Status { get; set; }
}