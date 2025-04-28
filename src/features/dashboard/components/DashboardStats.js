import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemStatistics } from '../../../features/dashboard/components/SystemStaticSlice';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';

function DashboardStats() {
    const dispatch = useDispatch();

    // Correctly select the state from systemStaticSlice
    const { systemStatistics, status, error } = useSelector((state) => state.systemStaticSlice);

    useEffect(() => {
        dispatch(fetchSystemStatistics());
    }, [dispatch]);

    // Define stats data mapping from API response with enhanced styling configuration
    const getStatsCards = () => {
        if (!systemStatistics) return [];

        return [
            {
                title: "Total Users",
                value: systemStatistics.totalUsers.toLocaleString(),
                icon: <UserGroupIcon className="w-8 h-8" />,
                description: "Active users in the system",
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                iconColor: "text-blue-600 dark:text-blue-400",
                valueColor: "text-blue-700 dark:text-blue-300",
            },
            {
                title: "Total Raised",
                value: `$${systemStatistics.totalRaised.toLocaleString()}`,
                icon: <CreditCardIcon className="w-8 h-8" />,
                description: "Total funds raised",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                iconColor: "text-green-600 dark:text-green-400",
                valueColor: "text-green-700 dark:text-green-300",
            },
            {
                title: "Total Projects",
                value: systemStatistics.totalProjects.toLocaleString(),
                icon: <DocumentTextIcon className="w-8 h-8" />,
                description: `${systemStatistics.totalFundingProjects} projects are in funding stage`,
                bgColor: "bg-purple-50 dark:bg-purple-900/20",
                iconColor: "text-purple-600 dark:text-purple-400",
                valueColor: "text-purple-700 dark:text-purple-300",
            },
            {
                title: "Total Profit",
                value: `$${systemStatistics.totalProfit.toLocaleString()}`,
                icon: <BanknotesIcon className="w-8 h-8" />,
                description: `Generated returns from ${systemStatistics.totalTransactions} transactions`,
                bgColor: "bg-amber-50 dark:bg-amber-900/20",
                iconColor: "text-amber-600 dark:text-amber-400",
                valueColor: "text-amber-700 dark:text-amber-300",
            },
        ];
    };

    const StatCard = ({ title, icon, value, description, bgColor, iconColor, valueColor }) => {
        return (
            <div className={`rounded-xl shadow-md ${bgColor} border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
                            <div className={`text-2xl font-bold ${valueColor} mt-2`}>{value}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</div>
                        </div>
                        <div className={`${iconColor} p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm`}>
                            {icon}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex justify-center items-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-red-600 dark:text-red-400 text-center p-6">
                    <p className="text-lg font-medium">Unable to load dashboard statistics</p>
                    <p className="text-sm mt-2">{error || "Please try again later"}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">FFUND Overview</h2>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
                {getStatsCards().map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>
        </div>
    );
}

export default DashboardStats;