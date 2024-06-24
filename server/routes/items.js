const express = require('express');
const router = express.Router();
const axios = require('axios');
const Item = require('../models/Item');

// @route   GET api/items/fetch
// @desc    Fetch JSON data from URL and store in MongoDB
// @access  Public
router.get('/fetch', async (req, res) => {
  try {
    // Replace with your URL
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const items = response.data;

    // Clear existing items (optional)
    await Item.deleteMany({});

    // Store new items
    const savedItems = await Item.insertMany(items);

    res.json(savedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/items
// @desc    Get all transactions with search and pagination
// @access  Public
router.get('/', async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
  
    // Validate month input
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) {
      return res.status(400).json({ message: 'Invalid month' });
    }
  
    try {
      // Build the search conditions
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex }
      ];
  
      // Check if search is a number for the price field
      if (!isNaN(search)) {
        searchConditions.push({ price: Number(search) });
      }
  
      // Build the aggregation pipeline
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
  
      // Fetch items with aggregation
      const items = await Item.aggregate(pipeline);
  
      // Get the total count for pagination
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
