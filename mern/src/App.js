import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('March'); // Default selected month
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Load transactions for default month on initial render
    fetchTransactions(selectedMonth,searchText);
  }, [selectedMonth, searchText, currentPage]);

  const fetchTransactions = async (month,search) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/combined-api`, {
        params: {
          month,search
        }
      });
      const data  = response.data;
      setTransactions(data.items.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1); // Reset to first page when month changes
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(1); // Reset to first page when search text changes
  };

  const handleSearch = () => {
    // Perform search based on current month and search text
    fetchTransactions(selectedMonth, searchText, currentPage);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setCurrentPage(1); // Reset to first page when search text is cleared
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

  return (
    <div>
      <h2>Transactions List</h2>

      {/* Month dropdown */}
      <select value={selectedMonth} onChange={handleMonthChange}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>

      {/* Search box */}
      <input type="text" value={searchText} onChange={handleSearchChange} placeholder="Search transaction..." />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleClearSearch}>Clear</button>

      {/* Transaction table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
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
              <td>{transaction.dateOfSale}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default TransactionList;