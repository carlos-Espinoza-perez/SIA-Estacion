using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Sia.Application.Abstracciones;

namespace Sia.Infrastructure.Seguridad;

public class ServicioHashSecreto : IServicioHashSecreto
{
    private const int IteracionesPbkdf2 = 100_000;
    private const int TamanoSalt = 16;
    private const int TamanoHash = 32;

    public string Hash(string secreto)
    {
        byte[] salt = new byte[TamanoSalt];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(salt);

        byte[] hash = KeyDerivation.Pbkdf2(
            password: secreto,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: IteracionesPbkdf2,
            numBytesRequested: TamanoHash);

        byte[] resultado = new byte[TamanoSalt + TamanoHash];
        Buffer.BlockCopy(salt, 0, resultado, 0, TamanoSalt);
        Buffer.BlockCopy(hash, 0, resultado, TamanoSalt, TamanoHash);

        return Convert.ToBase64String(resultado);
    }

    public bool Verificar(string secreto, string hashAlmacenado)
    {
        byte[] datos = Convert.FromBase64String(hashAlmacenado);
        if (datos.Length != TamanoSalt + TamanoHash) return false;

        byte[] salt = new byte[TamanoSalt];
        Buffer.BlockCopy(datos, 0, salt, 0, TamanoSalt);

        byte[] hashEsperado = KeyDerivation.Pbkdf2(
            password: secreto,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: IteracionesPbkdf2,
            numBytesRequested: TamanoHash);

        byte[] hashExistente = new byte[TamanoHash];
        Buffer.BlockCopy(datos, TamanoSalt, hashExistente, 0, TamanoHash);

        return CryptographicOperations.FixedTimeEquals(hashEsperado, hashExistente);
    }
}
