import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectTrend } from '../../../features/dashboard/components/SystemStaticSlice';
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

function LineChart({ start, end }) {
  const dispatch = useDispatch();
  const { projectTrend, status } = useSelector((state) => state.systemStaticSlice);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('%Y-%m'); // Default format is monthly

  // Fetch data whenever `start`, `end`, or `format` changes
  useEffect(() => {
    if (start && end) {
      console.log(`Fetching data for range: ${start} to ${end} with format: ${format}`); // For debugging
      setError(null); // Clear any previous errors

      try {
        dispatch(fetchProjectTrend({
          format,
          start,
          end
        })).unwrap()
          .catch(err => {
            console.error('Failed to fetch project trend data:', err);
            setError('Failed to load chart data. Please try again.');
          });
      } catch (err) {
        console.error('Error dispatching fetchProjectTrend:', err);
        setError('An error occurred while loading the chart.');
      }
    }
  }, [dispatch, start, end, format]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: (context) => `Period: ${context[0].label}`,
          label: (context) => `Projects: ${context.raw}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Projects'
        }
      },
      x: {
        title: {
          display: true,
          text: format === '%Y-%m' ? 'Month' : 'Date'
        }
      }
    }
  };

  // Prepare chart data
  const labels = projectTrend?.map(item => item.time) || [];
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Projects Count',
        data: projectTrend?.map(item => item.count) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Render loading state, error state, or chart
  return (
    <TitleCard title={"Project Trends"}>
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
      {error && <p className="text-center text-red-500 py-4">{error}</p>}
      {!error && status !== 'loading' && (
        labels.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <p className="text-center py-4">No data available for the selected period.</p>
        )
      )}
    </TitleCard>
  );
}

export default LineChart;