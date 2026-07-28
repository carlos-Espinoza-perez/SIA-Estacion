# Especificación de Backend — Sistema de Identificación Automática

Documento de trabajo para el agente de codificación. Contiene el alcance completo del backend, el modelo de datos, los contratos de API y las reglas que el código debe respetar.

Lee el documento entero antes de escribir la primera línea. Varias decisiones de las secciones finales condicionan cómo se debe estructurar lo de las primeras.

---

## 1. Contexto

Sistema de control de acceso e inventario para una institución educativa. Existen dos tipos de cliente muy distintos consumiendo la misma API:

- **Estaciones**: dispositivos físicos basados en ESP32 ubicados en puntos de acceso y mostradores. Leen códigos QR y capturan imágenes. No toman decisiones: envían datos y muestran en pantalla lo que el backend responda.
- **Panel administrativo**: aplicación web usada por encargados, guardias y administradores.

Toda la lógica de negocio vive en el backend. Ni la Estación ni el panel replican reglas.

### Capacidades a construir

| # | Capacidad |
|---|---|
| 1 | Validación de acceso por QR con verificación facial |
| 2 | Modo offline del punto de acceso: validación solo por QR contra copia local sincronizada |
| 3 | Préstamo de ítems con flujo configurable (con aprobación o retiro directo) |
| 4 | Administración de Estaciones y tipos de ítem |
| 5 | Roles y privilegios dinámicos sobre ASP.NET Core Identity |
| 6 | Registro trazable de eventos de acceso y operaciones, con consulta filtrable |
| 7 | Respuesta al dispositivo para retroalimentación en pantalla |
| 8 | Instrumentación de latencia y soporte de Estaciones concurrentes |
| 9 | Política técnica de protección de fotografías de referencia |

---

## 2. Reglas de código

Estas reglas no son sugerencias. El código que no las cumpla se rechaza.

### 2.1 Separación estricta

- Ningún controlador contiene lógica de negocio. Recibe la petición, delega, devuelve el resultado.
- Ningún servicio de aplicación conoce `HttpContext`, `IActionResult` ni tipos de ASP.NET MVC.
- Ninguna entidad de dominio se serializa hacia el exterior. Nunca. Siempre pasa por un DTO.
- El acceso a datos vive en repositorios o en el `DbContext` a través de la capa de infraestructura. Un servicio de aplicación no arma queries SQL crudas.
- Una clase, un archivo. Sin excepción.

### 2.2 DTOs

- Todo request y todo response tiene su propio DTO. No se reutiliza el mismo tipo para entrada y salida.
- Convención de nombres: `CrearItemRequest`, `ItemResponse`, `ItemDetalleResponse`, `ActualizarItemRequest`.
- El mapeo entidad ↔ DTO se hace en un perfil de mapeo dedicado, no disperso en los servicios.
- Los DTOs de respuesta nunca exponen `RowVersion`, hashes de secretos, ni identificadores internos que el cliente no necesite.

### 2.3 Comentarios

- Nada de comentarios que describan lo obvio. `// Constructor`, `// Guarda los cambios`, `// Retorna el resultado` no van.
- Nada de comentarios que narren la estructura del archivo. Sin bloques `#region` decorativos, sin encabezados ASCII, sin separadores tipo `// ===== SERVICIOS =====`.
- Se comenta únicamente lo que no se deduce leyendo el código: una decisión contraintuitiva, una restricción externa, un caso borde que parece un error pero no lo es.
- Documentación XML (`///`) solo en interfaces públicas y contratos que otro equipo va a consumir. No en cada método privado.
- Sin emoji en comentarios ni en logs.

Ejemplo de comentario aceptable:

```csharp
// El QR institucional no lo emitimos nosotros. Si SIVE cambia el formato
// de la URL este parser deja de funcionar y hay que actualizar el patrón.
private static readonly Regex PatronCodigo = new(@"([0-9]{2}-[A-Z0-9]+-[0-9]+)$");
```

Ejemplo de comentario que no va:

```csharp
// Método que obtiene un item por su id
public async Task<Item> ObtenerPorId(Guid id)
```

### 2.4 Estilo

- `async`/`await` en toda operación de I/O. Sin `.Result` ni `.Wait()`.
- `CancellationToken` propagado desde el controlador hasta el repositorio.
- Sin `var` cuando el tipo no es evidente por el lado derecho.
- Sin números mágicos: constantes con nombre o configuración.
- Sin `catch (Exception)` vacío ni que trague el error.
- Inyección de dependencias por constructor. Sin service locator, sin `new` de servicios dentro de otros servicios.

---

## 3. Stack

