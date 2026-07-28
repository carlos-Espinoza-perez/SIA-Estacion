using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Sia.Application.Abstracciones;
using Sia.Application.Dtos.Items;
using Sia.Domain.Entidades;
using Sia.Domain.Enums;
using Sia.Domain.Excepciones;
using Sia.Domain.Constantes;
using Sia.Infrastructure.Persistencia;

namespace Sia.Infrastructure.ServiciosAplicacion;

public class ServicioItems
{
    private readonly SiaDbContext _db;
    private readonly IMapper _mapper;
    private readonly IContextoEmpresa _contextoEmpresa;

    public ServicioItems(SiaDbContext db, IMapper mapper, IContextoEmpresa contextoEmpresa)
    {
        _db = db;
        _mapper = mapper;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<List<TipoItemResponse>> ObtenerTiposAsync(CancellationToken ct)
    {
        List<TipoItem> tipos = await _db.TiposItem.Where(t => t.Estado).OrderBy(t => t.Nombre).ToListAsync(ct);
        return _mapper.Map<List<TipoItemResponse>>(tipos);
    }

    public async Task<TipoItemResponse> CrearTipoAsync(CrearTipoItemRequest request, CancellationToken ct)
    {
        var tipo = _mapper.Map<TipoItem>(request);
        tipo.Id = Guid.NewGuid();
        tipo.EmpresaId = _contextoEmpresa.EmpresaId;

        _db.TiposItem.Add(tipo);
        await _db.SaveChangesAsync(ct);
        return _mapper.Map<TipoItemResponse>(tipo);
    }

    public async Task<TipoItemResponse> ActualizarTipoAsync(Guid id, CrearTipoItemRequest request, CancellationToken ct)
    {
        TipoItem tipo = await _db.TiposItem.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(TipoItem), id);

        tipo.Nombre = request.Nombre;
        tipo.PermiteAgrupacion = request.PermiteAgrupacion;
        await _db.SaveChangesAsync(ct);
        return _mapper.Map<TipoItemResponse>(tipo);
    }

    public async Task EliminarTipoAsync(Guid id, CancellationToken ct)
    {
        TipoItem tipo = await _db.TiposItem.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(TipoItem), id);
        tipo.Estado = false;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<AtributoDefinicionResponse>> ObtenerAtributosAsync(Guid tipoItemId, CancellationToken ct)
    {
        List<AtributoDefinicion> atributos = await _db.AtributosDefinicion
            .Where(a => a.TipoItemId == tipoItemId && a.Estado)
            .OrderBy(a => a.Orden)
            .ToListAsync(ct);
        return _mapper.Map<List<AtributoDefinicionResponse>>(atributos);
    }

    public async Task<AtributoDefinicionResponse> CrearAtributoAsync(Guid tipoItemId, CrearAtributoRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<TipoDatoAtributo>(request.TipoDato, out TipoDatoAtributo tipoDato))
            throw new ReglaNegocioException("TIPO_DATO_INVALIDO", $"Tipo de dato '{request.TipoDato}' no válido.");

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

