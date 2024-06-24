const express = require('express');
const router = express.Router();
const axios = require('axios');


const itemsApiBaseUrl = 'http://localhost:5000/api/items';
const statsApiBaseUrl = 'http://localhost:5000/api/stats';
const barChartApiBaseUrl = 'http://localhost:5000/api/bar-chart';
const pieChartApiBaseUrl = 'http://localhost:5000/api/pie-chart';

router.get('/', async (req, res) => {
  const { month,search } = req.query;

  try {
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (!months.includes(month)) {
      return res.status(400).json({ message: 'Invalid month' });
    }

    
    const itemsApiUrl = `${itemsApiBaseUrl}?month=${month}&search=${search}`;
    const statsApiUrl = `${statsApiBaseUrl}?month=${month}`;
    const barChartApiUrl = `${barChartApiBaseUrl}?month=${month}`;
    const pieChartApiUrl = `${pieChartApiBaseUrl}?month=${month}`;

    
    const [itemsResponse, statsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get(itemsApiUrl),
      axios.get(statsApiUrl),
      axios.get(barChartApiUrl),
      axios.get(pieChartApiUrl)
    ]);

    
    const itemsData = itemsResponse.data;
    const statsData = statsResponse.data;
    const barChartData = barChartResponse.data;
    const pieChartData = pieChartResponse.data;

    
    const combinedData = {
      items: itemsData,
      stats: statsData,
      barChart: barChartData,
      pieChart: pieChartData
    };

    
    res.json(combinedData);
  } catch (error) {
  
    console.error('Error fetching data from APIs:', error);
    res.status(500).json({ message: 'Failed to fetch data from APIs' });
  }
});

module.exports = router;