| Componente | Elección |
|---|---|
| Framework | .NET 10, C# 14 |
| API | ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Base de datos | SQL Server |
| Identidad | ASP.NET Core Identity |
| Tokens | JWT Bearer |
| Tiempo real | SignalR |
| Validación | FluentValidation |
| Mapeo | Mapster o AutoMapper |
| Logging | Serilog |
| Almacenamiento de imágenes | Azure Blob Storage (o compatible S3) |
| Reconocimiento facial | FaceONNX sobre ONNX Runtime, en proceso |

**Sobre el reconocimiento facial:** la elección de FaceONNX está pendiente de una prueba de precisión y latencia con imágenes reales. Por eso debe implementarse detrás de la interfaz `IServicioReconocimientoFacial`, sin que ninguna capa superior conozca la librería concreta. Si la prueba falla, se reemplaza la implementación sin tocar nada más.

---

## 4. Estructura de la solución

```
src/
  Sia.Domain/
    Entidades/
    Enums/
    Excepciones/
    Constantes/

  Sia.Application/
    Abstracciones/          interfaces de servicios e infraestructura
    Dtos/
      Acceso/
      Items/
      Operaciones/
      Personas/
      Estaciones/
      Seguridad/
      Reportes/
      Comunes/
    Servicios/
    Validadores/
    Mapeos/
    Resultados/             Result<T> y códigos de error

  Sia.Infrastructure/
    Persistencia/
      SiaDbContext.cs
      Configuraciones/      IEntityTypeConfiguration por entidad
      Repositorios/
      Migraciones/
    Almacenamiento/         blob storage
    Reconocimiento/         implementación FaceONNX
    Seguridad/              generación de JWT, hashing de secretos
    Servicios/

  Sia.Api/
    Controllers/
    Hubs/
    Middleware/
    Filtros/
    Configuracion/          extensiones de DI, opciones tipadas
    Program.cs

tests/
  Sia.Application.Tests/
  Sia.Api.IntegrationTests/

postman/
  Sia.postman_collection.json
  Sia.postman_environment.json
```

**Dirección de dependencias:** `Api → Application → Domain`. `Infrastructure` implementa las abstracciones de `Application` y solo se referencia desde `Api` para el registro de dependencias. `Domain` no referencia a nadie.

---

## 5. Modelo de datos

Todos los identificadores son `uniqueidentifier`. El campo `Estado` de tipo `bit` es borrado lógico: `true` vigente, `false` dado de baja. Las fechas son `datetimeoffset`.

### 5.1 Multiempresa

Todas las tablas salvo `Empresa`, `AspNetUsers`, `Privilegio` y `NivelPermiso` llevan `EmpresaId`.

**Corrección obligatoria sobre los índices únicos.** Al introducir multiempresa, los índices únicos de campo simple quedan mal: dos instituciones distintas no podrían tener un estudiante con el mismo código ni un ítem con el mismo QR. Todos estos índices deben ser compuestos con `EmpresaId`:

| Tabla | Índice único correcto |
|---|---|
| `Persona` | `(EmpresaId, CodigoEstudiantil)` |
| `Item` | `(EmpresaId, CodigoQr)` |
| `TipoItem` | `(EmpresaId, Nombre)` |
| `Estacion` | `(EmpresaId, ClientId)` |
| `AtributoDefinicion` | `(EmpresaId, TipoItemId, Clave)` |
| `EstacionTipoItem` | `(EmpresaId, EstacionId, TipoItemId)` |
| `ItemComposicion` | `(EmpresaId, ItemAgrupadorId, ItemComponenteId)` |
| `ItemAtributoValor` | `(EmpresaId, ItemId, AtributoDefinicionId)` |
| `OperacionItemDetalle` | `(EmpresaId, OperacionItemId, ItemId)` |
| `RolPrivilegio` | `(RoleId, PrivilegioId, NivelPermisoId)` |

`Privilegio.Codigo` y `NivelPermiso.Codigo` sí permanecen únicos globales: son catálogo del sistema, no de cada empresa.

**Aislamiento por empresa.** Se implementa con un query filter global en EF Core que lee el `EmpresaId` del contexto de la petición. Ningún servicio de aplicación debe filtrar por empresa manualmente: si el filtro global está bien puesto, es imposible olvidarlo. El `EmpresaId` sale del claim del token, nunca de un parámetro que envíe el cliente.

### 5.2 Enumeraciones

```
EstadoItem            Disponible | Prestado | Mantenimiento | Perdido
TipoPersona           Estudiante | Encargado | Guardia | Administrador
TipoDatoAtributo      Texto | Numero | Fecha | Booleano
DireccionAcceso       Ingreso | Egreso
ModoValidacion        QrFacial | SoloQrOffline
ResultadoAcceso       Concedido | Denegado
TipoOperacionItem     Prestamo | RetiroDirecto
EstadoOperacionItem   Pendiente | Aprobado | Entregado | Devuelto | DevueltoParcial | Rechazado
CondicionDevolucion   Bueno | Danado | NoDevuelto
```

