import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getViolationsByManager } from './components/violationSlice';
import { AlertTriangle, FileText, Eye, BarChart, Shield, FilePlus, AlertOctagon } from 'lucide-react';
import PropTypes from 'prop-types';
import { banViolationProject, getProjectById } from '../projectmanager/components/projectSlice';
import { fetchGlobalSettingsByType } from '../globalSetting/components/globalSettingSlice';

const violationTypeIcons = {
    COPYRIGHT_INFRINGEMENT: <Shield className="w-6 h-6 text-red-500" />,
    REWARD_NON_DELIVERY: <FileText className="w-6 h-6 text-yellow-500" />,
    REWARD_DELAY: <BarChart className="w-6 h-6 text-orange-500" />,
    MONEY_LAUNDERING: <AlertTriangle className="w-6 h-6 text-purple-500" />,
    OTHER: <FilePlus className="w-6 h-6 text-gray-500" />
};

const violationTypeColors = {
    COPYRIGHT_INFRINGEMENT: 'bg-red-50 border-red-200',
    REWARD_NON_DELIVERY: 'bg-yellow-50 border-yellow-200',
    REWARD_DELAY: 'bg-orange-50 border-orange-200',
    MONEY_LAUNDERING: 'bg-purple-50 border-purple-200',
    OTHER: 'bg-gray-50 border-gray-200'
};

const violationTypeLabels = {
    COPYRIGHT_INFRINGEMENT: 'Copyright Infringement',
    REWARD_NON_DELIVERY: 'Reward Non-Delivery',
    REWARD_DELAY: 'Reward Delay',
    MONEY_LAUNDERING: 'Money Laundering',
    OTHER: 'Other Violation'
};

