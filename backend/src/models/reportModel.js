import { query } from '../config/db.js';

export const getCollectionsReportData = async (startDate, endDate) => {
  const text = `
    SELECT 
      collection_id,
      collection_date,
      farmer_name,
      farmer_phone,
      farmer_village,
      produce_name,
      quantity,
      produce_unit,
      rate,
      amount,
      payment_status,
      amount_paid,
      balance_pending,
      payment_paid_date,
      payment_remarks
    FROM collections_detailed
    WHERE collection_date >= $1 AND collection_date <= $2
    ORDER BY collection_date DESC, collection_id DESC
  `;
  const { rows } = await query(text, [startDate, endDate]);
  return rows;
};
