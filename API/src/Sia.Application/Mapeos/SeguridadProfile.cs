using AutoMapper;
using Sia.Application.Dtos.Seguridad;
using Sia.Application.Dtos.Comunes;
using Sia.Domain.Entidades;

namespace Sia.Application.Mapeos;

public class SeguridadProfile : Profile
{
    public SeguridadProfile()
    {
        CreateMap<Privilegio, PrivilegioResponse>();
        CreateMap<CrearPrivilegioRequest, Privilegio>();
        CreateMap<NivelPermiso, NivelPermisoResponse>();
        CreateMap<CrearNivelPermisoRequest, NivelPermiso>();
    }
}