const ProjectViolationCard = ({ projectId, onManageViolations }) => {
    const dispatch = useDispatch();
    const entireState = useSelector(state => state);
    console.log("Entire Redux State:", entireState);

    const currentProject = useSelector(state => state.project.currentProject);
    const globalSettings = useSelector(state => state.globalSettings.settings);

    const violationState = useSelector(state => state.violation || {});
    const { violations = [], status = 'idle', error = null } = violationState;
    console.log("Violation state:", violationState);
    console.log("Extracted violations:", violations);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBanConfirmModal, setShowBanConfirmModal] = useState(false);
    const [banStatus, setBanStatus] = useState({ loading: false, error: null, success: false });
    const [maxViolationThreshold, setMaxViolationThreshold] = useState(5);
    const userRole = localStorage.getItem('role');
    const totalViolations = violations.length;
    const isProjectBanned = currentProject?.status === 'BAN';
    const canBanProject = totalViolations > maxViolationThreshold && !isProjectBanned;

    useEffect(() => {
        if (projectId) {
            dispatch(getViolationsByManager(projectId));
        }
    }, [dispatch, projectId]);

    useEffect(() => {
        dispatch(fetchGlobalSettingsByType(['MAX_SUSPENDED_TIME']));
    }, [dispatch]);

    useEffect(() => {
        if (globalSettings && globalSettings.length > 0) {
            const maxViolationSetting = globalSettings.find(setting => setting.type === 'MAX_SUSPENDED_TIME');
            if (maxViolationSetting) {
                const thresholdValue = parseInt(maxViolationSetting.value, 10);
                setMaxViolationThreshold(thresholdValue > 0 ? thresholdValue : 5);
                console.log("Updated violation threshold to:", thresholdValue);
            }
        }
    }, [globalSettings]);

    const handleViewDetails = (violation) => {
        setSelectedViolation(violation);
        setShowDetailsModal(true);
    };

    const handleBanProject = async () => {
        setBanStatus({ loading: true, error: null, success: false });
        try {
            await dispatch(banViolationProject(projectId)).unwrap();
            setBanStatus({ loading: false, error: null, success: true });
            setShowBanConfirmModal(false);

            await dispatch(getProjectById(projectId));
        } catch (error) {
            console.error("Ban project error:", error);
            let errorMessage = "Failed to ban project";

            // Better error handling to extract the actual error message
            if (error) {
                if (typeof error === 'string') {
                    errorMessage = error;
                } else if (typeof error === 'object') {
                    // Check for various error message formats
                    if (error.error) {
                        errorMessage = error.error;
                    } else if (error.message) {
                        errorMessage = error.message;
                    } else if (error.data?.error) {
                        errorMessage = error.data.error;
                    }
                }
            }

            setBanStatus({
                loading: false,
                error: errorMessage,
                success: false
            });
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Project Violations</h2>
                <div className="flex space-x-3">
                    <div className="relative group">
                        {userRole === 'MANAGER' && canBanProject && (
                            <button
                                onClick={() => setShowBanConfirmModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center"
                            >
                                <AlertOctagon className="w-4 h-4 mr-2" />
                                Ban Project
                            </button>
                        )}
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            Ban projects for exceeding violation limits.
                        </div>
                    </div>
                    {isProjectBanned && (
                        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                            <AlertOctagon className="w-4 h-4 mr-2" />
                            Project Banned
                        </div>
                    )}
                    {userRole === 'MANAGER' && (
                        <button
                            onClick={onManageViolations}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center"
                        >
                            <FilePlus className="w-4 h-4 mr-2" />
                            Manage Violations
                        </button>
                    )}
                </div>
            </div>

            {/* Violation count alert */}
            {totalViolations > maxViolationThreshold && !isProjectBanned && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <p>This project has accumulated <span className="font-bold">{totalViolations} violations</span>, which exceeds the threshold for banning ({maxViolationThreshold}).</p>
                </div>
            )}

            {totalViolations >= (maxViolationThreshold - 2) && totalViolations <= maxViolationThreshold && !isProjectBanned && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <p>Warning: This project has <span className="font-bold">{totalViolations} violations</span> and is approaching the ban threshold of {maxViolationThreshold}.</p>
                </div>
            )}

            {isProjectBanned && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                    <AlertOctagon className="w-5 h-5 mr-2" />
                    <p>This project has been <span className="font-bold">banned</span> due to excessive violations.</p>
                </div>
            )}

            {violations.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-green-800 mb-1">No Violations Recorded</h3>
                    <p className="text-green-600">This project has no recorded violations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {violations.map((violation, index) => (
                        <div
                            key={violation.id || index}
                            className={`border ${violationTypeColors[violation.type] || 'bg-gray-50 border-gray-200'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                            onClick={() => handleViewDetails(violation)}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {violationTypeIcons[violation.type] || <AlertTriangle className="w-6 h-6 text-gray-500" />}
                                </div>
                                <div className="ml-3 flex-grow">
                                    <div className="flex justify-between">
                                        <h3 className="text-md font-semibold text-gray-800">
                                            {violationTypeLabels[violation.type] || violation.type}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${violation.violate_time > 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {violation.violate_time} {violation.violate_time > 1 ? 'occurrences' : 'occurrence'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                        {violation.description}
                                    </p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            {new Date(violation.createdDate || Date.now()).toLocaleDateString()}
                                        </span>
                                        <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {showDetailsModal && selectedViolation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6 max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                {violationTypeIcons[selectedViolation.type] || <AlertTriangle className="w-6 h-6 text-gray-500" />}
                                <h3 className="text-lg font-bold text-gray-800 ml-2">
                                    {violationTypeLabels[selectedViolation.type] || selectedViolation.type}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">Occurrence</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedViolation.violate_time > 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {selectedViolation.violate_time} {selectedViolation.violate_time > 1 ? 'times' : 'time'}
                                </span>
                            </div>

                            <div className="mb-2">
                                <span className="text-sm text-gray-500">Date Reported</span>
                                <p className="font-medium">
                                    {new Date(selectedViolation.createdDate || Date.now()).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="mb-4">
                                <span className="text-sm text-gray-500">Reported By</span>
                                <p className="font-medium">{selectedViolation.managerName || 'System'}</p>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {selectedViolation.description}
                                </p>
                            </div>

                            {selectedViolation.evidenceFile && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-medium mb-2">Evidence</h4>
                                    <a
                                        href={selectedViolation.evidenceFile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Evidence Document
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBanConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <AlertOctagon className="w-6 h-6 text-red-500" />
                                <h3 className="text-lg font-bold text-gray-800 ml-2">
                                    Ban Project for Violations
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowBanConfirmModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                You are about to ban this project due to excessive violations ({totalViolations} total violations).
                                The system threshold for banning is {maxViolationThreshold} violations.
                                This action will permanently ban the project and notify all stakeholders.
                            </p>
                            <p className="text-gray-700 font-medium">
                                Are you sure you want to proceed?
                            </p>
                        </div>

                        {banStatus.error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                <p>{banStatus.error}</p>
                            </div>
                        )}

                        {banStatus.success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                                <p>Project banned successfully!</p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBanConfirmModal(false)}
                                disabled={banStatus.loading}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBanProject}
                                disabled={banStatus.loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                            >
                                {banStatus.loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <AlertOctagon className="w-4 h-4 mr-2" />
                                        Ban Project
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ProjectViolationCard.propTypes = {
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onManageViolations: PropTypes.func.isRequired
};

export default ProjectViolationCard;