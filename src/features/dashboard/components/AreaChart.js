import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionTrend } from '../../../features/dashboard/components/SystemStaticSlice';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

function AreaChart({ start, end }) {
    const dispatch = useDispatch();
    const { transactionTrend = [], status } = useSelector((state) => state.systemStaticSlice);
    const [format, setFormat] = useState('%Y-%m'); // Default format is monthly

    // Fetch data when component mounts or when start/end dates or format change
    useEffect(() => {
        if (start && end) {
            dispatch(fetchTransactionTrend({
                format,
                start,
                end
            }));
        }
    }, [dispatch, start, end, format]);

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    padding: 20,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (label.includes('Profit') || label.includes('Amount')) {
                                label += new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(context.parsed.y);
                            } else {
                                label += context.parsed.y;
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Time Period'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    borderDash: [2, 4],
                },
                title: {
                    display: true,
                    text: 'Values'
                },
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString(); // Format y-axis values
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    // Prepare chart data
    const labels = transactionTrend.map(item => item.time);

    // Define chart datasets
    const chartData = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Transaction Count',
                data: transactionTrend.map(item => item.count),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4,
            },
            {
                fill: true,
                label: 'Total Profit',
                data: transactionTrend.map(item => item.totalProfit),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4,
            },
            {
                fill: true,
                label: 'Total Amount',
                data: transactionTrend.map(item => item.totalAmount),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
            }
        ]
    };

    // Summary statistics
    const Summary = () => {
        // Calculate totals
        const totalTransactions = transactionTrend.reduce((sum, item) => sum + item.count, 0);
        const totalProfit = transactionTrend.reduce((sum, item) => sum + item.totalProfit, 0);
        const totalAmount = transactionTrend.reduce((sum, item) => sum + item.totalAmount, 0);

        return (
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold text-blue-600">{totalTransactions}</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Profit</p>
                    <p className="text-xl font-bold text-teal-600">
                        ${totalProfit.toFixed(2)}
                    </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-red-500">
                        ${totalAmount.toFixed(2)}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <TitleCard title="Transaction Trends">
            {status === 'loading' ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : transactionTrend.length > 0 ? (
                <>
                    <div className="flex justify-end mb-4">
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="border rounded-md p-2 text-sm"
                        >
                            <option value="%Y-%m">Monthly</option>
                            <option value="%Y-%m-%d">Daily</option>
                        </select>
                    </div>
                    <Summary />
                    <div className="h-64">
                        <Line options={options} data={chartData} />
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                    No transaction data available for the selected period.
                </div>
            )}
        </TitleCard>
    );
}

export default AreaChart;