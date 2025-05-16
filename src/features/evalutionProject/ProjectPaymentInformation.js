import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getProjectPaymentInformationByProjectId } from './components/evalutionProjectSlice';
import { CreditCardIcon,  DollarSignIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon, BanknoteIcon } from 'lucide-react';

const PaymentInformationTab = ({ projectId }) => {
    const dispatch = useDispatch();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPaymentInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await dispatch(getProjectPaymentInformationByProjectId(projectId)).unwrap();
            setPaymentInfo(result.data);
        } catch (err) {
            setError(err.error || "Failed to load payment information");
            console.error("Error fetching payment info:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPaymentInfo();
        setRefreshing(false);
    };

    useEffect(() => {
        if (projectId) {
            fetchPaymentInfo();
        }
    }, [projectId, dispatch]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'LINKED':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        {status}
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                        <RefreshCwIcon className="w-3 h-3 mr-1" />
                        {status}
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center">
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        {status || 'UNKNOWN'}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
                <button 
                    onClick={handleRefresh}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!paymentInfo) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
                <p>No payment information available for this project.</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <CreditCardIcon className="w-6 h-6 mr-2 text-blue-500" />
                    Project Payment Information
                </h2>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 flex items-center"
                >
                    {refreshing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCwIcon className="w-4 h-4 mr-1.5" />
                            Refresh
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm uppercase text-gray-500 mb-3 font-semibold">Account Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-md mr-3">
                                <BanknoteIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Stripe Account ID</p>
                                <p className="font-medium text-gray-800">{paymentInfo.stripeAccountId || 'Not connected'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-md mr-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <div className="mt-1">{getStatusBadge(paymentInfo.status)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm uppercase text-gray-500 mb-3 font-semibold">Balance Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-md mr-3">
                                <DollarSignIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Available Balance</p>
                                <p className="font-medium text-gray-800">${(paymentInfo.stripe_balance || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-yellow-100 p-2 rounded-md mr-3">
                                <DollarSignIcon className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Balance</p>
                                <p className="font-medium text-gray-800">${(paymentInfo.pendingBalance || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            

            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm uppercase text-blue-600 mb-2 font-semibold">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Project ID</p>
                        <p className="text-sm font-medium">{paymentInfo.projectId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="text-sm font-medium">{new Date(paymentInfo.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-sm font-medium">{new Date(paymentInfo.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentInformationTab;