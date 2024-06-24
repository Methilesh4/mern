const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { ObjectId } = require('mongoose').Types;

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
    
    const totalSaleAmount = await Item.aggregate([
      {
        $match: {
          sold: true,
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, monthIndex + 1]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' }
        }
      }
    ]);

   
    const totalSoldItems = await Item.countDocuments({
        sold: true,
        $expr: {
          $eq: [{ $month: '$dateOfSale' }, monthIndex + 1]
        }
      
    });

   
    const totalNotSoldItems = await Item.countDocuments({
      sold: false,
      $expr: {
        $eq: [{ $month: '$dateOfSale' }, monthIndex + 1]
      }
    });

    res.json({
      totalSaleAmount: totalSaleAmount[0] ? totalSaleAmount[0].totalAmount : 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
