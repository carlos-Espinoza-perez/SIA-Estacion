namespace Sia.Application.Abstracciones;

public interface IServicioReconocimientoFacial
{
    Task<bool> SonLaMismaPersonaAsync(byte[] foto1, byte[] foto2, CancellationToken ct = default);
}

public record ResultadoReconocimiento(bool Coincide, double Puntaje);
