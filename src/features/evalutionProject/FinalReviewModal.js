import React, { useMemo, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalSettingForEvalution } from '../globalSetting/components/globalSettingSlice';

const FinalReviewModal = ({
    showFinalReview,
    setShowFinalReview,
    displayEvaluations,
    totalScore,
    approvalStatus,
    chartData,
    chartOptions,
    approvalMessage,
    setApprovalMessage,
    handleProjectDecision,
    isSubmitting,
    isReadOnly = false,
    projectStatus = 'UNKNOWN'
}) => {
    const dispatch = useDispatch();
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const { settings, status: settingsStatus } = useSelector(state => state.globalSettings || { settings: [] });

    // Fetch global settings when the modal opens
    useEffect(() => {
        if (showFinalReview && settings.length === 0) {
            setIsLoadingSettings(true);
            dispatch(fetchGlobalSettingForEvalution())
                .finally(() => setIsLoadingSettings(false));
        }
    }, [showFinalReview, dispatch, settings.length]);

    // Extract thresholds from settings
    const passPercentage = useMemo(() => {
        const setting = settings.find(s => s.type === 'PASS_PERCENTAGE');
        return setting ? setting.value * 100 : 70;
    }, [settings]);

    const excellentPercentage = useMemo(() => {
        const setting = settings.find(s => s.type === 'PASS_EXCELLENT_PERCENTAGE');
        return setting ? setting.value * 100 : 90;
    }, [settings]);

    const resubmitPercentage = useMemo(() => {
        const setting = settings.find(s => s.type === 'RESUBMIT_PERCENTAGE');
        return setting ? setting.value * 100 : 30;
    }, [settings]);

    const getScoreMessage = useMemo(() => {
        const percentage = totalScore.percentage;

        if (percentage >= excellentPercentage) return 'Excellent - Potential Project';
        if (percentage >= passPercentage) return 'Meets standards';
        if (percentage >= resubmitPercentage) return 'Needs improvement';
        return 'Below standards';
    }, [totalScore.percentage, excellentPercentage, passPercentage, resubmitPercentage]);

    const getScoreColor = useMemo(() => {
        const percentage = totalScore.percentage;

        if (percentage >= passPercentage) return 'text-green-600';
        if (percentage >= resubmitPercentage) return 'text-yellow-600';
        return 'text-red-600';
    }, [totalScore.percentage, passPercentage, resubmitPercentage]);

    // Get project category based on score
    const getProjectCategory = useMemo(() => {
        const percentage = totalScore.percentage;

        if (percentage >= excellentPercentage) {
            return {
                name: 'Potential Project',
                description: 'This project exceeds quality standards and shows exceptional promise.',
                class: 'bg-purple-100 text-purple-800 border-purple-300',
                icon: '🌟'
            };
        } else if (percentage >= passPercentage) {
            return {
                name: 'Standard Project',
                description: 'This project meets our quality standards and is suitable for funding.',
                class: 'bg-green-100 text-green-800 border-green-300',
                icon: '✅'
            };
        } else if (percentage >= resubmitPercentage) {
            return {
                name: 'Needs Improvement',
                description: 'This project requires modifications before it can be approved.',
                class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: '⚠️'
            };
        } else {
            return {
                name: 'Below Standards',
                description: 'This project does not meet minimum quality standards.',
                class: 'bg-red-100 text-red-800 border-red-300',
                icon: '❌'
            };
        }
    }, [totalScore.percentage, excellentPercentage, passPercentage, resubmitPercentage]);

    if (!showFinalReview) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
                    <span>Final Project Evaluation</span>
                    {isReadOnly && (
                        <span className="badge badge-info">View Only</span>
                    )}
                </h2>

                {isLoadingSettings && (
                    <div className="alert alert-info mb-4">
                        <div className="flex gap-2 items-center">
                            <div className="loading loading-spinner loading-sm"></div>
                            <span>Loading evaluation thresholds...</span>
                        </div>
                    </div>
                )}

                {isReadOnly && (
                    <div className="alert alert-info mb-4">
                        <div className="flex gap-2 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>This project is in <strong>{projectStatus}</strong> state and can no longer be modified.</span>
                        </div>
                    </div>
                )}

                {/* Project Category Card */}
                <div className={`p-4 rounded-lg mb-6 border ${getProjectCategory.class}`}>
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">{getProjectCategory.icon}</div>
                        <div>
                            <h3 className="font-semibold">{getProjectCategory.name}</h3>
                            <p className="text-sm mt-1">{getProjectCategory.description}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Project Score</h3>
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32">
                            <Pie data={chartData} options={chartOptions} />
                        </div>
                        <div className="flex-1">
                            <div className="text-3xl font-bold mb-2">
                                {Math.round(totalScore.percentage)}%
                            </div>
                            <div className="text-base-content/70">
                                {totalScore.actual} / {totalScore.maximum} points
                            </div>
                            <div className={`mt-2 text-sm font-medium ${getScoreColor}`}>
                                {getScoreMessage}
                            </div>

                            {/* Display thresholds */}
                            <div className="mt-3 space-y-1 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>Passing threshold: ≥ {passPercentage}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span>Excellent threshold: ≥ {excellentPercentage}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span>Resubmit threshold: ≥ {resubmitPercentage}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span>Rejection threshold: &lt; {resubmitPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Evaluation Components</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayEvaluations.map(evaluation => {
                                    const percentage = evaluation.maximumPoint > 0
                                        ? ((evaluation.actualPoint || 0) / evaluation.maximumPoint) * 100
                                        : 0;

                                    return (
                                        <tr key={evaluation.id}>
                                            <td>{evaluation.componentName || evaluation.typeName}</td>
                                            <td>{evaluation.actualPoint || 0} / {evaluation.maximumPoint}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-base-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${percentage >= passPercentage ? 'bg-green-500' :
                                                                percentage >= resubmitPercentage ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{Math.round(percentage)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Recommendation</h3>
                    <div className={`p-4 rounded-lg ${approvalStatus.status === 'approve' ? 'bg-green-50 border border-green-200' :
                        'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            {approvalStatus.status === 'approve' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            <div>
                                <div className={`font-medium ${approvalStatus.status === 'approve' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {approvalStatus.status === 'approve' ? 'Recommended for Approval' : 'Recommended for Rejection'}
                                </div>
                                <p className={`text-sm mt-1 ${approvalStatus.status === 'approve' ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {approvalStatus.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowFinalReview(false)}
                        disabled={isSubmitting}
                    >
                        {isReadOnly ? "Close" : "Back to Evaluation"}
                    </button>

                    {!isReadOnly && (
                        <>
                            {approvalStatus.status === 'approve' ? (
                                <button
                                    className={`btn ${totalScore.percentage >= excellentPercentage ? 'btn-primary' : 'btn-success'}`}
                                    onClick={() => handleProjectDecision('approve')}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        totalScore.percentage >= excellentPercentage ? 'Approve as Potential Project' : 'Approve Project'
                                    )}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-error"
                                    onClick={() => handleProjectDecision('reject')}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        totalScore.percentage < resubmitPercentage ? 'Reject & Ban Project' : 'Reject Project'
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinalReviewModal;