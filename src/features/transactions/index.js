import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions, getTransactionStatistics, getProjects, setSelectedProject } from "./transactionSlice";
import TitleCard from "../../components/Cards/TitleCard";
import Loading from "../../components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { FunnelIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import useClickOutside from "../../hooks/useClickOutside";
import { EyeIcon } from '@heroicons/react/24/outline';

function Transactions() {
  const dispatch = useDispatch();
  const {
    transactions,
    totalPages,
    status,
    error,
    statistics,
    statsStatus,
    projects,
    projectsStatus,
    selectedProjectId
  } = useSelector((state) => state.transaction);

  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isProjectFilterVisible, setIsProjectFilterVisible] = useState(false);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchKeyword, setSearchKeyword] = useState("");

  const calendarRef = useRef();
  const projectFilterRef = useRef();

  useClickOutside(calendarRef, () => setIsFilterVisible(false));
  useClickOutside(projectFilterRef, () => setIsProjectFilterVisible(false));

  useEffect(() => {
    // Load projects for dropdown
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId !== undefined) {
      dispatch(getTransactionStatistics(selectedProjectId));
      console.log("Fetching statistics for project ID:", selectedProjectId);
    }
  }, [dispatch, selectedProjectId]);

  useEffect(() => {
    const query = buildQuery();
    dispatch(
      getTransactions({
        query,
        page: currentPage,
        size: 10,
        sortField,
        sortOrder,
      })
    );
  }, [dispatch, currentPage, startDate, endDate, sortField, sortOrder, selectedProjectId]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking on the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const buildQuery = () => {
    let query = "";
    if (startDate) {
      query += `transactionDate:gt:${moment(startDate).format("YYYY-MM-DD")},`;
    }
    if (endDate) {
      query += `transactionDate:lt:${moment(endDate).format("YYYY-MM-DD")},`;
    }
    if (selectedProjectId) {
      query += `project.id:eq:${selectedProjectId},`;
    }
    return query.slice(0, -1); // Remove trailing comma
  };


  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleProjectSelect = (projectId) => {
    dispatch(setSelectedProject(projectId === "all" ? null : projectId));
    setIsProjectFilterVisible(false);
    setCurrentPage(0);
  };

  // Format currency values for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Loading state
  if (status === "loading" && transactions.length === 0) return <Loading />;
  if (status === "failed") return <div className="alert alert-error shadow-lg">{error}</div>;

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value); // Cập nhật từ khóa tìm kiếm
  };

  return (
    <>
      {/* Transaction Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Total Amount Card */}
        <motion.div
          className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Amount</p>
              <h3 className="text-3xl font-bold mt-1">
                {statsStatus === "loading" ? (
                  <div className="animate-pulse h-8 w-28 bg-blue-400 rounded"></div>
                ) : (
                  formatCurrency(statistics.totalAmount)
                )}
              </h3>
            </div>
            <div className="p-3 bg-blue-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Profit Card */}
        <motion.div
          className="card bg-gradient-to-br from-green-500 to-green-700 text-white shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Profit</p>
              <h3 className="text-3xl font-bold mt-1">
                {statsStatus === "loading" ? (
                  <div className="animate-pulse h-8 w-28 bg-green-400 rounded"></div>
                ) : (
                  formatCurrency(statistics.totalProfit)
                )}
              </h3>
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Platform Fee Card */}
        <motion.div
          className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Platform Fee</p>
              <h3 className="text-3xl font-bold mt-1">
                {statsStatus === "loading" ? (
                  <div className="animate-pulse h-8 w-28 bg-purple-400 rounded"></div>
                ) : (
                  formatCurrency(statistics.totalPlatformFee)
                )}
              </h3>
            </div>
            <div className="p-3 bg-purple-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Transactions Card */}
        <motion.div
          className="card bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Transactions</p>
              <h3 className="text-3xl font-bold mt-1">
                {statsStatus === "loading" ? (
                  <div className="animate-pulse h-8 w-28 bg-amber-400 rounded"></div>
                ) : (
                  formatNumber(statistics.totalTransaction)
                )}
              </h3>
            </div>
            <div className="p-3 bg-amber-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Stripe Fee Card */}
        <motion.div
          className="card bg-base-100 dark:bg-base-800 shadow-lg p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">Total Stripe Fee</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsStatus === "loading" ? (
                  <div className="animate-pulse h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                ) : (
                  formatCurrency(statistics.totalStripeFee)
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Investors Card */}
        <motion.div
          className="card bg-base-100 dark:bg-base-800 shadow-lg p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">Total Investors</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsStatus === "loading" ? (
                  <div className="animate-pulse h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                ) : (
                  formatNumber(statistics.totalInvestor)
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <TitleCard title="Transaction History" topMargin="mt-2">
        {/* Filter Section */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          {/* Selected Project Display */}
          <div className="flex items-center mb-2 sm:mb-0">
            <ChartBarIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedProjectId ?
                `Project: ${projects.find(p => p.id.toString() === selectedProjectId.toString())?.title || 'Loading...'}` :
                'All Projects'}
            </span>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3">
            {/* View Dashboard Button with Eye Icon */}
            <a
              href="https://stripe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm dark:bg-base-700 dark:text-white hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center space-x-2 group"
            >
              <EyeIcon className="w-5 h-5" />
              <span className="hidden group-hover:inline-block">View Dashboard</span>
            </a>
            
            {/* Date Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                <FunnelIcon className="w-5 h-5 mr-1" /> Date Filter
              </button>

              {/* Calendar Dropdown */}
              <AnimatePresence>
                {isFilterVisible && (
                  <motion.div
                    ref={calendarRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 right-0 z-50 w-72 sm:w-96 bg-base-200 dark:bg-base-800 shadow-xl rounded-lg border p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm block dark:text-white">Select Date Range:</span>
                      <button
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Clear Dates
                      </button>
                    </div>
                    <Calendar
                      selectRange={true}
                      onChange={(range) => {
                        setStartDate(range?.[0]);
                        setEndDate(range?.[1]);
                      }}
                      value={[startDate, endDate]}
                      className="react-calendar dark-theme"
                    />
                    <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>From: {startDate ? moment(startDate).format("MMM D, YYYY") : "None"}</span>
                      <span>To: {endDate ? moment(endDate).format("MMM D, YYYY") : "None"}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Project Filter */}
            <div className="relative">
              <button
                onClick={() => setIsProjectFilterVisible(!isProjectFilterVisible)}
                className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white hover:bg-green-600 hover:text-white transition-all duration-200"
              >
                <ChartBarIcon className="w-5 h-5 mr-1" /> Project Filter
              </button>

              {/* Project Dropdown */}
              <AnimatePresence>
                {isProjectFilterVisible && (
                  <motion.div
                    ref={projectFilterRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 right-0 z-50 w-64 bg-base-200 dark:bg-base-800 shadow-xl rounded-lg border overflow-hidden"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-base-700 border-b">
                      <span className="font-semibold text-sm dark:text-white">Select Project</span>
                    </div>

                    {/* Search Bar */}
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-base-700 dark:text-white"
                      />
                    </div>

                    {/* Filtered Project List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => handleProjectSelect("all")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-base-700 transition-colors duration-150 ${!selectedProjectId ? "bg-blue-100 dark:bg-blue-900" : ""
                          }`}
                      >
                        All Projects
                      </button>
                      {projectsStatus === "loading" ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading projects...</div>
                      ) : filteredProjects.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No projects found</div>
                      ) : (
                        filteredProjects.slice(0, 10).map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-base-700 transition-colors duration-150 ${selectedProjectId === project.id ? "bg-blue-100 dark:bg-blue-900" : ""
                              }`}
                          >
                            {project.title}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Applied Filters Display */}
        {(startDate || endDate || selectedProjectId) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {startDate && endDate && (
              <div className="badge badge-outline dark:bg-base-700 py-2 px-3">
                <span className="text-xs">Date Range: {moment(startDate).format("MMM D")} - {moment(endDate).format("MMM D, YYYY")}</span>
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            )}
            {selectedProjectId && (
              <div className="badge badge-outline dark:bg-base-700 py-2 px-3">
                <span className="text-xs">Project: {projects.find(p => p.id.toString() === selectedProjectId.toString())?.title}</span>
                <button
                  onClick={() => dispatch(setSelectedProject(null))}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table with Loading State */}
        {status === "loading" && transactions.length > 0 ? (
          <div className="w-full flex justify-center items-center p-8">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <motion.table
              className="table w-full border-separate border-spacing-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <thead>
                <tr className="bg-gray-100 dark:bg-base-700">
                  <th
                    onClick={() => handleSort('investorName')}
                    className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300 cursor-pointer rounded-tl-lg"
                  >
                    <div className="flex items-center">
                      Investor
                      {sortField === 'investorName' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('projectTitle')}
                    className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300 cursor-pointer"
                  >
                    <div className="flex items-center">
                      Project
                      {sortField === 'projectTitle' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300 cursor-pointer"
                  >
                    <div className="flex items-center">
                      Amount
                      {sortField === 'amount' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('platformFee')}
                    className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300 cursor-pointer"
                  >
                    <div className="flex items-center">
                      Platform Fee
                      {sortField === 'platformFee' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('profit')}
                    className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300 cursor-pointer"
                  >
                    <div className="flex items-center">
                      Profit
                      {sortField === 'profit' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('transactionDate')}
                    className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300 cursor-pointer rounded-tr-lg"
                  >
                    <div className="flex items-center">
                      Date
                      {sortField === 'transactionDate' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No transactions found matching your criteria
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <motion.tr
                      key={`${transaction.investmentId}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`${index % 2 === 0
                          ? 'bg-white dark:bg-base-800'
                          : 'bg-gray-50 dark:bg-base-900'
                        } hover:bg-gray-100 dark:hover:bg-base-700 transition-colors duration-150`}
                    >
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 text-blue-600 dark:text-blue-300">
                            {transaction.investorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.investorName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {transaction.investmentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.projectTitle}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Project ID: {transaction.projectId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(transaction.platformFee)}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(transaction.profit)}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {moment(transaction.transactionDate).format("MMM D, YYYY")}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </motion.table>
          </div>
        )}

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{currentPage * 10 + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min((currentPage + 1) * 10, transactions.length + currentPage * 10)}
              </span>{" "}
              of total entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 2) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`btn btn-sm ${currentPage === pageNum
                          ? 'btn-primary'
                          : 'btn-outline dark:bg-base-700 dark:text-white'
                        }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </TitleCard>
    </>
  );
}

export default Transactions;