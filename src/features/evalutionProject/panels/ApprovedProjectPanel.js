import React, { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertOctagon } from 'lucide-react';
import { toast } from 'react-toastify';
import { approveUnderReviewProject } from '../components/evalutionProjectSlice';
import { banUnderReviewProject } from '../../projectmanager/components/projectSlice';
import { useSelector } from 'react-redux';
import { fetchGlobalSettingsByType } from '../../globalSetting/components/globalSettingSlice';


const ApprovedProjectPanel = ({
    displayEvaluations,
    evaluationItems,
    selectedEvaluation,
    setSelectedEvaluation,
    comment,
    getEvaluationItems,
    dispatch,
    currentProject,
    expandedPhase,
    hasRequiredDocuments
}) => {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isBanning, setIsBanning] = useState(false);
    const userRole = localStorage.getItem('role');
    const isUnderReview = currentProject?.status === 'UNDER_REVIEW';
    const [thresholds, setThresholds] = useState({
        pass: 70,
        resubmit: 50,
        excellent: 90
    });
    const globalSettings = useSelector(state => state.globalSettings.settings);

    useEffect(() => {
        const evaluationThresholdTypes = ['PASS_PERCENTAGE', 'RESUBMIT_PERCENTAGE', 'PASS_EXCELLENT_PERCENTAGE'];
        dispatch(fetchGlobalSettingsByType(evaluationThresholdTypes));
    }, [dispatch]);

    useEffect(() => {
        if (globalSettings.length > 0) {
            const newThresholds = { ...thresholds };

            globalSettings.forEach(setting => {
                if (setting.type === 'PASS_PERCENTAGE') {
                    newThresholds.pass = parseFloat(setting.value) * 100;
                } else if (setting.type === 'RESUBMIT_PERCENTAGE') {
                    newThresholds.resubmit = parseFloat(setting.value) * 100;
                } else if (setting.type === 'PASS_EXCELLENT_PERCENTAGE') {
                    newThresholds.excellent = parseFloat(setting.value) * 100;
                }
            });

            setThresholds(newThresholds);
        }
    }, [globalSettings]);

    const getScoreStatus = (percentage) => {
        if (percentage >= thresholds.excellent) return { text: 'Potential Project', color: 'text-green-600' };
        if (percentage >= thresholds.pass) return { text: 'Approved', color: 'text-green-600' };
        if (percentage >= thresholds.resubmit) return { text: 'Needs Improvement', color: 'text-yellow-600' };
        return { text: 'Rejected', color: 'text-red-600' };
    };

    // Calculate total score
    const calculateTotalScore = useCallback(() => {
        let totalActual = 0;
        let totalMaximum = 0;

        displayEvaluations.forEach(evaluation => {
            totalActual += Number(evaluation.actualPoint || 0);
            totalMaximum += Number(evaluation.maximumPoint || 0);
        });

        const percentage = totalMaximum > 0 ? (totalActual / totalMaximum) * 100 : 0;

        return {
            actual: totalActual,
            maximum: totalMaximum,
            percentage: percentage
        };
    }, [displayEvaluations]);

    // Calculate component weight and contribution to total
    const calculateComponentContribution = useCallback((evaluation) => {
        const totalMaximum = displayEvaluations.reduce((sum, e) => sum + Number(e.maximumPoint || 0), 0);
        const componentMaximum = Number(evaluation.maximumPoint || 0);

        // Component weight - what percentage of total possible points this component represents
        const componentWeight = totalMaximum > 0 ? (componentMaximum / totalMaximum) * 100 : 0;

        // Component score percentage
        const componentPercentage = componentMaximum > 0 ?
            (Number(evaluation.actualPoint || 0) / componentMaximum) * 100 : 0;

        // Component contribution to total score
        const componentContribution = totalMaximum > 0 ?
            (Number(evaluation.actualPoint || 0) / totalMaximum) * 100 : 0;

        return {
            weight: componentWeight,
            percentage: componentPercentage,
            contribution: componentContribution
        };
    }, [displayEvaluations]);

    // Prepare chart data
    const preparePieChartData = useCallback((scoreObj) => {
        return {
            labels: ['Score', 'Remaining'],
            datasets: [
                {
                    data: [scoreObj.percentage, 100 - scoreObj.percentage],
                    backgroundColor: [
                        scoreObj.percentage >= 70 ? '#4ADE80' :
                            scoreObj.percentage >= 50 ? '#FBBF24' : '#EF4444',
                        '#f8f9fa'
                    ],
                    borderColor: ['transparent', 'transparent'],
                    borderWidth: 0,
                },
            ],
        };
    }, []);

    const handleApproveProject = () => {
        setShowApprovalModal(true);
    };

    const handleBanProject = () => {
        setShowBanModal(true);
    };

    const confirmApproval = async () => {
        if (!currentProject || !currentProject.id) return;

        try {
            setIsApproving(true);
            await dispatch(approveUnderReviewProject({ projectId: currentProject.id })).unwrap();
            toast.success('Project has been approved successfully!');
            setShowApprovalModal(false);
            window.location.reload(); // Reload page to update project status
        } catch (error) {
            console.error('Error approving project:', error);
            toast.error(error.message || 'Failed to approve project');
        } finally {
            setIsApproving(false);
        }
    };

    const confirmBan = async () => {
        if (!currentProject || !currentProject.id) return;

        try {
            setIsBanning(true);
            await dispatch(banUnderReviewProject(currentProject.id)).unwrap();
            toast.success('Project has been banned successfully!');
            setShowBanModal(false);
            window.location.reload(); // Reload page to update project status
        } catch (error) {
            console.error('Error banning project:', error);
            toast.error(error.message || 'Failed to ban project');
        } finally {
            setIsBanning(false);
        }
    };

    // Chart options
    const chartOptions = {
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${Math.round(context.raw)}%`;
                    }
                }
            }
        },
        cutout: '70%'
    };

    return (
        <div className="bg-base-100 rounded-xl shadow-md p-4 h-full flex flex-col">
            {/* Show detail view when evaluation is selected, otherwise show summary */}
            {selectedEvaluation ? (
                <>
                    <div className="flex justify-between items-center mb-4 sticky top-0 z-10 bg-base-100 py-2">
                        <h3 className="text-xl font-bold">
                            {displayEvaluations.find(e => e.id === selectedEvaluation)?.componentName ||
                                displayEvaluations.find(e => e.id === selectedEvaluation)?.typeName ||
                                'Evaluation Details'}
                        </h3>
                        <button
                            className="btn btn-sm btn-outline flex items-center"
                            onClick={() => setSelectedEvaluation(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Summary
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto overflow-x-hidden pr-1">
                        {evaluationItems.length > 0 ? (
                            <div className="space-y-3 mb-4">
                                {evaluationItems.map((item) => (
                                    <div key={item.id} className="p-3 border border-slate-200 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-medium text-base text-slate-800 leading-tight">{item.basicRequirement}</h4>
                                            <span className="badge badge-sm bg-slate-100 text-slate-600 font-normal whitespace-nowrap">
                                                {item.maxPoint} pts max
                                            </span>
                                        </div>

                                        <p className="mt-2 mb-2 text-sm text-slate-600 leading-relaxed">{item.evaluationCriteria}</p>

                                        <div className="mt-2 flex items-center">
                                            <div className={`text-xs font-medium rounded-md py-1 px-2 flex items-center
                                                ${item.actualPoint >= item.maxPoint * 0.7 ? 'bg-emerald-100 text-emerald-700' :
                                                    item.actualPoint >= item.maxPoint * 0.4 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Score: {item.actualPoint}/{item.maxPoint}
                                            </div>

                                            <div className="ml-3 w-full max-w-[120px] bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${item.actualPoint >= item.maxPoint * 0.7 ? 'bg-emerald-500' :
                                                        item.actualPoint >= item.maxPoint * 0.4 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${(item.actualPoint / item.maxPoint) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {evaluationItems.length > 0 && (
                                    <div className="mt-4 border-t border-slate-200 pt-3 mb-3">
                                        <h4 className="text-sm font-medium text-slate-700 mb-1.5">Evaluation Comment:</h4>
                                        <div className="p-2.5 bg-slate-50 rounded-md text-sm text-slate-700 border border-slate-200">
                                            {comment ?
                                                <p>{comment}</p> :
                                                <span className="text-slate-400 italic">No comments provided</span>
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <div className="loading loading-spinner loading-md mb-2"></div>
                                    <p className="text-sm text-slate-500">Loading evaluation details...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Summary View */}
                    <div className="flex justify-between items-center mb-3 flex-shrink-0">
                        <h2 className="text-xl font-semibold">Evaluation Summary</h2>
                    </div>
                    {userRole === 'MANAGER' && isUnderReview && !selectedEvaluation && (
                        <div className="mb-4 flex flex-wrap gap-2 justify-end">
                            {expandedPhase && hasRequiredDocuments && hasRequiredDocuments(expandedPhase) && (
                                <button
                                    onClick={handleApproveProject}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Approve Project
                                </button>
                            )}
                            <div className="relative group">
                                <button
                                    onClick={handleBanProject}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                                >
                                    <AlertOctagon className="w-4 h-4 mr-1" />
                                    Ban Project
                                </button>
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    Ban projects with unsuitable phase documents
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col flex-grow overflow-hidden">
                        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm flex-shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">Final Score</h3>
                                <span className="text-xl font-bold">
                                    {calculateTotalScore().actual} / {calculateTotalScore().maximum}
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({Math.round(calculateTotalScore().percentage)}%)
                                    </span>
                                </span>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <div className="w-40 h-40 relative">
                                    <Pie data={preparePieChartData(calculateTotalScore())} options={chartOptions} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold">{Math.round(calculateTotalScore().percentage)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <div className={`text-lg font-medium ${getScoreStatus(calculateTotalScore().percentage).color}`}>
                                    {getScoreStatus(calculateTotalScore().percentage).text}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                                <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                    Excellent: ≥{Math.round(thresholds.excellent)}%
                                </div>
                                <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                    Pass: ≥{Math.round(thresholds.pass)}%
                                </div>
                                <div className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                                    Resubmit: ≥{Math.round(thresholds.resubmit)}%
                                </div>
                                <div className="px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                    Reject: &lt;{Math.round(thresholds.resubmit)}%
                                </div>
                            </div>
                        </div>

                        {/* Component summary list with click to view details */}
                        <div className="mt-2 flex-grow overflow-hidden flex flex-col">
                            <h3 className="font-semibold mb-2 flex-shrink-0">Latest Grade</h3>
                            <div className="overflow-y-auto flex-grow">
                                {displayEvaluations.map(evaluation => {
                                    const componentStats = calculateComponentContribution(evaluation);

                                    return (
                                        <div
                                            key={evaluation.id}
                                            className="p-3 border rounded-lg hover:bg-base-200 cursor-pointer transition-all"
                                            onClick={() => {
                                                setSelectedEvaluation(evaluation.id);
                                                dispatch(getEvaluationItems(evaluation.id));
                                            }}
                                        >
                                            <div className="flex justify-between mb-1.5">
                                                <span className="font-medium">{evaluation.componentName || evaluation.typeName}</span>
                                                <span className="font-medium">
                                                    {evaluation.actualPoint || 0}/{evaluation.maximumPoint || 0}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                                <span>Component score: {Math.round(componentStats.percentage)}%</span>
                                                <span>Weight: {Math.round(componentStats.weight)}% of total</span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                <div
                                                    className={`h-1.5 rounded-full ${componentStats.percentage >= 70 ? 'bg-emerald-500' :
                                                        componentStats.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${componentStats.percentage}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-600 italic">
                                                    Contributes {Math.round(componentStats.contribution)}% to total score
                                                </span>
                                                <span className="text-xs text-blue-500">
                                                    View details →
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Approval Confirmation Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <motion.div
                        className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                            Approve Project
                        </h3>

                        <p className="text-gray-600 mb-4">
                            Are you sure you want to approve this project? The project will move from
                            "Under Review" to "Approved" status.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproval}
                                disabled={isApproving}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center"
                            >
                                {isApproving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Approval"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Ban Confirmation Modal */}
            {showBanModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <motion.div
                        className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <AlertOctagon className="w-6 h-6 text-red-500 mr-2" />
                            Ban Project
                        </h3>

                        <p className="text-gray-600 mb-4">
                            Are you sure you want to ban this project? This action will permanently ban the project,
                            and it will no longer be available for funding.
                        </p>

                        <p className="text-gray-700 font-medium mb-4">
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBan}
                                disabled={isBanning}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center"
                            >
                                {isBanning ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    "Ban Project"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

ApprovedProjectPanel.propTypes = {
    displayEvaluations: PropTypes.array.isRequired,
    evaluationItems: PropTypes.array.isRequired,
    selectedEvaluation: PropTypes.number,
    setSelectedEvaluation: PropTypes.func.isRequired,
    comment: PropTypes.string,
    getEvaluationItems: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    currentProject: PropTypes.object,
    expandedPhase: PropTypes.number,
    hasRequiredDocuments: PropTypes.func
};

export default ApprovedProjectPanel;