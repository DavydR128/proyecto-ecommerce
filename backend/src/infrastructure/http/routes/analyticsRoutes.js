import { Router } from 'express';

export function createAnalyticsRouter(analyticsController) {
  const router = Router();

  // Endpoint: GET /api/analytics/dashboard?range=7d
  router.get('/dashboard', (req, res) => analyticsController.getDashboard(req, res));

  return router;
}