Se persisten como `string` mediante conversión de EF Core, no como entero: si mañana se reordena el enum, los datos existentes no se corrompen.

### 5.3 Tablas

**Empresa** — `Id`, `Nombre`, `Codigo`, `Estado`, `FechaRegistro`

**AspNetUsers**, **AspNetRoles** — generadas por Identity. `AspNetRoles` lleva `EmpresaId` adicional.

**Privilegio** — `Id`, `Codigo`, `Nombre`, `Modulo`, `Estado`
Catálogo de permisos base del sistema.

**NivelPermiso** — `Id`, `Codigo`, `Nombre`, `Orden`, `Estado`
Leer, Escribir, Borrar, Actualizar, Detallar. Es tabla y no enum para que un administrador pueda agregar un nivel nuevo desde el panel sin migración.

**RolPrivilegio** — `Id`, `RoleId`, `PrivilegioId`, `NivelPermisoId`, `Estado`, `FechaAsignacion`
Matriz de permisos. Un rol puede tener niveles distintos sobre el mismo privilegio.

**Persona** — `Id`, `EmpresaId`, `CodigoEstudiantil`, `Nombres`, `Apellidos`, `TipoPersona`, `UserId`, `Estado`, `FechaRegistro`
`UserId` es nullable: se puede cargar el padrón antes de crear cuentas.

**FotoReferencia** — `Id`, `EmpresaId`, `PersonaId`, `URL`, `HashContenido`, `Estado`, `FechaCarga`, `FechaEliminacion`
Solo la referencia al blob. Una persona puede tener varias filas históricas pero solo una con `Estado = true`.

**TipoItem** — `Id`, `EmpresaId`, `Nombre`, `PermiteAgrupacion`, `Estado`

**AtributoDefinicion** — `Id`, `EmpresaId`, `TipoItemId`, `Clave`, `Etiqueta`, `TipoDato`, `Requerido`, `Orden`, `Estado`

**Item** — `Id`, `EmpresaId`, `TipoItemId`, `CodigoQr`, `Nombre`, `EsAgrupador`, `EstadoActual`, `Estado`, `RowVersion`
`EstadoActual` es el estado de negocio. `Estado` es borrado lógico. Son cosas distintas y no se mezclan.

**ItemAtributoValor** — `Id`, `EmpresaId`, `ItemId`, `AtributoDefinicionId`, `Valor`
Patrón EAV. El `Valor` se guarda como texto; la validación contra `TipoDato` la hace el backend, no la base de datos.

**ItemComposicion** — `Id`, `EmpresaId`, `ItemAgrupadorId`, `ItemComponenteId`
Sin columna de cantidad: cada pieza física es una fila propia en `Item` con su propio QR.

**Estacion** — `Id`, `EmpresaId`, `Nombre`, `Ubicacion`, `ClientId`, `ClientSecretHash`, `RequiereIdentificacion`, `RequiereAprobacion`, `Estado`, `UltimaSincronizacion`

**EstacionTipoItem** — `Id`, `EmpresaId`, `EstacionId`, `TipoItemId`, `Estado`

**EventoAcceso** — `Id`, `EmpresaId`, `PersonaId`, `EstacionId`, `Direccion`, `ModoValidacion`, `Resultado`, `MotivoDenegacion`, `CodigoEscaneado`, `FechaHoraLocal`, `FechaSincronizacion`
`PersonaId` nullable: un código inexistente igual se registra como intento denegado.

**OperacionItem** — `Id`, `EmpresaId`, `ItemEscaneadoId`, `PersonaId`, `EstacionId`, `TipoOperacion`, `EstadoActual`, `Estado`, `FechaSolicitud`, `FechaCompromisoDevolucion`, `FechaDevolucion`, `AprobadoPorPersonaId`, `RowVersion`

**OperacionItemDetalle** — `Id`, `EmpresaId`, `OperacionItemId`, `ItemId`, `CondicionDevolucion`, `FechaDevolucion`, `Observacion`

**OperacionMovimiento** — `Id`, `EmpresaId`, `OperacionItemId`, `EstadoAnterior`, `EstadoNuevo`, `RegistradoPorPersonaId`, `EstacionId`, `FechaHora`, `Observacion`

**AuditoriaCambio** — `Id`, `EmpresaId`, `Entidad`, `EntidadId`, `Accion`, `ValoresAnteriores`, `ValoresNuevos`, `UserId`, `FechaHora`

