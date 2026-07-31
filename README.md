# Sistema de Identificación Automática (SIA) - Backend

Este repositorio contiene la API del Sistema de Identificación Automática (SIA). Es una solución diseñada para gestionar el acceso de personas (como estudiantes o personal), manejar préstamos de inventario (ítems) y sincronizar información con estaciones físicas de lectura (como lectores de código QR).

El backend está desarrollado en **.NET 9** y utiliza una estructura basada en Clean Architecture (Arquitectura Limpia). Esto nos ayuda a mantener el código ordenado, separar responsabilidades y facilitar el mantenimiento a medida que el proyecto crezca.

## Estructura del Proyecto

El código fuente principal está agrupado dentro de la carpeta `API/src` y se divide en las siguientes capas lógicas:

- **Sia.Domain**: Es el núcleo del sistema. Aquí viven las entidades de la base de datos (modelos), enums y las constantes (como los códigos de error). Esta capa no depende de ningún otro proyecto, es totalmente independiente.
- **Sia.Application**: Contiene la lógica central del negocio. Aquí se ubican los Servicios (que realizan los procesos), los DTOs (objetos de transferencia de datos limpios para la entrada y salida) y las abstracciones (interfaces) para conectarnos a bases de datos o servicios externos sin acoplarnos.
- **Sia.Infrastructure**: Se encarga de todo lo que tenga que ver con tecnología externa. Aquí está la configuración de Entity Framework Core con SQL Server, la implementación de los repositorios de datos, el manejo de archivos con Azure Blob Storage y los proveedores de seguridad (JWT).
- **Sia.Api**: Es la capa web (Presentación). Aquí se exponen los endpoints (URLs) de nuestra API REST para que los consuma el frontend o las estaciones físicas.

También existe la carpeta `API/tests` destinada a las pruebas automatizadas (unitarias y de integración) del código.

## Controladores de la API

La capa web (`Sia.Api/Controllers`) funciona de forma muy simple: recibe una petición, se la envía a un servicio de `Sia.Application` para que haga el trabajo, y devuelve el resultado.

Todos los controladores heredan de una clase base llamada `SiaControllerBase`. Esta clase se encarga de interceptar el resultado que manda el servicio y automáticamente devolver el código HTTP que corresponda (200 OK, 204 No Content, o un 422 si hubo algún error de validación de negocio). Esto nos evita repetir código en cada método.

A continuación, un resumen de cada controlador y su propósito:

- **AuthController**: Permite iniciar sesión a los administradores web y autenticar temporalmente a las estaciones físicas. También renueva los tokens de sesión.
- **ConexionController**: Su función principal es recibir los "latidos" (heartbeats) de las estaciones físicas para saber cuáles están encendidas y conectadas a la red.
- **EmpresasController**: Administra los datos generales y configuraciones de las distintas instituciones/empresas que operan dentro del sistema.
- **EstacionesController**: Permite dar de alta, editar y borrar estaciones físicas desde la plataforma web.
- **EstacionApiController**: Es el canal de comunicación exclusivo para las estaciones físicas. Por aquí la estación sincroniza sus datos y reporta cuando ocurre un escaneo.
- **ItemsController**: Funciona para gestionar los ítems físicos de nuestro inventario (por ejemplo equipos, llaves, libros).
- **TiposItemController**: Trabaja junto con los ítems para hacer el inventario dinámico, definiendo categorías y qué atributos personalizados tiene cada tipo.
- **NivelesPermisoController / PrivilegiosController / RolesController**: Son los tres controladores encargados de armar el sistema de seguridad y permisos. Permiten crear roles, listar privilegios y cruzarlos en una matriz para asignar accesos granulares.
- **UsuariosController**: Maneja el alta y baja de las credenciales (cuentas) de las personas que van a usar la plataforma web de administración.
- **PersonasController**: Gestiona a los estudiantes, empleados u otras personas físicas que van a transitar por el recinto o solicitar préstamos. Además, permite cargar y enlazar sus fotos de referencia (para el reconocimiento facial).
- **OperacionesController**: Procesa las transacciones en vivo, como efectuar el préstamo manual de un ítem a una persona, o registrar su devolución.
- **ReportesController**: Agrupa endpoints de solo lectura orientados a métricas, como ver quién está presente en el campus, revisar el historial de accesos de alguien, o rastrear dónde ha estado un ítem.

## Requisitos y Configuración Local

- Requiere el SDK de .NET 9 instalado.
- Servidor de base de datos SQL Server (puede ser local o en la nube).
- Una cuenta de Azure Storage para guardar los archivos de las fotografías.

*(Nota de seguridad: Los accesos reales a la base de datos y Storage no se guardan en el repositorio. Si vas a trabajar en local, asegúrate de crear tu archivo `.env` o de configurar los "User Secrets" de .NET con tus cadenas de conexión).*
