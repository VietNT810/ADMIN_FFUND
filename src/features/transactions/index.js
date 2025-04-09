import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions } from "./transactionSlice";
import TitleCard from "../../components/Cards/TitleCard";
import Loading from "../../components/Loading";
import { motion } from "framer-motion";
import { FunnelIcon } from "@heroicons/react/24/outline"; // Heroicons filter icon
import Calendar from "react-calendar"; // Calendar component for selecting date
import "react-calendar/dist/Calendar.css"; // Import Calendar CSS

// Helper function to calculate totals
const calculateTotal = (transactions, field) => {
  return transactions.reduce((acc, curr) => acc + curr[field], 0).toFixed(2);
};

function Transactions() {
  const dispatch = useDispatch();

  const { transactions, totalPages, status, error } = useSelector(
    (state) => state.transaction
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // To toggle the filter visibility

  useEffect(() => {
    const query = buildQuery();
    dispatch(getTransactions({ query, page: currentPage, size: 10 }));
  }, [dispatch, currentPage, startDate, endDate]);

  // Loading state
  if (status === "loading") return <Loading />;
  if (status === "failed") return <div className="alert alert-error">{error}</div>;

  const totalAmount = calculateTotal(transactions, "amount");
  const totalPlatFormFee = calculateTotal(transactions, "platformFee");

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
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
    return query.slice(0, -1); // Remove trailing comma
  };

  return (
    <>
      {/* Summary Cards for Total Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Amount Card */}
        <motion.div
          className="card bg-base-100 dark:bg-base-800 shadow-xl p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Total Amount
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">${totalAmount}</p>
        </motion.div>

        {/* Total Profit Card */}
        <motion.div
          className="card bg-base-100 dark:bg-base-800 shadow-xl p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Total Platform Fee
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">${totalPlatFormFee}</p>
        </motion.div>
      </div>

      <TitleCard title="Recent Transactions" topMargin="mt-2">
        {/* Toggle filter visibility */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white hover:bg-blue-600 hover:text-white transition-all duration-200"
          >
            <FunnelIcon className="w-5 h-5" /> Filter
          </button>
        </div>

        {/* Date Picker Filter */}
        {isFilterVisible && (
          <div className="mb-6">
            <div className="flex justify-between space-x-6">
              <div className="w-full">
                <span className="font-semibold">Select Date Range: </span>
                <div className="border p-4 rounded-lg shadow-md bg-base-200 dark:text-gray-500">
                  <Calendar
                    selectRange={true}
                    onChange={(range) => {
                      setStartDate(range?.[0]);
                      setEndDate(range?.[1]);
                    }}
                    value={[startDate, endDate]}
                    className="react-calendar dark-theme"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto w-full">
          <motion.table
            className="table w-full table-striped bg-base-200 shadow-md rounded-lg dark:bg-base-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-semibold dark:bg-base-200 dark:text-gray-300">
                <th className="px-4 py-2">Investor Name</th>
                <th className="px-4 py-2">Project Title</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Platform Fee</th>
                <th className="px-4 py-2">Transaction Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-200 dark:hover:bg-base-200">
                  <td className="dark:text-gray-200 font-semibold px-4 py-2">
                    {transaction.investorName}
                  </td>
                  <td className="px-4 dark:text-gray-200 py-2">{transaction.projectTitle}</td>
                  <td className="text-green-600 font-semibold px-4 py-2">
                    ${transaction.amount}
                  </td>
                  <td className="text-green-500 px-4 py-2">
                    {transaction.platformFee}
                  </td>
                  <td className="px-4 py-2">
                    {transaction.transactionDate
                      ? moment(transaction.transactionDate).format("D MMM YYYY")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white"
          >
            Prev
          </button>
          <span className="text-sm">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="btn btn-sm btn-outline dark:bg-base-700 dark:text-white"
          >
            Next
          </button>
        </div>
      </TitleCard>
    </>
  );
}

export default Transactions;
