using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Servicios;

public class ContextoEmpresa : IContextoEmpresa
{
    public Guid EmpresaId { get; private set; }

    public void Establecer(Guid empresaId)
    {
        EmpresaId = empresaId;
    }
}
