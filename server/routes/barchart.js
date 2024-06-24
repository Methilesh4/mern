const express = require('express');
const router = express.Router();
const Item = require('../models/Item');


router.get('/', async (req, res) => {
  const { month } = req.query;

 
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = months.indexOf(month);
  if (monthIndex === -1) {
    return res.status(400).json({ message: 'Invalid month' });
  }

  try {
    
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity } 
    ];

    const priceRangeCounts = [];

    for (const range of priceRanges) {
      const count = await Item.countDocuments({
        price: { $gte: range.min, $lte: range.max },
        $expr: {
            $eq: [{ $month: '$dateOfSale' }, monthIndex + 1]
          }
      });
      priceRangeCounts.push({ range: `${range.min}-${range.max}`, count });
    }

    res.json(priceRangeCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
