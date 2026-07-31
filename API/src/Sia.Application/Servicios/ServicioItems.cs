using AutoMapper;
using Sia.Application.Abstracciones;
using Sia.Application.Abstracciones.Repositorios;
using Sia.Application.Dtos.Items;
using Sia.Application.Resultados;
using Sia.Domain.Constantes;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Domain.Excepciones;

namespace Sia.Application.Servicios;

public class ServicioItems
{
    private readonly IItemsRepository _repository;
    private readonly IMapper _mapper;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioItems(IItemsRepository repository, IMapper mapper, IContextoEmpresa contextoEmpresa)
    {
        _repository = repository;
        _mapper = mapper;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<Result<List<TipoItemResponse>>> ObtenerTiposAsync(CancellationToken ct)
    {
        List<TipoItem> tipos = await _repository.ObtenerTiposAsync(ct);
        return Result<List<TipoItemResponse>>.Exitoso(_mapper.Map<List<TipoItemResponse>>(tipos));
    }

    public async Task<Result<TipoItemResponse>> CrearTipoAsync(CrearTipoItemRequest request, CancellationToken ct)
    {
        var tipo = _mapper.Map<TipoItem>(request);
        tipo.Id = Guid.NewGuid();
        tipo.EmpresaId = _contextoEmpresa.EmpresaId;

        await _repository.AgregarTipoAsync(tipo, ct);
        await _repository.SaveChangesAsync(ct);
        return Result<TipoItemResponse>.Exitoso(_mapper.Map<TipoItemResponse>(tipo));
    }

    public async Task<Result<TipoItemResponse>> ActualizarTipoAsync(Guid id, CrearTipoItemRequest request, CancellationToken ct)
    {
        TipoItem? tipo = await _repository.ObtenerTipoPorIdAsync(id, ct);
        if (tipo is null)
            throw new EntidadNoEncontradaException(nameof(TipoItem), id);

        tipo.Nombre = request.Nombre;
        tipo.PermiteAgrupacion = request.PermiteAgrupacion;
        await _repository.SaveChangesAsync(ct);
        return Result<TipoItemResponse>.Exitoso(_mapper.Map<TipoItemResponse>(tipo));
    }

    public async Task<Result<bool>> EliminarTipoAsync(Guid id, CancellationToken ct)
    {
        TipoItem? tipo = await _repository.ObtenerTipoPorIdAsync(id, ct);
        if (tipo is null)
            throw new EntidadNoEncontradaException(nameof(TipoItem), id);
        
        tipo.Estado = false;
        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<List<AtributoDefinicionResponse>>> ObtenerAtributosAsync(Guid tipoItemId, CancellationToken ct)
    {
        List<AtributoDefinicion> atributos = await _repository.ObtenerAtributosAsync(tipoItemId, ct);
        return Result<List<AtributoDefinicionResponse>>.Exitoso(_mapper.Map<List<AtributoDefinicionResponse>>(atributos));
    }

    public async Task<Result<AtributoDefinicionResponse>> CrearAtributoAsync(Guid tipoItemId, CrearAtributoRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<TipoDatoAtributo>(request.TipoDato, out TipoDatoAtributo tipoDato))
            return Result<AtributoDefinicionResponse>.Fallido("TIPO_DATO_INVALIDO", $"Tipo de dato '{request.TipoDato}' no válido.");

        var atributo = new AtributoDefinicion
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            TipoItemId = tipoItemId,
            Clave = request.Clave,
            Etiqueta = request.Etiqueta,
            TipoDato = tipoDato,
            Requerido = request.Requerido,
            Orden = request.Orden
        };

        await _repository.AgregarAtributoAsync(atributo, ct);
        await _repository.SaveChangesAsync(ct);
        return Result<AtributoDefinicionResponse>.Exitoso(_mapper.Map<AtributoDefinicionResponse>(atributo));
    }

