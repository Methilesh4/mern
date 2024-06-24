const express = require('express');
const router = express.Router();
const axios = require('axios');
const Item = require('../models/Item');

router.get('/fetch', async (req, res) => {
  try {
    
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const items = response.data;

    
    await Item.deleteMany({});

    
    const savedItems = await Item.insertMany(items);

    res.json(savedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
    const { page = 1, perPage = 4, search = '', month } = req.query;
  
   
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) {
      return res.status(400).json({ message: 'Invalid month' });
    }
  
    try {
      
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex }
      ];
  
      
      if (!isNaN(search)) {
        searchConditions.push({ price: Number(search) });
      }
  
     
      const pipeline = [
        {
          $addFields: {
            saleMonth: { $month: "$dateOfSale" }
          }
        },
        {
          $match: {
            $and: [
              { $or: searchConditions },
              { saleMonth: monthIndex + 1 }
            ]
          }
        },
        {
          $skip: (page - 1) * perPage
        },
        {
          $limit: parseInt(perPage)
        }
      ];
  
      
      const items = await Item.aggregate(pipeline);
  
      
      const totalItems = await Item.aggregate([
        {
          $addFields: {
            saleMonth: { $month: "$dateOfSale" }
          }
        },
        {
          $match: {
            $and: [
              { $or: searchConditions },
              { saleMonth: monthIndex + 1 }
            ]
          }
        },
        {
          $count: "totalItems"
        }
      ]);
  
      const totalItemsCount = totalItems[0] ? totalItems[0].totalItems : 0;
  
      res.json({
        items,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItemsCount / perPage),
        totalItems: totalItemsCount
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });



module.exports = router;
