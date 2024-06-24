import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import './App.css';
import 'chart.js/auto';
import { Bar,Pie} from 'react-chartjs-2';
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('January'); // Default selected month
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({ totalSaleAmount: 0, totalSoldItems: 0, totalNotSoldItems: 0 });
  const [chartData, setchartData] = useState([]);
  const barChartRef = useRef(null);
  const [pieChartData, setPieChartData] = useState([]);
  const pieChartRef = useRef(null);
  useEffect(() => {
   
    fetchTransactions(selectedMonth, searchText,currentPage);
    
  }, [selectedMonth, searchText, currentPage]);

  const fetchTransactions = async (month,search,page) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/combined-api`, {
        params: {
          month,search,page
        }
      });
      const data  = response.data;
      setTransactions(data.items.items);
      setTotalPages(data.items.totalPages);
      setStatistics(data.stats);
      setchartData(data.barChart);
      setPieChartData(data.pieChart);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1); 
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(1); 
  };

  const handleSearch = () => {
   
    fetchTransactions(selectedMonth, searchText, currentPage);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setCurrentPage(1); 
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
          }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  // useEffect(() => {
  //   return () => {
  //     if (barChartRef.current) {
  //       barChartRef.current.chartInstance.destroy();
  //     }
  //     if (pieChartRef.current) {
  //       pieChartRef.current.chartInstance.destroy();
  //     }
  //   };
  // }, []);
  const renderBarChart = chartData.length > 0 && (
    <div className="chart-container">
      <Bar
        ref={barChartRef}
        data={{
          labels: chartData.map(item => item.range),
          datasets: [{
            label: 'Number of Items',
            data: chartData.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += context.raw.toLocaleString();
                  return label;
                }
              }
            }
          }
        }}
      />
    </div>
  );
  const renderPieChart = () => {
    if (pieChartData.length > 0) {
      return (
        <div className="chart-container">
          <Pie
            ref={pieChartRef}
            data={{
              labels: pieChartData.map(item => item.category),
              datasets: [{
                data: pieChartData.map(item => item.count),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)', // Red
                  'rgba(54, 162, 235, 0.6)', // Blue
                  'rgba(255, 206, 86, 0.6)', // Yellow
                  'rgba(75, 192, 192, 0.6)', // Green
                  'rgba(153, 102, 255, 0.6)', // Purple
                  'rgba(255, 159, 64, 0.6)', // Orange
                ],
                hoverBackgroundColor: [
                  'rgba(255, 99, 132, 1)', // Red
                  'rgba(54, 162, 235, 1)', // Blue
                  'rgba(255, 206, 86, 1)', // Yellow
                  'rgba(75, 192, 192, 1)', // Green
                  'rgba(153, 102, 255, 1)', // Purple
                  'rgba(255, 159, 64, 1)', // Orange
                ], // Your pie chart hover colors
              }]
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="table-container">
      <h2>Transactions List</h2>

      <div className="select-month">
        <select value={selectedMonth} onChange={handleMonthChange}>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      <div className="search-box">
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search transaction..."
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClearSearch}>Clear</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sold</th>
            <th>Category</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.sold ? "Yes" : "No"}</td>
              <td>{transaction.category}</td>
              
              <td>{transaction.dateOfSale}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <p>Current page={currentPage}</p>
        
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
        
        <p>Total Pages={totalPages}</p>
      </div>
      <h2>Statistics-{selectedMonth}</h2>
      <div className="statistics-box">
        <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>
      <h2>Bar Chart Status-{selectedMonth}</h2>
         {renderBarChart}
         <h2>Pie Chart Status -{selectedMonth}</h2>
<center>{renderPieChart()}</center>
    

    </div>

    
  );
};

export default TransactionList;
