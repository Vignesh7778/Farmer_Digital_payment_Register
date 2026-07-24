import { getCollectionsReportData } from '../models/reportModel.js';
import { BadRequestError } from '../utils/errors.js';

export const generateCollectionsCSV = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new BadRequestError('Start date and end date parameters are required.');
  }

  const data = await getCollectionsReportData(startDate, endDate);

  const headers = [
    'Collection ID',
    'Date',
    'Farmer Name',
    'Farmer Phone',
    'Farmer Village',
    'Produce Name',
    'Quantity',
    'Unit',
    'Rate (INR)',
    'Total Amount (INR)',
    'Payment Status',
    'Amount Paid (INR)',
    'Balance Pending (INR)',
    'Paid Date',
    'Remarks'
  ];

  const rows = data.map((col) => [
    col.collection_id,
    col.collection_date ? new Date(col.collection_date).toISOString().split('T')[0] : '',
    col.farmer_name,
    col.farmer_phone,
    col.farmer_village,
    col.produce_name,
    col.quantity,
    col.produce_unit,
    col.rate,
    col.amount,
    col.payment_status,
    col.amount_paid,
    col.balance_pending,
    col.payment_paid_date ? new Date(col.payment_paid_date).toISOString().split('T')[0] : 'N/A',
    col.payment_remarks || 'N/A'
  ]);

  // Convert array rows to CSV format string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => {
      const valStr = String(val === null || val === undefined ? '' : val);
      if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
        return `"${valStr.replace(/"/g, '""')}"`;
      }
      return valStr;
    }).join(','))
  ].join('\n');

  return csvContent;
};
