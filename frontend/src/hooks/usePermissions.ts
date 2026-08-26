import { useAppSelector } from '../store/hooks';

export type NivelRequerido = 'C' | 'L' | 'A' | 'B' | 'E' | 'T';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const isAdmin = Boolean(
    user?.roles?.some(
      (r) => r.toLowerCase().includes('administrador') || r.toLowerCase() === 'admin'
    )
  );

  const hasRole = (roleName: string): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isAdmin) return true;
    return user.roles.some((r) => r.toLowerCase() === roleName.toLowerCase());
  };

  const hasPrivilege = (codigoPrivilegio: string, nivelRequerido: NivelRequerido = 'L'): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isAdmin) return true;

    const priv = user.privilegios?.find(
      (p) => p.codigo.toUpperCase() === codigoPrivilegio.toUpperCase()
    );

    if (!priv || !priv.niveles || priv.niveles.length === 0) {
      return false;
    }

    const niveles = priv.niveles.map((n) => n.toUpperCase());

    // Acceso exacto o Total
    if (niveles.includes(nivelRequerido) || niveles.includes('T')) {
      return true;
    }

    switch (nivelRequerido) {
      case 'L':
        return (
          niveles.includes('C') ||
          niveles.includes('A') ||
          niveles.includes('B') ||
          niveles.includes('E')
        );
      case 'C':
      case 'A':
        return niveles.includes('E');
      case 'E':
        return niveles.includes('C') && niveles.includes('A');
      case 'B':
        return false;
      default:
        return false;
    }
  };

  const canAccessRoute = (path: string): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isAdmin) return true;

    switch (path) {
      case '/dashboard':
      case '/':
        return true;
      case '/accesos':
        return hasPrivilege('ACC', 'L');
      case '/operaciones':
        return hasPrivilege('OPE', 'L');
      case '/personas':
        return hasPrivilege('PER', 'L');
      case '/items':
        return hasPrivilege('ITM', 'L');
      case '/estaciones':
        return hasPrivilege('EST', 'L');
      case '/roles':
      case '/roles/nuevo':
        return hasPrivilege('ROL', 'L');
      case '/auditoria':
        return hasPrivilege('AUD', 'L');
      default:
        return true;
    }
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    hasRole,
    hasPrivilege,
    canAccessRoute,
  };
};