        _db.AtributosDefinicion.Add(atributo);
        await _db.SaveChangesAsync(ct);
        return _mapper.Map<AtributoDefinicionResponse>(atributo);
    }

    public async Task<AtributoDefinicionResponse> ActualizarAtributoAsync(Guid id, CrearAtributoRequest request, CancellationToken ct)
    {
        AtributoDefinicion atributo = await _db.AtributosDefinicion.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(AtributoDefinicion), id);

        atributo.Clave = request.Clave;
        atributo.Etiqueta = request.Etiqueta;
        atributo.Requerido = request.Requerido;
        atributo.Orden = request.Orden;
        await _db.SaveChangesAsync(ct);
        return _mapper.Map<AtributoDefinicionResponse>(atributo);
    }

    public async Task EliminarAtributoAsync(Guid id, CancellationToken ct)
    {
        AtributoDefinicion atributo = await _db.AtributosDefinicion.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(AtributoDefinicion), id);
        atributo.Estado = false;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<ItemResponse>> ObtenerItemsAsync(string? busqueda, Guid? tipoItemId, string? estadoActual, CancellationToken ct)
    {
        IQueryable<Item> query = _db.Items.Include(i => i.TipoItem).Where(i => i.Estado);

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(i => i.Nombre.Contains(busqueda) || i.CodigoQr.Contains(busqueda));
        if (tipoItemId.HasValue)
            query = query.Where(i => i.TipoItemId == tipoItemId.Value);
        if (!string.IsNullOrWhiteSpace(estadoActual) && Enum.TryParse<EstadoItem>(estadoActual, out EstadoItem ei))
            query = query.Where(i => i.EstadoActual == ei);

        List<Item> items = await query.OrderBy(i => i.Nombre).ToListAsync(ct);
        return _mapper.Map<List<ItemResponse>>(items);
    }

    public async Task<ItemDetalleResponse> ObtenerItemPorIdAsync(Guid id, CancellationToken ct)
    {
        Item item = await _db.Items
            .Include(i => i.TipoItem)
            .Include(i => i.AtributoValores).ThenInclude(av => av.AtributoDefinicion)
            .Include(i => i.ComponentesDe).ThenInclude(c => c.ItemComponente)
            .FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Item), id);

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

        return response;
    }

    public async Task<ItemResponse> ObtenerPorQrAsync(string codigo, CancellationToken ct)
    {
        Item item = await _db.Items
            .Include(i => i.TipoItem)
            .FirstOrDefaultAsync(i => i.CodigoQr == codigo, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Item), codigo);
        return _mapper.Map<ItemResponse>(item);
    }

    public async Task<ItemResponse> CrearItemAsync(CrearItemRequest request, CancellationToken ct)
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

        _db.Items.Add(item);

        foreach (AtributoValorRequest av in request.Atributos)
        {
            _db.ItemAtributoValores.Add(new ItemAtributoValor
            {
                Id = Guid.NewGuid(),
                EmpresaId = _contextoEmpresa.EmpresaId,
                ItemId = item.Id,
                AtributoDefinicionId = av.AtributoDefinicionId,
                Valor = av.Valor
            });
        }

        await _db.SaveChangesAsync(ct);

        Item itemConTipo = await _db.Items.Include(i => i.TipoItem).FirstAsync(i => i.Id == item.Id, ct);
        return _mapper.Map<ItemResponse>(itemConTipo);
    }

    public async Task<ItemResponse> ActualizarItemAsync(Guid id, ActualizarItemRequest request, CancellationToken ct)
    {
        Item item = await _db.Items.Include(i => i.TipoItem).FirstOrDefaultAsync(i => i.Id == id, ct)
            ?? throw new EntidadNoEncontradaException(nameof(Item), id);

        item.Nombre = request.Nombre;
        if (!string.IsNullOrWhiteSpace(request.EstadoActual) && Enum.TryParse<EstadoItem>(request.EstadoActual, out EstadoItem ei))
            item.EstadoActual = ei;

        List<ItemAtributoValor> valoresExistentes = await _db.ItemAtributoValores.Where(v => v.ItemId == id).ToListAsync(ct);
        _db.ItemAtributoValores.RemoveRange(valoresExistentes);

        foreach (AtributoValorRequest av in request.Atributos)
        {
            _db.ItemAtributoValores.Add(new ItemAtributoValor
            {
                Id = Guid.NewGuid(),
                EmpresaId = _contextoEmpresa.EmpresaId,
                ItemId = id,
                AtributoDefinicionId = av.AtributoDefinicionId,
                Valor = av.Valor
            });
        }

        await _db.SaveChangesAsync(ct);
        return _mapper.Map<ItemResponse>(item);
    }

    public async Task EliminarItemAsync(Guid id, CancellationToken ct)
    {
        Item item = await _db.Items.FindAsync([id], ct)
            ?? throw new EntidadNoEncontradaException(nameof(Item), id);
        item.Estado = false;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<ComponenteResponse>> ObtenerComponentesAsync(Guid itemId, CancellationToken ct)
    {
        List<ItemComposicion> composiciones = await _db.ItemComposiciones
            .Include(c => c.ItemComponente)
            .Where(c => c.ItemAgrupadorId == itemId)
            .ToListAsync(ct);

        return composiciones.Select(c => new ComponenteResponse
        {
            ItemId = c.ItemComponenteId,
            Nombre = c.ItemComponente.Nombre,
            CodigoQr = c.ItemComponente.CodigoQr,
            EstadoActual = c.ItemComponente.EstadoActual.ToString()
        }).ToList();
    }

    public async Task AgregarComponenteAsync(Guid itemAgrupadorId, AgregarComponenteRequest request, CancellationToken ct)
    {
        if (await TieneCicloAsync(itemAgrupadorId, request.ItemComponenteId, ct))
            throw new ReglaNegocioException(CodigosError.CicloComposicion, "Agregar este componente crearía un ciclo en la composición.");

        _db.ItemComposiciones.Add(new ItemComposicion
        {
            Id = Guid.NewGuid(),
            EmpresaId = _contextoEmpresa.EmpresaId,
            ItemAgrupadorId = itemAgrupadorId,
            ItemComponenteId = request.ItemComponenteId
        });

        await _db.SaveChangesAsync(ct);
    }

    public async Task EliminarComponenteAsync(Guid itemAgrupadorId, Guid componenteId, CancellationToken ct)
    {
        ItemComposicion composicion = await _db.ItemComposiciones
            .FirstOrDefaultAsync(c => c.ItemAgrupadorId == itemAgrupadorId && c.ItemComponenteId == componenteId, ct)
            ?? throw new EntidadNoEncontradaException("ItemComposicion", $"{itemAgrupadorId}/{componenteId}");

        _db.ItemComposiciones.Remove(composicion);
        await _db.SaveChangesAsync(ct);
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

            List<Guid> hijos = await _db.ItemComposiciones
                .Where(c => c.ItemAgrupadorId == actual)
                .Select(c => c.ItemComponenteId)
                .ToListAsync(ct);

            foreach (Guid hijo in hijos)
                cola.Enqueue(hijo);
        }

        return false;
    }
}
