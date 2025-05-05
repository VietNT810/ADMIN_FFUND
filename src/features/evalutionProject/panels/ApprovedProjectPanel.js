import React, { useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const ApprovedProjectPanel = ({
    displayEvaluations,
    evaluationItems,
    selectedEvaluation,
    setSelectedEvaluation,
    comment,
    getEvaluationItems,
    dispatch
}) => {
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
                    <div className="flex justify-between items-center mb-4">
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
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold">Evaluation Summary</h2>
                    </div>

                    <div className="flex flex-col flex-grow">
                        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
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
                                <div className={`text-lg font-medium 
                                    ${calculateTotalScore().percentage >= 70 ? 'text-green-600' :
                                        calculateTotalScore().percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {calculateTotalScore().percentage >= 90 ? 'Potential Project' :
                                        calculateTotalScore().percentage >= 70 ? 'Approved' :
                                            calculateTotalScore().percentage >= 50 ? 'Needs Improvement' : 'Rejected'}
                                </div>
                            </div>
                        </div>

                        {/* Component summary list with click to view details */}
                        <div className="mt-2 flex-grow overflow-hidden">
                            <h3 className="font-semibold mb-2">Lastest Grade</h3>
                            <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)]">
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
};

export default ApprovedProjectPanel;