### 5.4 Bitácoras inmutables

`EventoAcceso`, `OperacionMovimiento` y `AuditoriaCambio` son de solo inserción. No llevan campo `Estado` y el código no debe exponer operaciones de actualización ni borrado sobre ellas. Si aparece un `Update` o un `Remove` sobre estas entidades, está mal.

### 5.5 Índices adicionales

```
EventoAcceso           (EmpresaId, PersonaId, FechaHoraLocal)
                       (EmpresaId, EstacionId, FechaHoraLocal)
OperacionItem          (EmpresaId, PersonaId, EstadoActual)
                       (EmpresaId, ItemEscaneadoId, EstadoActual)
OperacionItemDetalle   (EmpresaId, ItemId)
OperacionMovimiento    (EmpresaId, OperacionItemId, FechaHora)
Item                   (EmpresaId, TipoItemId, EstadoActual)
FotoReferencia         (EmpresaId, PersonaId, Estado)
AuditoriaCambio        (EmpresaId, Entidad, EntidadId)
                       (EmpresaId, FechaHora)
```

---

## 6. Autenticación y autorización

### 6.1 Dos flujos distintos

**Usuarios del panel.** Login con credenciales de Identity. Devuelve un JWT de acceso de vida corta y un refresh token. Claims obligatorios: `sub`, `empresa_id`, `persona_id`, `role`, y los privilegios resueltos.

**Estaciones.** Flujo client credentials. La Estación tiene un `ClientId` y un secreto grabado en su firmware. Los intercambia por un token de acceso de vida corta.

El token de Estación **no lleva contexto de usuario**. Solo identifica el dispositivo: `client_id`, `empresa_id`, `estacion_id`. No tiene roles ni privilegios de persona, porque una Estación no actúa en nombre de nadie: reporta lo que escaneó.

### 6.2 Almacenamiento del secreto

El `ClientSecretHash` guarda un hash con algoritmo de derivación de clave con costo configurable. Nunca el secreto en claro. Cuando se da de alta una Estación, el secreto se muestra una sola vez en la respuesta y no se puede volver a consultar; si se pierde, se regenera.

Documenta en el README que un secreto grabado en la flash de un microcontrolador es extraíble con acceso físico al dispositivo. Es una limitación del hardware y no se resuelve con software; el token de vida corta acota el daño.

### 6.3 Autorización por privilegios

Identity aporta roles. Los privilegios y sus niveles viven en `Privilegio`, `NivelPermiso` y `RolPrivilegio`.

Al emitir el token se resuelven los privilegios efectivos del usuario y se incluyen como claims con formato `privilegio:{codigo}:{nivel}`, por ejemplo `privilegio:items:Escribir`.

Se implementa un `IAuthorizationRequirement` con su handler que verifica el claim correspondiente. En los controladores se usa un atributo propio:

```csharp
[RequierePrivilegio("items", NivelPermiso.Escribir)]
```

Nunca `[Authorize(Roles = "Administrador")]` con roles quemados en el código. El punto de tener la matriz en base de datos es que se pueda cambiar sin recompilar.

### 6.4 Políticas de acceso a endpoints

| Grupo de endpoints | Quién accede |
|---|---|
| `/api/estacion/*` | Solo token de Estación |
| `/api/auth/*` | Anónimo |
| Resto de `/api/*` | Solo token de usuario, con el privilegio que corresponda |

Un token de Estación no puede llamar endpoints administrativos y un token de usuario no puede llamar los de Estación. Se resuelve con políticas separadas, verificando la presencia del claim `estacion_id`.

---

## 7. Reglas de negocio

### 7.1 Parseo del código QR institucional

Los carnets traen una URL de la forma `https://sive.ulsa.edu.ni/22-A0200-0056`. El backend recibe la cadena completa y debe extraer el código.

Requisitos:
- El patrón se lee de configuración, no se compila dentro del código.
- Si la cadena no coincide con el patrón, se registra el evento como denegado con motivo `FormatoInvalido`.
- Se guarda siempre `CodigoEscaneado` con la cadena original completa, no solo el fragmento extraído.

Ten presente que este código es predecible: de `0056` se llega a `0057` sin esfuerzo. Por eso el modo de validación queda registrado en cada evento, y por eso la verificación facial importa cuando hay conexión.

### 7.2 Flujo de validación de acceso

