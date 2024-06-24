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
 
    const categoryCounts = await Item.aggregate([
      {
        $match: {
            $expr: {
                $eq: [{ $month: '$dateOfSale' }, monthIndex + 1]
              }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

  
    const formattedData = categoryCounts.map(category => ({
      category: category._id,
      count: category.count
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
