const express = require('express');
const router = express.Router();
const axios = require('axios');

// Define base URLs for each API endpoint
const itemsApiBaseUrl = 'http://localhost:5000/api/items';
const statsApiBaseUrl = 'http://localhost:5000/api/stats';
const barChartApiBaseUrl = 'http://localhost:5000/api/bar-chart';
const pieChartApiBaseUrl = 'http://localhost:5000/api/pie-chart';

// @route   GET api/combined
// @desc    Combine data from multiple APIs for a specified month
// @access  Public
router.get('/', async (req, res) => {
  const { month,search } = req.query;

  try {
    // Validate month input (optional depending on your validation needs)
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (!months.includes(month)) {
      return res.status(400).json({ message: 'Invalid month' });
    }

    // Construct API URLs with the specified month
    const itemsApiUrl = `${itemsApiBaseUrl}?month=${month}&search=${search}`;
    const statsApiUrl = `${statsApiBaseUrl}?month=${month}`;
    const barChartApiUrl = `${barChartApiBaseUrl}?month=${month}`;
    const pieChartApiUrl = `${pieChartApiBaseUrl}?month=${month}`;

    // Make parallel requests to all APIs using axios
    const [itemsResponse, statsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get(itemsApiUrl),
      axios.get(statsApiUrl),
      axios.get(barChartApiUrl),
      axios.get(pieChartApiUrl)
    ]);

    // Extract data from responses
    const itemsData = itemsResponse.data;
    const statsData = statsResponse.data;
    const barChartData = barChartResponse.data;
    const pieChartData = pieChartResponse.data;

    // Combine data into a single object
    const combinedData = {
      items: itemsData,
      stats: statsData,
      barChart: barChartData,
      pieChart: pieChartData
    };

    // Send combined response as JSON
    res.json(combinedData);
  } catch (error) {
    // Handle error
    console.error('Error fetching data from APIs:', error);
    res.status(500).json({ message: 'Failed to fetch data from APIs' });
  }
});

module.exports = router;