1. La Estación envía código escaneado, dirección, marca de tiempo local y, si corresponde, la imagen capturada.
2. Se extrae el código y se busca la persona. Si no existe o está inactiva: evento denegado.
3. Si la Estación tiene `RequiereIdentificacion = true` y hay imagen, se ejecuta la verificación facial contra la foto de referencia activa. Si el puntaje no alcanza el umbral configurado: evento denegado con motivo `RostroNoCoincide`.
4. Se registra el `EventoAcceso` con `ModoValidacion = QrFacial`.
5. Se responde con el resultado y el texto que la Estación debe mostrar.
6. Se emite la notificación por SignalR al panel.

### 7.3 Sincronización offline

La Estación mantiene una copia local de códigos habilitados. El backend expone un endpoint que devuelve esa lista, con soporte de sincronización incremental por marca de tiempo.

Cuando la Estación recupera conexión, envía en lote los eventos que registró sin red. Estos eventos llegan con `ModoValidacion = SoloQrOffline` y con su `FechaHoraLocal` original. El backend conserva esa fecha y pone `FechaSincronizacion` con la hora de recepción.

Los eventos en lote son idempotentes: la Estación envía un identificador propio por evento y el backend descarta duplicados. Sin esto, un reintento por timeout duplica registros de asistencia.

**El módulo de préstamo no tiene modo offline.** Si la Estación no tiene conexión, no puede registrar operaciones sobre ítems. Esto es intencional y está documentado como limitación del proyecto: se prioriza la trazabilidad completa sobre la disponibilidad.

### 7.4 Flujo de préstamo

Al escanear el QR de un ítem:

1. Se verifica que el tipo de ítem esté habilitado para esa Estación (`EstacionTipoItem`).
2. Si el ítem es agrupador, se resuelven sus componentes desde `ItemComposicion`. El kit solo está disponible si **todos** sus componentes lo están.
3. Se crea la `OperacionItem` con el ítem escaneado en `ItemEscaneadoId`.
4. Se crea una fila en `OperacionItemDetalle` **por cada ítem que sale físicamente**. Si se prestó un ítem suelto, es una sola fila. Nunca queda vacío: así el reporte de devoluciones no tiene que preguntar si era kit o pieza suelta.
5. Si `Estacion.RequiereAprobacion = true`, el estado inicial es `Pendiente`. Si es `false`, el flujo es `RetiroDirecto` y pasa directo a `Entregado`.
6. Cada transición de estado inserta una fila en `OperacionMovimiento`.

**Transiciones válidas:**

```
Pendiente  → Aprobado | Rechazado
Aprobado   → Entregado | Rechazado
Entregado  → Devuelto | DevueltoParcial
```

Cualquier otra transición se rechaza con error de negocio. La máquina de estados vive en un solo lugar, no repartida entre servicios.

### 7.5 Devolución

Se devuelve por detalle, no por operación completa. Cada fila de `OperacionItemDetalle` recibe su `CondicionDevolucion` y su `FechaDevolucion`.

- Todos los detalles con condición registrada → operación pasa a `Devuelto`.
- Algunos detalles pendientes → `DevueltoParcial`.
- Un detalle marcado `NoDevuelto` → el `Item` correspondiente pasa a `EstadoActual = Perdido`.
- Un detalle marcado `Danado` → el `Item` pasa a `Mantenimiento`.

### 7.6 Concurrencia

`Item` y `OperacionItem` llevan `RowVersion`. El escenario a cubrir: dos Estaciones escanean el mismo ítem con medio segundo de diferencia, ambas leen "disponible", ambas crean el préstamo.

El servicio captura `DbUpdateConcurrencyException` y responde con `409 Conflict` y un código de error que la Estación pueda mostrar como "intente de nuevo". No se reintenta automáticamente: si dos personas quisieron el mismo equipo, alguien tiene que enterarse.

### 7.7 Auditoría

Los cambios sobre entidades administrativas se registran en `AuditoriaCambio` mediante un interceptor de `SaveChanges` en EF Core, no llamando a un servicio de auditoría desde cada método. Si depende de que cada desarrollador se acuerde de llamarlo, tarde o temprano se olvida.

Se auditan: `Persona`, `Item`, `TipoItem`, `AtributoDefinicion`, `Estacion`, `RolPrivilegio`, `Privilegio`, `NivelPermiso`. No se auditan las bitácoras, que ya son inmutables por definición.

### 7.8 Validación de ciclos en kits

`ItemComposicion` permite que un kit contenga a otro. Nada en la base de datos impide que A contenga a B y B contenga a A. La validación es responsabilidad del backend: antes de insertar una composición se recorre el árbol hacia arriba y se rechaza si aparece el mismo identificador.

---

## 8. Endpoints

Prefijo `/api`. Todas las respuestas van envueltas en un sobre común con datos, errores y metadatos de paginación cuando aplique.

