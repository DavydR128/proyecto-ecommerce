class AnalyticsService {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  async getDashboardSummary({ range = '7d', customStart, customEnd } = {}) {
    const now = new Date();
    let startDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      now.setTime(new Date(customEnd).getTime());
    } else {
      startDate.setDate(now.getDate() - 7);
    }

    const startISO = startDate.toISOString();
    const endISO = now.toISOString();

    const [kpis, topProducts, revenueTrend, statusDistribution] = await Promise.all([
      this.analyticsRepository.getKpis(startISO, endISO),
      this.analyticsRepository.getTopProducts(5, startISO, endISO),
      this.analyticsRepository.getRevenueTrend(startISO, endISO),
      this.analyticsRepository.getOrdersStatusDistribution(startISO, endISO)
    ]);

    return {
      rango: { desde: startISO, hasta: endISO },
      kpis,
      topProducts,
      revenueTrend,
      statusDistribution
    };
  }
}

module.exports = AnalyticsService;