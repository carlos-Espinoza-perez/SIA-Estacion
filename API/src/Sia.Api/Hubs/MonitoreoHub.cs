using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Sia.Domain.Constantes;

namespace Sia.Api.Hubs;

[Authorize]
public class MonitoreoHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        string? empresaId = Context.User?.FindFirst(Domain.Constantes.ClaimTypes.EmpresaId)?.Value;
        if (!string.IsNullOrEmpty(empresaId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Empresa_{empresaId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string? empresaId = Context.User?.FindFirst(Domain.Constantes.ClaimTypes.EmpresaId)?.Value;
        if (!string.IsNullOrEmpty(empresaId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Empresa_{empresaId}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