    public async Task<Result<AtributoDefinicionResponse>> ActualizarAtributoAsync(Guid id, CrearAtributoRequest request, CancellationToken ct)
    {
        AtributoDefinicion? atributo = await _repository.ObtenerAtributoPorIdAsync(id, ct);
        if (atributo is null)
            throw new EntidadNoEncontradaException(nameof(AtributoDefinicion), id);

        atributo.Clave = request.Clave;
        atributo.Etiqueta = request.Etiqueta;
        atributo.Requerido = request.Requerido;
        atributo.Orden = request.Orden;
        await _repository.SaveChangesAsync(ct);
        return Result<AtributoDefinicionResponse>.Exitoso(_mapper.Map<AtributoDefinicionResponse>(atributo));
    }

    public async Task<Result<bool>> EliminarAtributoAsync(Guid id, CancellationToken ct)
    {
        AtributoDefinicion? atributo = await _repository.ObtenerAtributoPorIdAsync(id, ct);
        if (atributo is null)
            throw new EntidadNoEncontradaException(nameof(AtributoDefinicion), id);
            
        atributo.Estado = false;
        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<List<ItemResponse>>> ObtenerItemsAsync(string? busqueda, Guid? tipoItemId, string? estadoActual, CancellationToken ct)
    {
        EstadoItem? ei = null;
        if (!string.IsNullOrWhiteSpace(estadoActual))
        {
            if (Enum.TryParse<EstadoItem>(estadoActual, out EstadoItem parsedEi))
            {
                ei = parsedEi;
            }
        }

        List<Item> items = await _repository.ObtenerItemsAsync(busqueda, tipoItemId, ei, ct);
        return Result<List<ItemResponse>>.Exitoso(_mapper.Map<List<ItemResponse>>(items));
    }

    public async Task<Result<ItemDetalleResponse>> ObtenerItemPorIdAsync(Guid id, CancellationToken ct)
    {
        Item? item = await _repository.ObtenerItemPorIdConDetallesAsync(id, ct);
        if (item is null)
            throw new EntidadNoEncontradaException(nameof(Item), id);

        var response = _mapper.Map<ItemDetalleResponse>(item);
        response.Atributos = item.AtributoValores.Select(av => new AtributoValorResponse
        {
            AtributoDefinicionId = av.AtributoDefinicionId,
            Clave = av.AtributoDefinicion.Clave,
            Etiqueta = av.AtributoDefinicion.Etiqueta,
            Valor = av.Valor
        }).ToList();

        response.Componentes = item.ComponentesDe.Select(c => new ComponenteResponse
        {
            ItemId = c.ItemComponenteId,
            Nombre = c.ItemComponente.Nombre,
            CodigoQr = c.ItemComponente.CodigoQr,
            EstadoActual = c.ItemComponente.EstadoActual.ToString()
        }).ToList();

        return Result<ItemDetalleResponse>.Exitoso(response);
    }

    public async Task<Result<ItemResponse>> ObtenerPorQrAsync(string codigo, CancellationToken ct)
    {
        Item? item = await _repository.ObtenerItemPorQrAsync(codigo, ct);
        if (item is null)
            throw new EntidadNoEncontradaException(nameof(Item), codigo);
            
        return Result<ItemResponse>.Exitoso(_mapper.Map<ItemResponse>(item));
    }

    public async Task<Result<ItemResponse>> CrearItemAsync(CrearItemRequest request, CancellationToken ct)
    {
        var item = new Item
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            TipoItemId = request.TipoItemId,
            CodigoQr = request.CodigoQr,
            Nombre = request.Nombre,
            EsAgrupador = request.EsAgrupador
        };

        await _repository.AgregarItemAsync(item, ct);

        foreach (AtributoValorRequest av in request.Atributos)
        {
            await _repository.AgregarValorAtributoAsync(new ItemAtributoValor
            {
                Id = Guid.NewGuid(),
                EmpresaId = _contextoEmpresa.EmpresaId,
                ItemId = item.Id,
                AtributoDefinicionId = av.AtributoDefinicionId,
                Valor = av.Valor
            }, ct);
        }

        await _repository.SaveChangesAsync(ct);

        Item? itemConTipo = await _repository.ObtenerItemPorIdAsync(item.Id, ct);
        return Result<ItemResponse>.Exitoso(_mapper.Map<ItemResponse>(itemConTipo!));
    }

