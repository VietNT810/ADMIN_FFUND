import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Project detail components
import ProjectDetailsDocumentEvaluation from './EvaluationProjectDocument';
import ProjectDetailsPhase from './ProjectDetailsPhase';
import ProjectDetailsStory from './ProjectDetailsStory';
import ProjectDetailsUpdate from './ProjectDetailsUpdate';
import ProjectDetailsEvaluation from './EvaluationProjectDetails';

// Evaluation slice
import {
    getProjectEvaluations,
    getEvaluationItems,
    updateEvaluationComment,
    updateEvaluationGrade,
    clearError,
    clearSuccessMessage,
    getProjectEvaluationsAfter
} from './components/evalutionProjectSlice';

import { approveProject, rejectProject } from './components/projectSlice';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Import the new FinalReviewModal component
import FinalReviewModal from './FinalReviewModal';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectScoring = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Debug more of Redux state to see if it's properly registered
    const entireState = useSelector(state => state);
    const evaluationState = useSelector(state => state.evaluation);

    // Log the entire Redux state to see if the evaluation reducer is registered
    console.log('Entire Redux State:', entireState);
    console.log('Evaluation State from Redux:', evaluationState);

    // Safely extract values with fallbacks
    const evaluations = evaluationState?.evaluations || [];
    const evaluationItems = evaluationState?.evaluationItems || [];
    const status = evaluationState?.status || 'idle';
    const error = evaluationState?.error || null;
    const successMessage = evaluationState?.successMessage || null;

    const [activeTab, setActiveTab] = useState('basic');
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [comment, setComment] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [manuallyPopulatedEvaluations, setManuallyPopulatedEvaluations] = useState([]);

    const [showFinalReview, setShowFinalReview] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentProject } = useSelector(state => state.project || { currentProject: null });

    // Use either Redux evaluations or manually populated ones, whichever has data
    const displayEvaluations = evaluations.length > 0 ? evaluations : manuallyPopulatedEvaluations;

    const areAllEvaluationsScored = useCallback(() => {
        if (!displayEvaluations.length) return false;
        return displayEvaluations.every(evaluation =>
            evaluation.actualPoint !== null && evaluation.actualPoint !== undefined);
    }, [displayEvaluations]);

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

    const determineApprovalStatus = useCallback((percentage) => {
        if (percentage >= 90) {
            return {
                status: 'approve',
                message: 'Project is Potential! This project exceeds our quality standards and shows great promise.'
            };
        } else if (percentage >= 70) {
            return {
                status: 'approve',
                message: 'Project meets our quality standards and is approved for funding.'
            };
        } else if (percentage >= 50) {
            return {
                status: 'reject',
                message: 'Project requires significant improvements before it can be approved.'
            };
        } else {
            return {
                status: 'reject',
                message: 'Project does not meet minimum quality standards and is rejected.'
            };
        }
    }, []);

    // Handler to submit final evaluation
    const submitFinalEvaluation = useCallback(() => {
        setShowFinalReview(true);
    }, []);

    // Handler to approve or reject project
    const handleProjectDecision = useCallback(async (decision) => {
        try {
            setIsSubmitting(true);

            if (decision === 'approve') {
                await dispatch(approveProject(projectId)).unwrap();
                dispatch({
                    type: 'global/setNotification',
                    payload: {
                        type: 'success',
                        message: 'Project has been approved successfully!'
                    }
                });
            } else {
                await dispatch(rejectProject(projectId)).unwrap();
                dispatch({
                    type: 'global/setNotification',
                    payload: {
                        type: 'info',
                        message: 'Project has been rejected.'
                    }
                });
            }

            // Navigate to project list after action
            navigate('/projects');
        } catch (error) {
            console.error('Error during project decision:', error);
            dispatch({
                type: 'global/setNotification',
                payload: {
                    type: 'error',
                    message: `Failed to ${decision} project: ${error.message || 'Unknown error'}`
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [dispatch, navigate, projectId]);

    // Prepare chart data for the pie chart
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

    // Fetch data function
    const fetchData = useCallback(async () => {
        if (!projectId) return;

        try {
            console.log(`Fetching evaluations for project ID: ${projectId}`);

            let actionResult;

            const useAfterEvaluationStatuses = ['APPROVED', 'FUNDRAISING_COMPLETED', 'SUSPENDED', 'BAN', 'UNDER_REVIEW'];

            if (currentProject && currentProject.status && useAfterEvaluationStatuses.includes(currentProject.status)) {
                console.log(`Project status is ${currentProject.status}, using getProjectEvaluationsAfter API`);
                actionResult = await dispatch(getProjectEvaluationsAfter(parseInt(projectId)));
            } else {
                console.log(`Project status: ${currentProject?.status || 'unknown'}, using regular getProjectEvaluations API`);
                actionResult = await dispatch(getProjectEvaluations(parseInt(projectId)));
            }

            console.log('Action Result:', actionResult);

            if (actionResult.payload && Array.isArray(actionResult.payload)) {
                const formattedEvaluations = actionResult.payload.map(evaluation => ({
                    ...evaluation,
                    componentName: evaluation.typeName
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ')
                }));
                setManuallyPopulatedEvaluations(formattedEvaluations);
                console.log('Manually populated evaluations:', formattedEvaluations);
            }

            setIsInitialLoad(false);
        } catch (err) {
            console.error('Error fetching evaluations:', err);

            if (err && err.includes && err.includes('Unauthorized') && retryCount >= 2) {
                localStorage.setItem('redirectUrl', window.location.pathname);
                navigate('/login');
                return;
            }

            setRetryCount(prev => prev + 1);
            setIsInitialLoad(false);
        }
    }, [dispatch, projectId, retryCount, navigate, currentProject]);

    useEffect(() => {
        fetchData();

        if (retryCount > 0 && retryCount < 3 && localStorage.getItem('userToken')) {
            const timer = setTimeout(() => {
                fetchData();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [fetchData, retryCount]);

    useEffect(() => {
        if (currentProject && currentProject.status) {
            console.log('Current Project Status:', currentProject.status);
            if (!isInitialLoad) {
                fetchData();
            }
        }
    }, [currentProject, fetchData, isInitialLoad]);

    useEffect(() => {
        console.log('Current evaluations from Redux:', evaluations);
        console.log('Current manually populated evaluations:', manuallyPopulatedEvaluations);
        console.log('Current Project:', currentProject);
    }, [evaluations, manuallyPopulatedEvaluations, currentProject]);

    useEffect(() => {
        console.log('Auth token exists:', !!localStorage.getItem('userToken'));

        // Cleanup success messages when component unmounts
        return () => {
            dispatch(clearSuccessMessage());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedEvaluation) {
            dispatch(getEvaluationItems(selectedEvaluation));

            // Check both the Redux evaluations and manually populated ones
            const currentEval = evaluations?.find(evaluation => evaluation.id === selectedEvaluation) ||
                manuallyPopulatedEvaluations?.find(evaluation => evaluation.id === selectedEvaluation);

            if (currentEval && currentEval.comment) {
                setComment(currentEval.comment);
            } else {
                setComment('');
            }
        }
    }, [dispatch, selectedEvaluation, evaluations, manuallyPopulatedEvaluations]);

    const handleScoreChange = (itemId, point) => {
        dispatch(updateEvaluationGrade({ itemId, point }));
    };

    const handleCommentSave = () => {
        if (selectedEvaluation) {
            dispatch(updateEvaluationComment({ id: selectedEvaluation, comment }));
        }
    };

    const handleRetryFetch = () => {
        if (error) dispatch(clearError());
        setRetryCount(0);
        fetchData();
    };

    // Calculate total score
    const totalPoints = evaluationItems.reduce((sum, item) => sum + (item.actualPoint || 0), 0);
    const maxPoints = evaluationItems.reduce((sum, item) => sum + (item.maxPoint || 0), 0);
    const scorePercentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const getScoreColor = () => {
        if (scorePercentage >= 80) return 'bg-green-500';
        if (scorePercentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic': return <ProjectDetailsEvaluation projectId={projectId} evaluationMode={true} />;
            case 'story': return <ProjectDetailsStory projectId={projectId} evaluationMode={true} />;
            case 'documents': return <ProjectDetailsDocumentEvaluation projectId={projectId} evaluationMode={true} />;
            case 'phases': return <ProjectDetailsPhase projectId={projectId} evaluationMode={true} />;
            case 'updates': return <ProjectDetailsUpdate projectId={projectId} evaluationMode={true} />;
            default: return <ProjectDetailsEvaluation projectId={projectId} evaluationMode={true} />;
        }
    };

    // Chart options
    const chartOptions = {
        plugins: {
            legend: {
                display: false
            },
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

    if (status === 'loading' && isInitialLoad) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 overflow-x-hidden">
            {error && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert alert-error">
                        <div>
                            <span>{error}</span>
                            <button onClick={() => dispatch(clearError())} className="btn btn-xs btn-circle ml-2">×</button>
                        </div>
                        {error.includes && error.includes('Session expired') && (
                            <button
                                onClick={handleRetryFetch}
                                className="btn btn-xs btn-warning mt-2"
                            >
                                Retry with new token
                            </button>
                        )}
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert alert-success">
                        <div>
                            <span>{successMessage}</span>
                            <button onClick={() => dispatch(clearSuccessMessage())} className="btn btn-xs btn-circle ml-2">×</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container-fluid px-2 py-3">
                <div className="bg-base-100 p-4 rounded-t-xl shadow-md mb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-base-content">
                                Project Evaluation
                                <div className="inline-flex items-center gap-2 ml-2">
                                    {currentProject && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                        ${currentProject.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                currentProject.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {currentProject.status?.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                    {currentProject && currentProject.isClassPotential && (
                                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 border-2 border-purple-300 rounded-full text-sm font-bold animate-pulse">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15.414 5a1 1 0 11-1.414 1.414L12.293 4.707l-.707-.707A1 1 0 0112 3zm2 5a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2V10a2 2 0 012-2h5z" clipRule="evenodd" />
                                            </svg>
                                            POTENTIAL PROJECT
                                        </span>
                                    )}
                                </div>
                            </h1>
                            <p className="text-base-content/70">Project ID: {projectId}</p>
                        </div>
                        {currentProject && currentProject.title && (
                            <div className="text-right">
                                <h2 className="text-xl font-semibold text-orange-600">{currentProject.title}</h2>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="lg:w-3/5">
                        <div className="tabs mb-1">
                            <button
                                className={`tab tab-lifted ${activeTab === 'basic' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('basic')}
                            >
                                Basic Info
                            </button>
                            <button
                                className={`tab tab-lifted ${activeTab === 'story' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('story')}
                            >
                                Project Story
                            </button>
                            <button
                                className={`tab tab-lifted ${activeTab === 'documents' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                Documents
                            </button>
                            <button
                                className={`tab tab-lifted ${activeTab === 'phases' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('phases')}
                            >
                                Phases
                            </button>
                            <button
                                className={`tab tab-lifted ${activeTab === 'updates' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('updates')}
                            >
                                Updates
                            </button>
                        </div>

                        <div className={`bg-base-100 rounded-b-xl rounded-tr-xl shadow-md p-4 overflow-y-auto ${currentProject &&
                                (currentProject.status === 'REJECTED' || currentProject.status === 'PENDING_APPROVAL') &&
                                selectedEvaluation
                                ? 'h-[calc(100vh-8rem)]'
                                : 'h-[calc(100vh-12rem)]'
                            }`}>
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Main evaluation panel */}
                    <div className="lg:w-2/5 relative">
                        <div
                            className={`bg-base-100 rounded-xl shadow-md p-4 min-h-[600px] flex flex-col transition-all duration-300 ease-in-out ${selectedEvaluation &&
                                    currentProject &&
                                    currentProject.status &&
                                    currentProject.status !== 'REJECTED' &&
                                    currentProject.status !== 'PENDING_APPROVAL'
                                    ? 'transform -translate-x-full opacity-0 absolute inset-0'
                                    : ''
                                }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-semibold">
                                    {currentProject &&
                                        currentProject.status &&
                                        currentProject.status !== 'REJECTED' &&
                                        currentProject.status !== 'PENDING_APPROVAL'
                                        ? 'Evaluation Summary'
                                        : 'Evaluation Criteria'}
                                </h2>
                                {status === 'loading' && !isInitialLoad && (
                                    <div className="badge badge-accent animate-pulse">Loading...</div>
                                )}
                            </div>

                            {currentProject &&
                                currentProject.status &&
                                currentProject.status !== 'REJECTED' &&
                                currentProject.status !== 'PENDING_APPROVAL' ? (
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
                                    <div className="mt-4 flex-grow">
                                        <h3 className="font-semibold mb-2">Component Scores</h3>
                                        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100% - 40px)" }}>
                                            {displayEvaluations.map(evaluation => (
                                                <div
                                                    key={evaluation.id}
                                                    className="p-3 border rounded-lg hover:bg-base-200 cursor-pointer transition-all"
                                                    onClick={() => {
                                                        setSelectedEvaluation(evaluation.id);
                                                        dispatch(getEvaluationItems(evaluation.id));
                                                    }}
                                                >
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{evaluation.componentName || evaluation.typeName}</span>
                                                        <span className="font-medium">{evaluation.actualPoint || 0}/{evaluation.maximumPoint || 0}</span>
                                                    </div>
                                                    {evaluation.comment && (
                                                        <div className="mt-2 text-sm text-gray-600 italic">
                                                            "{evaluation.comment}"
                                                        </div>
                                                    )}
                                                    <div className="mt-2 text-xs text-blue-500">
                                                        Click to view details →
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // IMPROVED SECTION for REJECTED or PENDING_APPROVAL status
                                <div className="flex flex-col flex-grow">
                                    {displayEvaluations.length > 0 ? (
                                        <>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium mb-1">Select Component to Evaluate:</label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={selectedEvaluation || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value ? Number(e.target.value) : null;
                                                        setSelectedEvaluation(val);
                                                        if (val) dispatch(getEvaluationItems(val));
                                                    }}
                                                >
                                                    <option value="">Select a component</option>
                                                    {displayEvaluations.map(evaluation => (
                                                        <option key={evaluation.id} value={evaluation.id}>
                                                            {evaluation.componentName || evaluation.typeName || `Component #${evaluation.id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="text-xs text-blue-500 mt-1">
                                                    {displayEvaluations.length} components available
                                                </div>
                                            </div>

                                            {/* Conditional rendering of evaluation items within the same panel */}
                                            {selectedEvaluation && (
                                                <div className="flex-grow flex flex-col">
                                                    <div className="flex-grow overflow-y-auto pr-1 mb-4" style={{ maxHeight: "360px" }}>
                                                        {evaluationItems.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {evaluationItems.map((item) => (
                                                                    <div key={item.id} className="p-3 border rounded-lg bg-base-200/30 transition-colors">
                                                                        <div className="flex justify-between items-center">
                                                                            <h3 className="font-medium">{item.basicRequirement}</h3>
                                                                            <span className="text-sm opacity-70">Max: {item.maxPoint} points</span>
                                                                        </div>

                                                                        <p className="text-sm opacity-70 my-2">{item.evaluationCriteria}</p>

                                                                        <div className="point-selector mt-2 flex flex-wrap gap-1">
                                                                            {[...Array(Number(item.maxPoint) + 1)].map((_, i) => (
                                                                                <button
                                                                                    key={i}
                                                                                    className={`w-8 h-8 rounded-full ${item.actualPoint === i
                                                                                            ? 'bg-blue-500 text-white'
                                                                                            : 'bg-base-200 hover:bg-base-300'
                                                                                        } transition-colors`}
                                                                                    onClick={() => handleScoreChange(item.id, i)}
                                                                                >
                                                                                    {i}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
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

                                                    {evaluationItems.length > 0 && (
                                                        <>
                                                            <div className="mb-4">
                                                                <label className="block text-sm font-medium mb-1">Comment:</label>
                                                                <textarea
                                                                    className="textarea textarea-bordered w-full"
                                                                    rows="2"
                                                                    value={comment}
                                                                    onChange={(e) => setComment(e.target.value)}
                                                                    placeholder="Add your evaluation comments here..."
                                                                ></textarea>
                                                                <button
                                                                    className="mt-2 btn btn-primary btn-sm"
                                                                    onClick={handleCommentSave}
                                                                >
                                                                    Save Comment
                                                                </button>
                                                            </div>

                                                            {/* Score summary integrated within the panel */}
                                                            <div className="bg-base-200/50 rounded-lg p-3 mt-auto">
                                                                <div className="flex justify-between items-center">
                                                                    <h3 className="font-semibold">Total Score</h3>
                                                                    <span className="text-lg font-bold">{totalPoints} / {maxPoints}</span>
                                                                </div>
                                                                <div className="w-full bg-base-300 rounded-full h-2.5 mt-2">
                                                                    <div
                                                                        className={`${getScoreColor()} h-2.5 rounded-full transition-all duration-500`}
                                                                        style={{ width: `${scorePercentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex justify-end mt-3">
                                                                    <button
                                                                        className="btn btn-success btn-sm"
                                                                        onClick={submitFinalEvaluation}
                                                                        disabled={!areAllEvaluationsScored()}
                                                                    >
                                                                        Submit Final Evaluation
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="alert alert-info mb-3 flex flex-col items-start">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <p>No evaluation components found for this project.</p>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <button
                                                    onClick={handleRetryFetch}
                                                    className="btn btn-xs btn-info"
                                                    disabled={status === 'loading'}
                                                >
                                                    {status === 'loading' ?
                                                        <span className="loading loading-spinner loading-xs"></span> :
                                                        "Retry"}
                                                </button>
                                                <span className="text-xs">Project ID: {projectId}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sliding panel for evaluation details */}
                        <div
                            className={`bg-base-100 rounded-xl shadow-md p-4 min-h-[600px] flex flex-col transition-all duration-300 ease-in-out ${selectedEvaluation &&
                                    currentProject &&
                                    currentProject.status &&
                                    currentProject.status !== 'REJECTED' &&
                                    currentProject.status !== 'PENDING_APPROVAL'
                                    ? 'absolute inset-0 transform translate-x-0'
                                    : 'absolute inset-0 transform translate-x-full opacity-0'
                                }`}
                        >
                            {/* Only render content when selectedEvaluation is set to prevent unnecessary calculations */}
                            {selectedEvaluation &&
                                currentProject &&
                                currentProject.status &&
                                currentProject.status !== 'REJECTED' &&
                                currentProject.status !== 'PENDING_APPROVAL' && (
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
                                                Back
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
                                )}
                        </div>

                        {/* For non-evaluation projects, show actions at bottom */}
                        {currentProject && currentProject.status &&
                            currentProject.status !== 'REJECTED' &&
                            currentProject.status !== 'PENDING_APPROVAL' && (
                                <div className="bg-base-100 rounded-xl shadow-md p-4 mt-3">
                                    <div className="flex justify-end">
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => navigate(`/app/project-list`)}
                                        >
                                            Back to Project List
                                        </button>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            <FinalReviewModal
                showFinalReview={showFinalReview}
                setShowFinalReview={setShowFinalReview}
                displayEvaluations={displayEvaluations}
                totalScore={calculateTotalScore()}
                approvalStatus={determineApprovalStatus(calculateTotalScore().percentage)}
                chartData={preparePieChartData(calculateTotalScore())}
                chartOptions={chartOptions}
                approvalMessage={approvalMessage}
                setApprovalMessage={setApprovalMessage}
                handleProjectDecision={handleProjectDecision}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default ProjectScoring;