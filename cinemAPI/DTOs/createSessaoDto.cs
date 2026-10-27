using System.ComponentModel.DataAnnotations;

namespace cinemAPI.DTOs;

public class CreateSessaoDto{
    [Required]
    public int IdFilme { get;set; }
    [Required]
    public int IdSala { get;set; }
    [Required]
    public DateTime DataHora { get; set; }
    [Required]
    public float Preco { get; set; }
}