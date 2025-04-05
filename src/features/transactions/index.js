import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getTransactions } from "./transactionSlice"
import TitleCard from "../../components/Cards/TitleCard"
import Loading from '../../components/Loading'

// Helper function to calculate totals
const calculateTotal = (transactions, field) => {
  return transactions.reduce((acc, curr) => acc + curr[field], 0).toFixed(2);
}

function Transactions() {
    const dispatch = useDispatch()

    const { transactions, totalPages, status, error } = useSelector(state => state.transaction)

    const [currentPage, setCurrentPage] = useState(0)

    useEffect(() => {
        dispatch(getTransactions({ page: currentPage, size: 10 }))
    }, [dispatch, currentPage])

    // Loading state
    if (status === "loading") return <Loading />
    if (status === "failed") return <div className="alert alert-error">{error}</div>

    // Calculate totals for Amount, platformFee, and Transactions
    const totalAmount = calculateTotal(transactions, "amount")
    const totalPlatFormFee = calculateTotal(transactions, "platformFee")
    const totalTransactions = transactions.length

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage)
        }
    }

    return (
        <>
            <TitleCard title="Recent Transactions" topMargin="mt-2">
                {/* Summary Cards for Total Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Total Amount Card */}
                    <div className="card bg-base-100 dark:bg-base-800 shadow-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total Amount</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">${totalAmount}</p>
                    </div>

                    {/* Total Profit Card */}
                    <div className="card bg-base-100 dark:bg-base-800 shadow-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total Platform Fee</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">${totalPlatFormFee}</p>
                    </div>

                    {/* Total Transactions Card */}
                    <div className="card bg-base-100 dark:bg-base-800 shadow-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total Transactions</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{totalTransactions}</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto w-full">
                    <table className="table w-full table-striped">
                        <thead>
                            <tr>
                                <th>Investor Name</th>
                                <th>Project Title</th>
                                <th>Amount</th>
                                <th>Platform Fee</th>
                                <th>Transaction Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                transactions?.map((transaction, index) => (
                                    <tr key={index}>
                                        <td className="text-gray-800 font-semibold">{transaction.investorName}</td>
                                        <td>{transaction.projectTitle}</td>
                                        <td className="text-green-600 font-semibold">${transaction.amount}</td>
                                        <td className="text-green-500">{transaction.platformFee}</td>
                                        <td>{transaction.transactionDate ? moment(transaction.transactionDate).format("D MMM YYYY") : 'N/A'}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="btn btn-sm btn-outline"
                    >
                        Prev
                    </button>
                    <span className="text-sm">{currentPage + 1} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="btn btn-sm btn-outline"
                    >
                        Next
                    </button>
                </div>
            </TitleCard>
        </>
    )
}

export default Transactions
