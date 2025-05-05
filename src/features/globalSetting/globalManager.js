import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalSettings, updateGlobalSetting } from './components/globalSettingSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    AdjustmentsHorizontalIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';

const settingDescriptions = {
    'MILESTONE_VALUE_PERCENTAGE': 'Percentage of total project funds that will be allocated to each milestone.',
    'PASS_PERCENTAGE': 'The minimum score percentage required for a project to pass evaluation.',
    'PASS_EXCELLENT_PERCENTAGE': 'The minimum score percentage required for a project to achieve excellent rating.',
    'PLATFORM_CHARGE_PERCENTAGE': 'Fee percentage charged by the platform on each successful transaction.',
    'RESUBMIT_PERCENTAGE': 'The minimum score percentage for project resubmission eligibility.'
};

const settingIcons = {
    'MILESTONE_VALUE_PERCENTAGE': '🏁',
    'PASS_PERCENTAGE': '✅',
    'PLATFORM_CHARGE_PERCENTAGE': '💰',
    'PASS_EXCELLENT_PERCENTAGE': '🌟',
    'RESUBMIT_PERCENTAGE': '🔄'
};

// Định nghĩa thứ tự hiển thị mong muốn
const settingOrder = [
    'RESUBMIT_PERCENTAGE',
    'PASS_PERCENTAGE',
    'PASS_EXCELLENT_PERCENTAGE',
    'MILESTONE_VALUE_PERCENTAGE',
    'PLATFORM_CHARGE_PERCENTAGE'
];

function GlobalSettingsManager() {
    const dispatch = useDispatch();
    const { settings, status, error } = useSelector(state => state.globalSettings);
    const [editValues, setEditValues] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [tooltipId] = useState("settings-tooltip");
    const [sortedSettings, setSortedSettings] = useState([]);

    useEffect(() => {
        dispatch(fetchGlobalSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings.length > 0) {
            // Tạo đối tượng map để dễ dàng truy cập các settings theo type
            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.type] = setting;
            });

            // Sắp xếp settings theo thứ tự đã định nghĩa
            const ordered = [];

            // Thêm các settings theo thứ tự đã định nghĩa
            settingOrder.forEach(type => {
                if (settingsMap[type]) {
                    ordered.push(settingsMap[type]);
                }
            });

            // Thêm các settings còn lại nếu có (phòng trường hợp có setting mới)
            settings.forEach(setting => {
                if (!settingOrder.includes(setting.type)) {
                    ordered.push(setting);
                }
            });

            setSortedSettings(ordered);

            // Khởi tạo giá trị chỉnh sửa
            const initialEditValues = {};
            settings.forEach(setting => {
                initialEditValues[setting.id] = setting.value;
            });
            setEditValues(initialEditValues);
        }
    }, [settings]);

    const formatSettingName = (name) => {
        return name.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const handleValueChange = (id, value) => {
        let numValue = parseFloat(value);
        // Ensure value is between 0 and 1
        if (numValue > 1) numValue = 1;
        if (numValue < 0) numValue = 0;
        if (isNaN(numValue)) numValue = 0;

        setEditValues(prev => ({
            ...prev,
            [id]: numValue
        }));
    };

    const handleEdit = (id) => {
        setEditingId(id);
    };

    const handleCancel = () => {
        // Reset to original value
        const setting = settings.find(s => s.id === editingId);
        if (setting) {
            setEditValues(prev => ({
                ...prev,
                [editingId]: setting.value
            }));
        }
        setEditingId(null);
    };

    const handleSave = (id) => {
        dispatch(updateGlobalSetting({
            id,
            value: editValues[id]
        }))
            .unwrap()
            .then(() => {
                toast.success('Setting updated successfully');
                setEditingId(null);
            })
            .catch((err) => {
                toast.error(`Failed to update: ${err}`);
            });
    };

    const handleRefresh = () => {
        dispatch(fetchGlobalSettings());
        toast.info('Refreshing settings...');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
            <Tooltip id={tooltipId} />

            <div className="max-w-[95%] mx-auto bg-base-100 shadow-xl rounded-xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />
                        Global Settings Management
                    </h1>

                    <button
                        onClick={handleRefresh}
                        className="p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Refresh Settings"
                    >
                        <ArrowPathIcon className="h-5 w-5 text-blue-600" />
                    </button>
                </div>

                {status === 'loading' && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Error loading settings: {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {status !== 'loading' && (
                    <motion.div
                        className="grid grid-cols-1 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {sortedSettings.map(setting => (
                            <motion.div
                                key={setting.id}
                                variants={itemVariants}
                                className={`bg-white rounded-lg border ${editingId === setting.id ? 'border-blue-300 shadow-md' : 'border-gray-200'} 
                                overflow-hidden shadow-sm transition-all duration-300`}
                            >
                                <div className="px-5 py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-blue-50 rounded-full text-2xl">
                                            {settingIcons[setting.type] || '⚙️'}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {formatSettingName(setting.type)}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {settingDescriptions[setting.type] || 'Configuration parameter for the system.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Current Value</div>
                                            <div className="font-semibold text-lg text-gray-900">
                                                {(setting.value * 100)}%
                                            </div>
                                        </div>

                                        {editingId === setting.id ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-24">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="1"
                                                            step="0.0001"
                                                            value={editValues[setting.id] || 0}
                                                            onChange={(e) => handleValueChange(setting.id, e.target.value)}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleSave(setting.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        disabled={status === 'updating'}
                                                    >
                                                        {status === 'updating' ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(setting.id)}
                                                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
                                                data-tooltip-id={tooltipId}
                                                data-tooltip-content="Edit Setting"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <div className="mt-8 pt-4 border-t border-gray-200 text-gray-600 text-sm">
                    <p>
                        These settings control key aspects of the platform's functionality. Changes will take effect immediately.
                    </p>
                    <p className="mt-2">
                        <span className="inline-flex items-center gap-1">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            Last updated: {new Date().toLocaleDateString()}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default GlobalSettingsManager;