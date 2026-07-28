namespace Sia.Application.Dtos.Seguridad;

public class MatrizPrivilegiosRequest
{
    public List<AsignacionPrivilegioDto> Asignaciones { get; set; } = [];
}

public class AsignacionPrivilegioDto
{
    public Guid PrivilegioId { get; set; }
    public Guid NivelPermisoId { get; set; }
}
