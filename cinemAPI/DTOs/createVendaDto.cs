using System.ComponentModel.DataAnnotations;

namespace cinemAPI.DTOs;

public class CreateVendaDto
{
    [Required]
    public int IdSessao { get; set; }
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "O valor deve ser maior ou igual a 1(Um).")]
    public int Quantidade { get; set; }
}