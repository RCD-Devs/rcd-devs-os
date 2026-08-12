// Control total = Lider tecnico y Director/a (Rol.esAdmin), unicos que ven
// /roles y pueden tocar la configuracion de permisos. Todo lo demas del
// sistema (Protocolos, Proyectos, Clientes, Solicitudes) sigue abierto a
// cualquier usuario autenticado, con o sin rol asignado.
export function esAdmin(usuario: { rol: { esAdmin: boolean } | null } | null | undefined): boolean {
  return usuario?.rol?.esAdmin === true;
}
