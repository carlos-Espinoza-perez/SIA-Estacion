namespace Sia.Application.Abstracciones;

public interface IContextoEmpresa
{
    Guid EmpresaId { get; }
    void Establecer(Guid empresaId);
}
