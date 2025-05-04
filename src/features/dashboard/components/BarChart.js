import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserGrowth } from '../../../features/dashboard/components/SystemStaticSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ start, end }) {
  const dispatch = useDispatch();
  const { userGrowth, status } = useSelector((state) => state.systemStaticSlice);
  const [format, setFormat] = useState('%Y-%m'); // Default format is monthly
  const [chartData, setChartData] = useState(null);

  // Fetch data when component mounts or when start/end/format changes
  useEffect(() => {
    if (start && end) {
      dispatch(fetchUserGrowth({ format, start, end }));
    }
  }, [dispatch, format, start, end]);

  // Prepare chart data when API response is available
  useEffect(() => {
    if (userGrowth.length > 0) {
      const labels = [...new Set(userGrowth.map((item) => item.date))]; // Unique dates
      const founderData = labels.map(
        (date) =>
          userGrowth.find((item) => item.date === date && item.role === 'FOUNDER')?.count || 0
      );
      const investorData = labels.map(
        (date) =>
          userGrowth.find((item) => item.date === date && item.role === 'INVESTOR')?.count || 0
      );

      setChartData({
        labels,
        datasets: [
          {
            label: 'Founders',
            data: founderData,
            backgroundColor: 'rgba(255, 99, 132, 1)',
          },
          {
            label: 'Investors',
            data: investorData,
            backgroundColor: 'rgba(53, 162, 235, 1)',
          },
        ],
      });
    }
  }, [userGrowth]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: format === '%Y-%m' ? 'Month' : 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'User Count',
        },
      },
    },
  };

  return (
    <TitleCard title="User Growth">
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
      {status === 'loading' && <p className="text-center py-4">Loading chart data...</p>}
      {chartData ? (
        <Bar options={options} data={chartData} />
      ) : (
        <p className="text-center py-4">No data available.</p>
      )}
    </TitleCard>
  );
}

export default BarChart;