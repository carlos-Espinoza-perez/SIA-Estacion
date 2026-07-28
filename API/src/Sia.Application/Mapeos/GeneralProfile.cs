using AutoMapper;
using Sia.Application.Dtos.Comunes;
using Sia.Application.Dtos.Personas;
using Sia.Application.Dtos.Items;
using Sia.Application.Dtos.Estaciones;
using Sia.Domain.Entidades;

namespace Sia.Application.Mapeos;

public class GeneralProfile : Profile
{
    public GeneralProfile()
    {
        CreateMap<Empresa, EmpresaResponse>();
        CreateMap<CrearEmpresaRequest, Empresa>();

        CreateMap<Persona, PersonaResponse>()
            .ForMember(d => d.TipoPersona, o => o.MapFrom(s => s.TipoPersona.ToString()))
            .ForMember(d => d.TieneFotoReferencia, o => o.MapFrom(s => s.FotosReferencia.Any(f => f.Estado)));

        CreateMap<Persona, PersonaDetalleResponse>()
            .ForMember(d => d.TipoPersona, o => o.MapFrom(s => s.TipoPersona.ToString()))
            .ForMember(d => d.TieneFotoReferencia, o => o.MapFrom(s => s.FotosReferencia.Any(f => f.Estado)));

        CreateMap<FotoReferencia, FotoReferenciaResponse>();

        CreateMap<TipoItem, TipoItemResponse>();
        CreateMap<CrearTipoItemRequest, TipoItem>();

        CreateMap<AtributoDefinicion, AtributoDefinicionResponse>()
            .ForMember(d => d.TipoDato, o => o.MapFrom(s => s.TipoDato.ToString()));

        CreateMap<Item, ItemResponse>()
            .ForMember(d => d.TipoItemNombre, o => o.MapFrom(s => s.TipoItem.Nombre))
            .ForMember(d => d.EstadoActual, o => o.MapFrom(s => s.EstadoActual.ToString()));

        CreateMap<Estacion, EstacionResponse>();
        CreateMap<CrearEstacionRequest, Estacion>();
    }
}
