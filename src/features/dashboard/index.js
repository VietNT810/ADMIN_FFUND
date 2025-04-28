import React, { useState } from 'react';
import DashboardStats from './components/DashboardStats';
import AmountStats from './components/AmountStats';
import PageStats from './components/PageStats';
import UserChannels from './components/UserChannels';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import DashboardTopBar from './components/DashboardTopBar';
import { useDispatch } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import DoughnutChart from './components/DoughnutChart';
import AreaChart from './components/AreaChart';

function Dashboard() {
    const dispatch = useDispatch();

    // Default range for the current year
    const currentYear = new Date().getFullYear();
    const [dateRange, setDateRange] = useState({
        start: `${currentYear}-01-01T00:00:00`,
        end: `${currentYear}-12-31T23:59:59`,
    });

    const updateDashboardPeriod = (newRange) => {
        const formattedStart = newRange.start.split('T')[0];
        const formattedEnd = newRange.end.split('T')[0];

        setDateRange(newRange);
        dispatch(
            showNotification({
                message: `Period updated to ${formattedStart} to ${formattedEnd}`,
                status: 1,
            })
        );
    };

    return (
        <>

            {/** ---------------------- Different stats content 1 ------------------------- */}
            {/** ---------------------- Different stats content 1 ------------------------- */}
            <div className="mb-6">
                <DashboardStats />
            </div>
            <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod}/>

            {/** ---------------------- Different charts ------------------------- */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <LineChart start={dateRange.start} end={dateRange.end} />
                <BarChart start={dateRange.start} end={dateRange.end}  />
            </div>

            {/** ---------------------- Area Chart ------------------------- */}
            <div className="mt-10">
                <AreaChart start={dateRange.start} end={dateRange.end} />
            </div>

            {/** ---------------------- User source channels table  ------------------------- */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <UserChannels />
                <DoughnutChart />
            </div>
        </>
    );
}

export default Dashboard;