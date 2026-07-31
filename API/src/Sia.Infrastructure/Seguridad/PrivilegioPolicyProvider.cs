using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Sia.Infrastructure.Seguridad;

public class PrivilegioPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public PrivilegioPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
    {
    }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        AuthorizationPolicy? policy = await base.GetPolicyAsync(policyName);
        if (policy is not null)
        {
            return policy;
        }

        if (policyName.StartsWith("Privilegio_", StringComparison.OrdinalIgnoreCase))
        {
            var parts = policyName.Split('_');
            if (parts.Length == 3)
            {
                var codigo = parts[1];
                var nivel = parts[2];
                var builder = new AuthorizationPolicyBuilder("Bearer");
                builder.AddRequirements(new RequisitoPrivilegio(codigo, nivel));
                return builder.Build();
            }
        }

        return null;
    }
}
