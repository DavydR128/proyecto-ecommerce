/**
 * Puerto de Salida (Dominio): Define los métodos analíticos
 * que cualquier adaptador de base de datos debe implementar.
 */
export class AnalyticsRepository {
  async getKpis(startDate, endDate) {
    throw new Error('Método getKpis no implementado');
  }

  async getTopProducts(limit, startDate, endDate) {
    throw new Error('Método getTopProducts no implementado');
  }

  async getRevenueTrend(startDate, endDate) {
    throw new Error('Método getRevenueTrend no implementado');
  }

  async getOrdersStatusDistribution(startDate, endDate) {
    throw new Error('Método getOrdersStatusDistribution no implementado');
  }
}