### 8.1 Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Credenciales de usuario, devuelve JWT y refresh token |
| POST | `/auth/refresh` | Renueva el token de acceso |
| POST | `/auth/logout` | Revoca el refresh token |
| GET | `/auth/perfil` | Datos del usuario autenticado y sus privilegios efectivos |
| POST | `/connect/token` | Client credentials para Estaciones |

### 8.2 Empresas

| Método | Ruta |
|---|---|
| GET | `/empresas` |
| GET | `/empresas/{id}` |
| POST | `/empresas` |
| PUT | `/empresas/{id}` |
| DELETE | `/empresas/{id}` |

### 8.3 Seguridad

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/privilegios` | Catálogo de privilegios |
| POST | `/privilegios` | |
| PUT | `/privilegios/{id}` | |
| DELETE | `/privilegios/{id}` | |
| GET | `/niveles-permiso` | |
| POST | `/niveles-permiso` | |
| PUT | `/niveles-permiso/{id}` | |
| DELETE | `/niveles-permiso/{id}` | |
| GET | `/roles` | |
| POST | `/roles` | |
| PUT | `/roles/{id}` | |
| DELETE | `/roles/{id}` | |
| GET | `/roles/{id}/privilegios` | Matriz de privilegios del rol |
| PUT | `/roles/{id}/privilegios` | Reemplaza la matriz completa del rol |
| GET | `/usuarios` | |
| POST | `/usuarios` | |
| PUT | `/usuarios/{id}` | |
| POST | `/usuarios/{id}/roles` | |
| DELETE | `/usuarios/{id}` | |

### 8.4 Personas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/personas` | Filtros: tipo, estado, búsqueda por nombre o código |
| GET | `/personas/{id}` | |
| GET | `/personas/por-codigo/{codigo}` | |
| POST | `/personas` | |
| PUT | `/personas/{id}` | |
| DELETE | `/personas/{id}` | Borrado lógico |
| POST | `/personas/{id}/foto-referencia` | Carga multipart, sube a blob y registra |
| GET | `/personas/{id}/foto-referencia` | Devuelve URL firmada temporal |
| DELETE | `/personas/{id}/foto-referencia` | Marca inactiva y borra del blob |

### 8.5 Catálogo de ítems

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/tipos-item` | |
| POST | `/tipos-item` | |
| PUT | `/tipos-item/{id}` | |
| DELETE | `/tipos-item/{id}` | |
| GET | `/tipos-item/{id}/atributos` | |
| POST | `/tipos-item/{id}/atributos` | |
| PUT | `/atributos/{id}` | |
| DELETE | `/atributos/{id}` | |
| GET | `/items` | Filtros: tipo, estado actual, búsqueda |
| GET | `/items/{id}` | Incluye valores de atributos |
| GET | `/items/por-qr/{codigo}` | |
| POST | `/items` | Acepta los valores de atributos en el mismo request |
| PUT | `/items/{id}` | |
| DELETE | `/items/{id}` | |
| GET | `/items/{id}/componentes` | Componentes de un kit |
| POST | `/items/{id}/componentes` | Valida ciclos antes de insertar |
| DELETE | `/items/{id}/componentes/{componenteId}` | |

### 8.6 Estaciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/estaciones` | |
| GET | `/estaciones/{id}` | |
| POST | `/estaciones` | Devuelve el secreto una sola vez |
| PUT | `/estaciones/{id}` | |
| DELETE | `/estaciones/{id}` | |
| POST | `/estaciones/{id}/regenerar-secreto` | |
| GET | `/estaciones/{id}/tipos-item` | |
| PUT | `/estaciones/{id}/tipos-item` | Reemplaza la lista completa |

### 8.7 Endpoints consumidos por la Estación

Todos bajo `/estacion`, solo accesibles con token de dispositivo. La Estación nunca envía su `EstacionId`: sale del token.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/estacion/configuracion` | Configuración vigente del dispositivo |
| POST | `/estacion/acceso/validar` | Código escaneado más imagen opcional |
| POST | `/estacion/acceso/lote` | Envío de eventos registrados sin conexión |
| GET | `/estacion/sincronizacion/codigos` | Lista de códigos habilitados, incremental |
| POST | `/estacion/operaciones/escanear` | Consulta de un ítem por QR antes de operar |
| POST | `/estacion/operaciones` | Crea la operación |
| POST | `/estacion/heartbeat` | Actualiza `UltimaSincronizacion` |

La respuesta de `/estacion/acceso/validar` debe traer todo lo que el dispositivo necesita para pintar la pantalla sin decidir nada:

```json
{
  "resultado": "Concedido",
  "titulo": "Acceso concedido",
  "mensaje": "Bienvenido, Carlos Espinoza",
  "duracionMs": 3000
}
```

### 8.8 Operaciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/operaciones` | Filtros: estado, persona, ítem, rango de fechas |
| GET | `/operaciones/{id}` | Incluye detalles y movimientos |
| GET | `/operaciones/pendientes` | Cola de aprobación del encargado |
| POST | `/operaciones` | Creación desde el panel |
| POST | `/operaciones/{id}/aprobar` | |
| POST | `/operaciones/{id}/rechazar` | |
| POST | `/operaciones/{id}/entregar` | |
| POST | `/operaciones/{id}/devolver` | Recibe la condición por cada detalle |

