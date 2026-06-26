const SaleItem = require('../models/SaleItem');

async function attachItemsToRecords(records) {
  if (!records.length) return [];

  const recordIds = records.map((record) => record._id);
  const allItems = await SaleItem.find({ recordId: { $in: recordIds } }).lean();

  const itemsByRecordId = new Map();
  for (const item of allItems) {
    const key = String(item.recordId);
    if (!itemsByRecordId.has(key)) {
      itemsByRecordId.set(key, []);
    }
    itemsByRecordId.get(key).push(item);
  }

  return records.map((record) => ({
    ...record,
    items: itemsByRecordId.get(String(record._id)) || []
  }));
}

module.exports = { attachItemsToRecords };
