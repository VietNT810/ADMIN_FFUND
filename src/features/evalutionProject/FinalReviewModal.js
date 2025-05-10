import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

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
    const { thresholds } = useSelector(state => state.evaluation);

    const passPercentage = thresholds.passPercentage * 100;
    const excellentPercentage = thresholds.excellentPercentage * 100;
    const resubmitPercentage = thresholds.resubmitPercentage * 100;

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

                {isReadOnly && (
                    <div className="alert alert-info mb-4">
                        <div className="flex gap-2 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>This project is in <strong>{projectStatus}</strong> state and can no longer be modified.</span>
                        </div>
                    </div>
                )}

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