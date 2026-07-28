namespace Sia.Application.Abstracciones;

public interface IContextoUsuario
{
    string? UserId { get; }
    Guid? PersonaId { get; }
    Guid? EmpresaId { get; }
    Guid? EstacionId { get; }
    bool EsEstacion { get; }
    IEnumerable<string> Privilegios { get; }
}
