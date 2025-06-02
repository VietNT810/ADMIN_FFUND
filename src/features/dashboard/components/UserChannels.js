import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemStatistics } from '../../../features/dashboard/components/SystemStaticSlice';
import TitleCard from "../../../components/Cards/TitleCard";
import Chart from 'chart.js/auto';

function UserChannels() {
    const dispatch = useDispatch();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const { systemStatistics, status, error } = useSelector((state) => state.systemStaticSlice || {});

    useEffect(() => {
        dispatch(fetchSystemStatistics());
    }, [dispatch]);

    useEffect(() => {
        if (status === 'succeeded' && systemStatistics && chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Tạo dữ liệu từ API response
            const labels = [
                'Total Raised',
                'Total Profit',
                'Total Projects',
                'Funding Projects',
                'Completed Projects',
                'Transactions',
                'Users'
            ];

            const data = [
                systemStatistics.totalRaised || 0,
                systemStatistics.totalProfit || 0,
                systemStatistics.totalProjects || 0,
                systemStatistics.totalFundingProjects || 0,
                systemStatistics.totalCompletedProjects || 0,
                systemStatistics.totalTransactions || 0,
                systemStatistics.totalUsers || 0
            ];

            const backgroundColors = [
                'rgba(54, 162, 235, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 205, 86, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(201, 203, 207, 0.7)'
            ];

            // Tạo biểu đồ mới
            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'System Statistics',
                            data: data,
                            backgroundColor: backgroundColors,
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                            borderWidth: 2,
                            hoverOffset: 15
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'System Statistics Overview',
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 15,
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;

                                    if (label === 'Total Raised' || label === 'Total Profit') {
                                        return `${label}: $${value.toLocaleString()}`;
                                    } else {
                                        return `${label}: ${value.toLocaleString()}`;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [status, systemStatistics]);

    if (status === 'loading') {
        return (
            <TitleCard title={"System Statistics"}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </TitleCard>
        );
    }

    if (status === 'failed') {
        return (
            <TitleCard title={"System Statistics"}>
                <div className="flex justify-center items-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-red-600 dark:text-red-400 text-center p-6">
                        <p className="text-lg font-medium">Unable to load system statistics</p>
                        <p className="text-sm mt-2">{error || "Please try again later"}</p>
                    </div>
                </div>
            </TitleCard>
        );
    }

    // Tạo mảng thống kê từ dữ liệu API
    const statsData = systemStatistics ? [
        { key: 'Total Raised', value: `$${systemStatistics.totalRaised.toLocaleString()}` },
        { key: 'Total Profit', value: `$${systemStatistics.totalProfit.toLocaleString()}` },
        { key: 'Total Projects', value: systemStatistics.totalProjects },
        { key: 'Funding Projects', value: systemStatistics.totalFundingProjects },
        { key: 'Completed Projects', value: systemStatistics.totalCompletedProjects },
        { key: 'Total Transactions', value: systemStatistics.totalTransactions },
        { key: 'Total Users', value: systemStatistics.totalUsers }
    ] : [];

    return (
        <TitleCard title={"System Statistics Overview"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart visualization */}
                <div className="h-96">
                    <canvas ref={chartRef} className="w-full h-full"></canvas>
                </div>

                {/* Table data */}
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="normal-case">Metric</th>
                                <th className="normal-case">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                statsData.map((stat, index) => (
                                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <th>{index + 1}</th>
                                        <td>{stat.key}</td>
                                        <td>{stat.value}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </TitleCard>
    );
}

export default UserChannels;