import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryProjectPercentage } from '../../../features/dashboard/components/SystemStaticSlice';
import {
  Chart as ChartJS,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

ChartJS.register(ArcElement, Tooltip, Legend, Filler);

function DoughnutChart() {
  const dispatch = useDispatch();
  const { categoryProjectPercentage, status } = useSelector((state) => state.systemStaticSlice);
  const [chartData, setChartData] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchCategoryProjectPercentage());
  }, [dispatch]);

  // Prepare chart data when API response is available
  useEffect(() => {
    if (categoryProjectPercentage.length > 0) {
      const labels = categoryProjectPercentage.map((item) => item.categoryName);
      const data = categoryProjectPercentage.map((item) => item.percentage);
      const projectCounts = categoryProjectPercentage.map((item) => item.projectCount);
      const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
      ];

      setChartData({
        labels,
        datasets: [
          {
            label: 'Percentage',
            data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: backgroundColors.map((color) => color.replace('0.8', '1')),
            borderWidth: 1,
            projectCounts, // Add projectCount to dataset for tooltip
          },
        ],
      });
    }
  }, [categoryProjectPercentage]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const projectCount = context.dataset.projectCounts[context.dataIndex];
            return `${context.label}: ${context.raw}% (${projectCount} projects)`;
          },
        },
      },
    },
  };

  return (
    <TitleCard title="Published Project Category Percentage" className="h-96">
      {status === 'loading' && <p className="text-center py-4">Loading chart data...</p>}
      {chartData ? (
        <Doughnut options={options} data={chartData} />
      ) : (
        <p className="text-center py-4">No data available.</p>
      )}
    </TitleCard>
  );
}

export default DoughnutChart;