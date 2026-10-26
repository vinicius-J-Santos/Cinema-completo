using System.ComponentModel.DataAnnotations;

namespace cinemAPI.DTOs;

public class CreateSalaDto{
    [Required]
    public string NomeSala { get; set; }
    [Required]
    [Range(1,120)]
    public int Capacidade { get; set; }
}