    public async Task<Result<ItemResponse>> ActualizarItemAsync(Guid id, ActualizarItemRequest request, CancellationToken ct)
    {
        Item? item = await _repository.ObtenerItemPorIdAsync(id, ct);
        if (item is null)
            throw new EntidadNoEncontradaException(nameof(Item), id);

        item.Nombre = request.Nombre;
        if (!string.IsNullOrWhiteSpace(request.EstadoActual) && Enum.TryParse<EstadoItem>(request.EstadoActual, out EstadoItem ei))
            item.EstadoActual = ei;

        List<ItemAtributoValor> valoresExistentes = await _repository.ObtenerValoresAtributoAsync(id, ct);
        await _repository.EliminarValoresAtributoAsync(valoresExistentes, ct);

        foreach (AtributoValorRequest av in request.Atributos)
        {
            await _repository.AgregarValorAtributoAsync(new ItemAtributoValor
            {
                Id = Guid.NewGuid(),
                EmpresaId = _contextoEmpresa.EmpresaId,
                ItemId = id,
                AtributoDefinicionId = av.AtributoDefinicionId,
                Valor = av.Valor
            }, ct);
        }

        await _repository.SaveChangesAsync(ct);
        return Result<ItemResponse>.Exitoso(_mapper.Map<ItemResponse>(item));
    }

    public async Task<Result<bool>> EliminarItemAsync(Guid id, CancellationToken ct)
    {
        Item? item = await _repository.ObtenerItemPorIdAsync(id, ct);
        if (item is null)
            throw new EntidadNoEncontradaException(nameof(Item), id);
            
        item.Estado = false;
        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<List<ComponenteResponse>>> ObtenerComponentesAsync(Guid itemId, CancellationToken ct)
    {
        List<ItemComposicion> composiciones = await _repository.ObtenerComponentesAsync(itemId, ct);

        var resp = composiciones.Select(c => new ComponenteResponse
        {
            ItemId = c.ItemComponenteId,
            Nombre = c.ItemComponente.Nombre,
            CodigoQr = c.ItemComponente.CodigoQr,
            EstadoActual = c.ItemComponente.EstadoActual.ToString()
        }).ToList();
        return Result<List<ComponenteResponse>>.Exitoso(resp);
    }

    public async Task<Result<bool>> AgregarComponenteAsync(Guid itemAgrupadorId, AgregarComponenteRequest request, CancellationToken ct)
    {
        if (await TieneCicloAsync(itemAgrupadorId, request.ItemComponenteId, ct))
            return Result<bool>.Fallido(CodigosError.CicloComposicion, "Agregar este componente crearía un ciclo en la composición.");

        await _repository.AgregarComposicionAsync(new ItemComposicion
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            ItemAgrupadorId = itemAgrupadorId,
            ItemComponenteId = request.ItemComponenteId
        }, ct);

        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    public async Task<Result<bool>> EliminarComponenteAsync(Guid itemAgrupadorId, Guid componenteId, CancellationToken ct)
    {
        ItemComposicion? composicion = await _repository.ObtenerComposicionAsync(itemAgrupadorId, componenteId, ct);
        if (composicion is null)
            throw new EntidadNoEncontradaException("ItemComposicion", $"{itemAgrupadorId}/{componenteId}");

        await _repository.EliminarComposicionAsync(composicion, ct);
        await _repository.SaveChangesAsync(ct);
        return Result<bool>.Exitoso(true);
    }

    private async Task<bool> TieneCicloAsync(Guid agrupadorId, Guid componenteId, CancellationToken ct)
    {
        if (agrupadorId == componenteId) return true;

        var visitados = new HashSet<Guid> { agrupadorId };
        var cola = new Queue<Guid>();
        cola.Enqueue(componenteId);

        while (cola.Count > 0)
        {
            Guid actual = cola.Dequeue();
            if (visitados.Contains(actual)) return true;
            visitados.Add(actual);

            List<Guid> hijos = await _repository.ObtenerHijosDirectosAsync(actual, ct);

            foreach (Guid hijo in hijos)
                cola.Enqueue(hijo);
        }

        return false;
    }
}
