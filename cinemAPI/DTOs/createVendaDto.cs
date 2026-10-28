using System.ComponentModel.DataAnnotations;

namespace cinemAPI.DTOs;

public class CreateVendaDto
{
    [Required]
    public int IdSessao { get; set; }
    [Required]
    [MinLength(1)]
    public int Quantidade { get; set; }
}