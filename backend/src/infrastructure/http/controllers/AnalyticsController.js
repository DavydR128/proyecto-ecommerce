/**
 * Adaptador de Entrada (Infraestructura HTTP):
 * Recibe peticiones HTTP, extrae parámetros de consulta y llama al caso de uso.
 */
export class AnalyticsController {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }

  async getDashboard(req, res) {
    try {
      const { range, start, end } = req.query;

      const data = await this.analyticsService.getDashboardSummary({
        range,
        customStart: start,
        customEnd: end
      });

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error al generar métricas analíticas:', error);
      return res.status(500).json({ error: 'Error interno al consultar métricas analíticas' });
    }
  }
}