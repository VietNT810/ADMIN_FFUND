import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPayoutByPhaseId } from './components/payoutSlice';
import { BanknotesIcon, CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const PayoutCard = ({ phaseId, phaseName, activeTab }) => {
  const dispatch = useDispatch();
  const { payout, status, error } = useSelector(state => state.payout);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);

  useEffect(() => {
    if (phaseId && (activeTab === 'financials' || !hasTriedFetch)) {
      console.log("PayoutCard: Fetching payout data for phase", phaseId);
      fetchPayoutData();
      setHasTriedFetch(true);
    }
  }, [phaseId, activeTab, hasTriedFetch]);

  const fetchPayoutData = async () => {
    try {
      console.log("PayoutCard: Dispatching getPayoutByPhaseId with phaseId:", phaseId);
      await dispatch(getPayoutByPhaseId({ phaseId })).unwrap();
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayoutData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === 'loading') {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Payout Information</h3>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
          <p>No payout data available for this phase.</p>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  if (!payout || !payout.data) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Payout Information</h3>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm">
          <p>No payout data available for this phase yet.</p>
        </div>
      </div>
    );
  }

  const { amount, stripe_fee, profit, payoutDate, projectTitle } = payout.data;

  return (
    <motion.div
      className="border rounded-lg p-4 bg-white shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Payout Information</h3>
        <button 
          onClick={handleRefresh}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          disabled={isRefreshing}
        >
          <ArrowPathIcon className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <span className="text-gray-500 text-sm">Project</span>
          <span className="font-medium text-sm">{projectTitle}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-500 text-sm">Phase</span>
          <span className="font-medium text-sm">{phaseName || `Phase ${payout.data.phaseNumber}`}</span>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <BanknotesIcon className="w-10 h-10 text-green-600 p-2 bg-green-100 rounded-full" />
        <div className="ml-3">
          <span className="text-2xl font-bold text-green-600">${profit?.toLocaleString()}</span>
          <p className="text-xs text-gray-500">Net Payout</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Amount</div>
          <div className="text-lg font-semibold">${amount?.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600 mb-1">Platform Fee</div>
          <div className="text-lg font-semibold">${stripe_fee?.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center text-gray-600 text-sm">
        <CalendarIcon className="w-4 h-4 mr-1" />
        <span>Payout date: {formatDate(payoutDate)}</span>
      </div>
    </motion.div>
  );
};

export default PayoutCard;