### 8.9 Reportes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/reportes/presencia` | Quiénes están dentro según el último evento de cada persona |
| GET | `/reportes/eventos` | Bitácora filtrable por persona, estación, rango, resultado y modo |
| GET | `/reportes/trazabilidad-item/{itemId}` | Historial completo de un ítem |
| GET | `/reportes/prestamos-vencidos` | Operaciones entregadas con compromiso vencido |
| GET | `/reportes/auditoria` | Filtrable por entidad, acción, usuario y rango |
| GET | `/reportes/metricas` | Latencias registradas y concurrencia observada |

`/reportes/metricas` respalda la medición de desempeño: latencia de validación por QR, latencia de verificación facial y cantidad de Estaciones concurrentes. Registra los tiempos reales medidos por la API, no estimaciones.

### 8.10 Sistema

| Método | Ruta |
|---|---|
| GET | `/health` |
| GET | `/health/ready` |

---

## 9. SignalR

Hub en `/hubs/monitoreo`, solo para tokens de usuario. Las Estaciones no se conectan al hub: hablan por REST.

**Eventos emitidos:**

| Evento | Cuándo |
|---|---|
| `AccesoRegistrado` | Al validar un acceso, concedido o denegado |
| `OperacionCreada` | Al crear una operación de ítem |
| `OperacionCambioEstado` | En cada transición |
| `EstacionConectada` / `EstacionDesconectada` | Por heartbeat o ausencia del mismo |

Se agrupa por empresa: un cliente solo recibe eventos de su propia empresa. El grupo se asigna al conectar, leyendo el claim, no un parámetro del cliente.

---

## 10. Manejo de errores

Middleware global que traduce excepciones a respuestas HTTP. Ningún controlador contiene `try/catch` para esto.

| Situación | HTTP | Cuerpo |
|---|---|---|
| Validación fallida | 400 | Lista de errores por campo |
| Sin autenticar | 401 | |
| Sin privilegio | 403 | |
| No encontrado | 404 | |
| Conflicto de concurrencia | 409 | Código `CONCURRENCIA_ITEM` |
| Regla de negocio violada | 422 | Código de error de negocio |
| Error no controlado | 500 | Identificador de correlación, sin detalles internos |

Las respuestas de error siguen el formato de `ProblemDetails` con extensiones propias para el código de negocio.

Los errores de negocio se modelan con un `Result<T>` que devuelven los servicios de aplicación, no lanzando excepciones para flujo normal. Las excepciones quedan para lo excepcional.

---

## 11. Registro de actividad

Serilog con salida estructurada. En cada petición se registra: identificador de correlación, ruta, duración, empresa, y si aplica el identificador de estación o usuario.

**Nunca se registra:** contraseñas, secretos de cliente, tokens, ni las imágenes enviadas para verificación facial.

Para respaldar la medición de desempeño, los tiempos de validación de QR y de verificación facial se registran como métricas con nombre, no solo como texto en el log.

---

## 12. Colección de Postman

Se entrega una colección de Postman con **todos** los endpoints listados en la sección 8. No es opcional ni se deja para el final: cada endpoint que se implementa se agrega a la colección en la misma tarea.

### Estructura

```
Sistema de Identificación Automática/
  00 - Autenticación/
  01 - Empresas/
  02 - Seguridad/
    Privilegios/
    Niveles de permiso/
    Roles/
    Usuarios/
  03 - Personas/
  04 - Catálogo de ítems/
  05 - Estaciones/
  06 - Estación (dispositivo)/
  07 - Operaciones/
  08 - Reportes/
  09 - Sistema/
```

### Requisitos de la colección

