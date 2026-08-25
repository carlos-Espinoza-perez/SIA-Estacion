using System;
using System.Collections.Generic;

namespace Sia.Application.Dtos.Reportes
{
    public class DashboardMetricsResponse
    {
        public int TotalAccesosHoy { get; set; }
        public int TotalOperaciones { get; set; }
        public int TotalPersonas { get; set; }
        public int TotalEstaciones { get; set; }

        public List<ItemEstadoDto> ItemsPorEstado { get; set; } = new();
        public List<AccesoEstacionDto> AccesosPorEstacion { get; set; } = new();

        public ResultadosAccesoDto ResultadosAcceso { get; set; } = new();

        public List<MonthlyPointDto> TendenciaAccesos { get; set; } = new();
        public List<MonthlyPointDto> TendenciaOperaciones { get; set; } = new();
        public List<MonthlyPointDto> TendenciaEstaciones { get; set; } = new();

        public List<OperacionesMensualesDto> OperacionesMensuales { get; set; } = new();
    }

    public class ItemEstadoDto
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class AccesoEstacionDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int Porcentaje { get; set; }
    }

    public class ResultadosAccesoDto
    {
        public int Concedido { get; set; }
        public int Denegado { get; set; }
        public int Offline { get; set; }
        public int Otro { get; set; }
    }

    public class MonthlyPointDto
    {
        public string Month { get; set; } = string.Empty;
        public int CurrentYear { get; set; }
        public int PreviousYear { get; set; }
    }

    public class OperacionesMensualesDto
    {
        public string Month { get; set; } = string.Empty;
        public int Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}
