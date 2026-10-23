using System.ComponentModel.DataAnnotations;
using cinemAPI.Enums;

namespace cinemAPI.DTOs;


public class CreateCategoriaDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
}