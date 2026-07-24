import { generateCollectionsCSV } from '../services/reportService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const exportCollectionsReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const csvContent = await generateCollectionsCSV(startDate, endDate);

  // Set response headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=FPG_Report_${startDate}_to_${endDate}.csv`);
  res.status(200).send(csvContent);
});
