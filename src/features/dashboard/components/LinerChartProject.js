import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectTrend } from '../../../features/dashboard/components/SystemStaticSlice';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function LinerChartProject() {
    const dispatch = useDispatch();
    const { projectTrend, status, error } = useSelector((state) => state.systemStaticSlice);

    const [dateRange, setDateRange] = useState({
        start: '2025-01-01T00:00:00',
        end: '2025-12-31T00:00:00',
    });

    useEffect(() => {
        dispatch(fetchProjectTrend({ format: '%Y-%m', start: dateRange.start, end: dateRange.end }));
    }, [dispatch, dateRange]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prev) => ({ ...prev, [name]: value }));
    };

    const chartData = {
        labels: projectTrend.map((item) => item.time),
        datasets: [
            {
                label: 'Projects Count',
                data: projectTrend.map((item) => item.count),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Project Trend</h3>

            <div className="flex gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                        type="date"
                        name="start"
                        value={dateRange.start}
                        onChange={handleDateChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                        type="date"
                        name="end"
                        value={dateRange.end}
                        onChange={handleDateChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            {status === 'loading' && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
            {status === 'failed' && <p className="text-red-500 dark:text-red-400">Error: {error}</p>}
            {status === 'succeeded' && (
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
        </div>
    );
}

export default LinerChartProject;