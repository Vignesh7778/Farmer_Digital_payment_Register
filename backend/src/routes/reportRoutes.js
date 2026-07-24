import express from 'express';
import { exportCollectionsReport } from '../controllers/reportController.js';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.get(
  '/export',
  [
    query('startDate').isDate().withMessage('startDate must be a valid YYYY-MM-DD date'),
    query('endDate').isDate().withMessage('endDate must be a valid YYYY-MM-DD date')
  ],
  validateRequest,
  exportCollectionsReport
);

export default router;
