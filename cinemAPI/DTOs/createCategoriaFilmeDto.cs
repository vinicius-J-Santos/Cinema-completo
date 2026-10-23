using System.ComponentModel.DataAnnotations;

namespace cinemAPI.DTOs;

public class CreateCategoriaFilmeDto
{
    [Required]
    public int IdFilme { get; set; }
    [Required]
    public int IdCategoria { get; set; }

}