- Dos ambientes: `Local` y `Desarrollo`, con las variables `baseUrl`, `token`, `refreshToken`, `estacionToken`, `empresaId`.
- El request de login guarda el token en la variable de ambiente automáticamente mediante script de test. Igual el de client credentials con `estacionToken`.
- Autorización heredada a nivel de carpeta: las carpetas 01 a 09 usan `{{token}}`, la carpeta 06 usa `{{estacionToken}}`.
- Cada request lleva descripción: qué hace, qué privilegio requiere, y qué códigos de error puede devolver.
- Cada request lleva al menos un ejemplo de respuesta guardado, incluyendo un caso de error.
- Los requests que dependen de otro dejan el identificador en variable de ambiente. Crear una persona guarda su `personaId` para que el request de foto lo use.
- Se incluye una carpeta de flujo completo que ejecute en orden: login, crear tipo de ítem, crear ítem, crear estación, obtener token de estación, escanear, crear operación, aprobar, entregar, devolver. Debe poder correrse con el Collection Runner de principio a fin sin intervención manual.

Los archivos van en `postman/` en la raíz del repositorio.

---

## 13. Pruebas

**Unitarias sobre `Sia.Application`:** máquina de estados de operaciones, resolución de privilegios, parseo del código QR, validación de ciclos en kits, cálculo de disponibilidad de un kit.

**De integración sobre `Sia.Api`:** autenticación con ambos flujos, aislamiento entre empresas (un token de la empresa A no ve datos de la B), conflicto de concurrencia al prestar el mismo ítem dos veces, sincronización en lote con eventos duplicados.

La prueba de aislamiento entre empresas no es negociable. Es el tipo de falla que no se nota hasta que se nota mucho.

---

## 14. Configuración

Todo lo configurable va en `appsettings` con clases de opciones tipadas, validadas al arranque. La aplicación no debe iniciar si falta una configuración obligatoria.

```
ConnectionStrings:SqlServer
Jwt:Issuer, Audience, SigningKey, AccessTokenMinutes, RefreshTokenDays
Jwt:EstacionTokenMinutes
Almacenamiento:ConnectionString, Contenedor, UrlFirmadaMinutos
Reconocimiento:UmbralSimilitud, RutaModelos, TimeoutMs
Qr:PatronCodigoInstitucional
Sincronizacion:TamanoLote, IntervaloHeartbeatSegundos
```

Los secretos no se versionan. En desarrollo se usan user secrets; en despliegue, variables de entorno.

---

## 15. Orden de implementación

Cada fase debe quedar funcionando y con sus requests en Postman antes de pasar a la siguiente.

| Fase | Contenido |
|---|---|
| 1 | Solución, proyectos, dependencias, `DbContext`, entidades, configuraciones, migración inicial |
| 2 | Identity, JWT, client credentials, privilegios y matriz de permisos, atributo de autorización |
| 3 | Filtro global de empresa y prueba de aislamiento |
| 4 | Personas y fotos de referencia con blob storage |
| 5 | Catálogo: tipos de ítem, atributos, ítems, composición de kits |
| 6 | Estaciones y su configuración |
| 7 | Validación de acceso con reconocimiento facial |
| 8 | Sincronización offline y envío en lote |
| 9 | Operaciones de ítems con máquina de estados y concurrencia |
| 10 | SignalR |
| 11 | Reportes y métricas |
| 12 | Interceptor de auditoría |
| 13 | Pruebas y colección de Postman completa |

---

## 16. Criterios de aceptación

- [ ] Ningún controlador contiene lógica de negocio ni acceso directo al `DbContext`
- [ ] Ninguna entidad de dominio se devuelve en una respuesta HTTP
- [ ] Todos los índices únicos que corresponde incluyen `EmpresaId`
- [ ] Un token de la empresa A no obtiene ningún dato de la empresa B
- [ ] Un token de Estación no accede a endpoints administrativos
- [ ] Un token de usuario no accede a endpoints de Estación
- [ ] Los secretos de cliente están hasheados en base de datos
- [ ] `EventoAcceso`, `OperacionMovimiento` y `AuditoriaCambio` no tienen operaciones de actualización ni borrado en el código
- [ ] Prestar el mismo ítem desde dos peticiones simultáneas produce un 409 en una de ellas
- [ ] Los eventos en lote duplicados no generan registros repetidos
- [ ] La colección de Postman cubre todos los endpoints y el flujo completo corre de principio a fin
- [ ] No hay comentarios que describan lo evidente ni bloques decorativos
- [ ] La aplicación no arranca si falta configuración obligatoria

---

## 17. Pendientes conocidos

**Verificación de FaceONNX.** La librería está elegida pero no probada. Antes de dar por buena la fase 7 hay que medir con imágenes reales la latencia y la tasa de acierto. Si no alcanza el umbral esperado, se sustituye la implementación de `IServicioReconocimientoFacial` por un servicio externo. Ninguna otra capa debe requerir cambios cuando eso pase.

**Alcance multiempresa.** El modelo soporta varias empresas, pero la implementación de esta entrega opera con una sola. La estructura queda preparada; la administración multiempresa completa no forma parte del alcance comprometido.
