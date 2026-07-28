namespace Sia.Application.Abstracciones;

public interface IServicioHashSecreto
{
    string Hash(string secreto);
    bool Verificar(string secreto, string hash);
}
