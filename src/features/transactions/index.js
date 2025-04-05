import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getTransactions } from "./transactionSlice"
import TitleCard from "../../components/Cards/TitleCard"
import Loading from '../../components/Loading'

function Transactions() {
    const dispatch = useDispatch()

    const { transactions, totalPages, status, error } = useSelector(state => state.transaction)

    const [currentPage, setCurrentPage] = useState(0)

    // Fetch transactions from the API on component mount with sorting by transactionDate descending
    useEffect(() => {
        dispatch(getTransactions({ page: currentPage, size: 10, sortField: "transactionDate", sortOrder: "desc" }))
    }, [dispatch, currentPage])

    // Loading state
    if (status === "loading") return <Loading />
    if (status === "failed") return <div className="alert alert-error">{error}</div>

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage)
        }
    }

    return (
        <>
            <TitleCard title="Recent Transactions" topMargin="mt-2">
                {/* Transactions Table */}
                <div className="overflow-x-auto w-full">
                    <table className="table w-full table-striped">
                        <thead>
                            <tr>
                                <th>Investor Name</th>
                                <th>Project Title</th>
                                <th>Amount</th>
                                <th>Profit</th>
                                <th>Transaction Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                transactions?.map((transaction, index) => (
                                    <tr key={index}>
                                        <td className="text-gray-800 dark:text-gray-200 font-semibold">{transaction.investorName}</td>
                                        <td>{transaction.projectTitle}</td>
                                        <td className="text-green-600 font-semibold">${transaction.amount}</td>
                                        <td className="text-green-500">{transaction.profit}</td>
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
