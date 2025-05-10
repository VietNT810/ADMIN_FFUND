import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const RejectedProjectPanel = ({
    displayEvaluations,
    evaluationItems,
    selectedEvaluation,
    setSelectedEvaluation,
    comment,
    dispatch,
    getEvaluationItems,
    currentProject
}) => {
    const navigate = useNavigate();

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

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Rejection Notice Panel */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm flex-shrink-0">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-red-800">Project Rejected</h3>
                        <div className="mt-2 text-red-700">
                            <p>This project did not meet the minimum requirements for approval. Below you can see the detailed evaluation that led to this decision.</p>
                        </div>
                        {currentProject && currentProject.rejectionReason && (
                            <div className="mt-3 p-3 bg-white border border-red-100 rounded-md">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Rejection Reason:</h4>
                                <p className="text-sm text-gray-600">{currentProject.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Show detail view when evaluation is selected, otherwise show summary */}
            {selectedEvaluation ? (
                <>
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-base-200 z-10 p-2 rounded-lg">
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

                                {comment && (
                                    <div className="mt-4 border-t border-slate-200 pt-3 mb-3">
                                        <h4 className="text-sm font-medium text-slate-700 mb-1.5">Evaluation Comment:</h4>
                                        <div className="p-2.5 bg-slate-50 rounded-md text-sm text-slate-700 border border-slate-200">
                                            <p>{comment}</p>
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
                    {/* Score Summary Panel */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium text-slate-800">Evaluation Summary</h3>
                            <span className="text-xl font-bold bg-slate-100 px-3 py-1 rounded-md">
                                {calculateTotalScore().actual} / {calculateTotalScore().maximum}
                                <span className="text-sm font-normal text-slate-500 ml-1">
                                    ({Math.round(calculateTotalScore().percentage)}%)
                                </span>
                            </span>
                        </div>

                        <div className="relative w-full h-3 mb-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${calculateTotalScore().percentage >= 70 ? 'bg-green-500' :
                                    calculateTotalScore().percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${calculateTotalScore().percentage}%` }}
                            ></div>
                        </div>

                        <div className="mt-3 mb-2">
                            <span className={`text-sm font-medium px-2 py-1 rounded ${calculateTotalScore().percentage >= 70 ? 'bg-green-100 text-green-800' :
                                calculateTotalScore().percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {calculateTotalScore().percentage >= 70 ? 'Passing Score' :
                                    calculateTotalScore().percentage >= 50 ? 'Below Standard' :
                                        'Significantly Below Requirements'}
                            </span>
                        </div>
                    </div>

                    {/* Components List */}
                    <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden h-[calc(100%-8rem)]">
                        <h3 className="font-semibold mb-3">Component Evaluations</h3>
                        <div className="overflow-y-auto max-h-full">
                            {displayEvaluations.map(evaluation => {
                                const componentPercentage = evaluation.maximumPoint > 0 ?
                                    (Number(evaluation.actualPoint || 0) / Number(evaluation.maximumPoint || 0)) * 100 : 0;

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

                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                            <div
                                                className={`h-1.5 rounded-full ${componentPercentage >= 70 ? 'bg-emerald-500' :
                                                    componentPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${componentPercentage}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-600">
                                                Score: {Math.round(componentPercentage)}%
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

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => navigate('/projects-list')}
                            className="btn btn-outline btn-sm"
                        >
                            Back to Project List
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

RejectedProjectPanel.propTypes = {
    displayEvaluations: PropTypes.array.isRequired,
    evaluationItems: PropTypes.array.isRequired,
    selectedEvaluation: PropTypes.number,
    setSelectedEvaluation: PropTypes.func.isRequired,
    comment: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    getEvaluationItems: PropTypes.func.isRequired,
    currentProject: PropTypes.object
};

export default RejectedProjectPanel;