import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Project detail components
import ProjectDetailsDocumentEvaluation from './EvaluationProjectDocument';
import EvaluationProjectDetailsPhase from './EvaluationProjectPhase';
import ProjectDetailsStory from '../projectmanager/ProjectDetailsStory';
import ProjectDetailsUpdate from '../projectmanager/ProjectDetailsUpdate';
import ProjectDetailsEvaluation from './EvaluationProjectDetails';

// Panel components
import ApprovedProjectPanel from './panels/ApprovedProjectPanel';
import PendingApprovalPanel from './panels/PendingApprovalPanel';
import RejectedProjectPanel from './panels/RejectedProjectPanel';

// Evaluation slice
import {
    getProjectEvaluations,
    getEvaluationItems,
    updateEvaluationComment,
    updateEvaluationGrade,
    clearError,
    clearSuccessMessage,
    getProjectEvaluationsAfter,
    getProjectEvaluationsLastest
} from './components/evalutionProjectSlice';

import { approveProject, rejectProject } from '../projectmanager/components/projectSlice';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import FinalReviewModal from './FinalReviewModal';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectScoring = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const evaluationState = useSelector(state => state.evaluation);

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

    // Tracking calculated scores
    const [totalPoints, setTotalPoints] = useState(0);
    const [maxPoints, setMaxPoints] = useState(0);

    const [showFinalReview, setShowFinalReview] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentProject } = useSelector(state => state.project || { currentProject: null });

    const displayEvaluations = evaluations.length > 0 ? evaluations : manuallyPopulatedEvaluations;

    const areAllEvaluationsScored = useCallback(() => {
        if (!displayEvaluations.length) return false;

        const allEvaluationsHavePoints = displayEvaluations.every(evaluation =>
            evaluation.actualPoint !== null && evaluation.actualPoint !== undefined);

        if (!allEvaluationsHavePoints) return false;

        for (const evaluation of displayEvaluations) {
            const evalItems = evaluationItems.filter(item =>
                item.evaluationId === evaluation.id);

            if (evalItems.length > 0 && evalItems.some(item =>
                item.actualPoint === null || item.actualPoint === undefined)) {
                return false;
            }
        }

        return true;
    }, [displayEvaluations, evaluationItems]);

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
        } else if (percentage >= 30) {
            return {
                status: 'reject',
                message: 'Project requires significant improvements before it can be approved.'
            };
        } else {
            return {
                status: 'reject',
                message: 'Project does not meet minimum quality standards and is rejected and banned.'
            };
        }
    }, []);

    // Fetch data function
    const fetchData = useCallback(async () => {
        if (!projectId) return;

        try {
            let actionResult;

            const useAfterEvaluationStatuses = ['APPROVED', 'FUNDRAISING_COMPLETED', 'SUSPENDED', 'BAN', 'UNDER_REVIEW', 'REJECTED', 'RESUBMIT'];

            if (currentProject && currentProject.status && useAfterEvaluationStatuses.includes(currentProject.status)) {
                actionResult = await dispatch(getProjectEvaluationsLastest(parseInt(projectId)));
            } else {
                actionResult = await dispatch(getProjectEvaluations(parseInt(projectId)));
            }

            if (actionResult.payload && Array.isArray(actionResult.payload)) {
                const formattedEvaluations = actionResult.payload.map(evaluation => ({
                    ...evaluation,
                    componentName: evaluation.typeName
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ')
                }));

                setManuallyPopulatedEvaluations(formattedEvaluations);

                // Calculate totals
                const totalActual = formattedEvaluations.reduce((sum, evaluation) =>
                    sum + Number(evaluation.actualPoint || 0), 0);
                const totalMaximum = formattedEvaluations.reduce((sum, evaluation) =>
                    sum + Number(evaluation.maximumPoint || 0), 0);

                setTotalPoints(totalActual);
                setMaxPoints(totalMaximum);
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

    const submitFinalEvaluation = useCallback(async () => {
        try {
            await fetchData();

            setTimeout(() => {
                setShowFinalReview(true);
            }, 100);
        } catch (error) {
            console.error("Error updating final scores:", error);
        }
    }, [fetchData]);

    const handleProjectDecision = useCallback(async (decision) => {
        try {
            setIsSubmitting(true);

            const projectIdNumber = parseInt(projectId, 10);

            if (decision === 'approve') {
                await dispatch(approveProject(projectIdNumber)).unwrap();
                dispatch({
                    type: 'global/setNotification',
                    payload: {
                        type: 'success',
                        message: 'Project has been approved successfully!'
                    }
                });
            } else {
                await dispatch(rejectProject({
                    projectId: projectIdNumber,
                    reason: approvalMessage || 'Project does not meet requirements'
                })).unwrap();

                dispatch({
                    type: 'global/setNotification',
                    payload: {
                        type: 'info',
                        message: 'Project has been rejected.'
                    }
                });
            }

            setShowFinalReview(false);

            fetchData();

            dispatch({
                type: 'global/setNotification',
                payload: {
                    type: 'success',
                    message: `Project ${decision === 'approve' ? 'approval' : 'rejection'} processed successfully`
                }
            });
        } catch (error) {
            console.error('Error during project decision:', error);
            console.log('Project ID:', projectId);
            console.log('Decision:', decision);
            console.log('Rejection reason:', approvalMessage);

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
    }, [dispatch, projectId, approvalMessage, fetchData]);

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
        if (currentProject && currentProject.status && !isInitialLoad) {
            fetchData();
        }
    }, [currentProject, fetchData, isInitialLoad]);

    useEffect(() => {
        // Cleanup success messages when component unmounts
        return () => {
            dispatch(clearSuccessMessage());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedEvaluation) {
            dispatch(getEvaluationItems(selectedEvaluation));

            const currentEval = evaluations?.find(evaluation => evaluation.id === selectedEvaluation) ||
                manuallyPopulatedEvaluations?.find(evaluation => evaluation.id === selectedEvaluation);

            if (currentEval && currentEval.comment) {
                setComment(currentEval.comment);
            } else {
                setComment('');
            }
        }
    }, [dispatch, selectedEvaluation, evaluations, manuallyPopulatedEvaluations]);

    // Update evaluation items when they change
    useEffect(() => {
        if (selectedEvaluation) {
            const currentEvalItems = evaluationItems.filter(item =>
                item.evaluationId === selectedEvaluation);

            const compTotal = currentEvalItems.reduce((sum, item) =>
                sum + (item.actualPoint || 0), 0);
            const compMax = currentEvalItems.reduce((sum, item) =>
                sum + (item.maxPoint || 0), 0);

            setTotalPoints(compTotal);
            setMaxPoints(compMax);
        }
    }, [evaluationItems, selectedEvaluation]);

    const handleScoreChange = (itemId, point) => {
        dispatch(updateEvaluationGrade({ itemId, point }))
            .then(() => {
                setTimeout(() => {
                    dispatch(clearSuccessMessage());
                }, 2000);

                const updatedEvaluation = evaluationItems.find(item => item.id === itemId);
                if (updatedEvaluation) {
                    const updatedComponentId = updatedEvaluation.evaluationId;

                    const componentItems = evaluationItems.filter(item =>
                        item.evaluationId === updatedComponentId);

                    const totalActual = componentItems.reduce((sum, item) =>
                        sum + (Number(item.actualPoint) || 0), 0);
                    const totalMaximum = componentItems.reduce((sum, item) =>
                        sum + (Number(item.maxPoint) || 0), 0);

                    const evaluationIndex = displayEvaluations.findIndex(evaluation =>
                        evaluation.id === updatedComponentId);

                    if (evaluationIndex !== -1) {
                        const updatedEvaluations = [...displayEvaluations];
                        updatedEvaluations[evaluationIndex] = {
                            ...updatedEvaluations[evaluationIndex],
                            actualPoint: totalActual,
                            maximumPoint: totalMaximum
                        };

                        if (manuallyPopulatedEvaluations.length > 0) {
                            setManuallyPopulatedEvaluations(updatedEvaluations);
                        }

                        const allComponentsTotalActual = updatedEvaluations.reduce((sum, evaluation) =>
                            sum + Number(evaluation.actualPoint || 0), 0);
                        const allComponentsTotalMaximum = updatedEvaluations.reduce((sum, evaluation) =>
                            sum + Number(evaluation.maximumPoint || 0), 0);

                        setTotalPoints(selectedEvaluation === updatedComponentId ? totalActual : allComponentsTotalActual);
                        setMaxPoints(selectedEvaluation === updatedComponentId ? totalMaximum : allComponentsTotalMaximum);
                    }
                }
            })
            .catch(error => {
                console.error("Error updating score:", error);
            });
    };

    const handleCommentSave = () => {
        if (selectedEvaluation) {
            dispatch(updateEvaluationComment({ id: selectedEvaluation, comment }))
                .then(() => {
                    // Update the comment in the local state too
                    const evaluationIndex = displayEvaluations.findIndex(evaluation =>
                        evaluation.id === selectedEvaluation);

                    if (evaluationIndex !== -1) {
                        const updatedEvaluations = [...displayEvaluations];
                        updatedEvaluations[evaluationIndex] = {
                            ...updatedEvaluations[evaluationIndex],
                            comment: comment
                        };

                        if (manuallyPopulatedEvaluations.length > 0) {
                            setManuallyPopulatedEvaluations(updatedEvaluations);
                        }
                    }
                })
                .catch(error => {
                    console.error("Error saving comment:", error);
                });
        }
    };

    const handleRetryFetch = () => {
        if (error) dispatch(clearError());
        setRetryCount(0);
        fetchData();
    };

    const shouldShowUpdatesTab = useCallback(() => {
        if (!currentProject || !currentProject.status) return false;

        const restrictedStatuses = ['REJECTED', 'RESUBMIT', 'PENDING_APPROVAL'];
        return !restrictedStatuses.includes(currentProject.status);
    }, [currentProject]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic': return <ProjectDetailsEvaluation projectId={projectId} evaluationMode={true} />;
            case 'story': return <ProjectDetailsStory projectId={projectId} evaluationMode={true} />;
            case 'documents': return <ProjectDetailsDocumentEvaluation projectId={projectId} evaluationMode={true} />;
            case 'phases': return <EvaluationProjectDetailsPhase projectId={projectId} evaluationMode={true} />;
            case 'updates':
                return shouldShowUpdatesTab() ?
                    <ProjectDetailsUpdate projectId={projectId} evaluationMode={true} /> :
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-700">Updates will be available after the project is approved.</p>
                    </div>;
            default: return <ProjectDetailsEvaluation projectId={projectId} evaluationMode={true} />;
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

    // Determine which panel to show based on project status
    const renderEvaluationPanel = () => {
        if (!currentProject || !currentProject.status) {
            return (
                <div className="alert alert-info">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Loading project information...</span>
                    </div>
                </div>
            );
        }

        switch (currentProject.status) {
            case 'PENDING_APPROVAL':
                return (
                    <PendingApprovalPanel
                        displayEvaluations={displayEvaluations}
                        evaluationItems={evaluationItems}
                        selectedEvaluation={selectedEvaluation}
                        setSelectedEvaluation={setSelectedEvaluation}
                        comment={comment}
                        setComment={setComment}
                        handleScoreChange={handleScoreChange}
                        handleCommentSave={handleCommentSave}
                        submitFinalEvaluation={submitFinalEvaluation}
                        areAllEvaluationsScored={areAllEvaluationsScored}
                        totalPoints={totalPoints}
                        maxPoints={maxPoints}
                        dispatch={dispatch}
                        getEvaluationItems={getEvaluationItems}
                    />
                );
            case 'REJECTED':
                return (
                    <RejectedProjectPanel
                        displayEvaluations={displayEvaluations}
                        evaluationItems={evaluationItems}
                        selectedEvaluation={selectedEvaluation}
                        setSelectedEvaluation={setSelectedEvaluation}
                        comment={comment}
                        dispatch={dispatch}
                        getEvaluationItems={getEvaluationItems}
                        currentProject={currentProject}
                    />
                );
            default:
                return (
                    <ApprovedProjectPanel
                        displayEvaluations={displayEvaluations}
                        evaluationItems={evaluationItems}
                        selectedEvaluation={selectedEvaluation}
                        setSelectedEvaluation={setSelectedEvaluation}
                        comment={comment}
                        getEvaluationItems={getEvaluationItems}
                        dispatch={dispatch}
                    />
                );
        }
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
            {/* Error Notification */}
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

            {/* Success Notification */}
            {successMessage && (
                <div className="toast toast-top toast-center z-50">
                    <div className="alert bg-green-600 text-white border-none shadow-lg">
                        <div>
                            <span>{successMessage}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="container-fluid px-2 py-3">
                {/* Header */}
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
                                                    currentProject.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
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

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-3 h-[calc(100vh-140px)] overflow-hidden">
                    {/* Left side - Project Details */}
                    <div className="lg:w-3/5 flex flex-col h-full">
                        <div className="tabs mb-1">
                            <button
                                className={`tab tab-lifted flex items-center ${activeTab === 'basic' ? 'tab-active text-blue-600 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                                onClick={() => setActiveTab('basic')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${activeTab === 'basic' ? 'text-blue-600' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Basic Info
                            </button>
                            <button
                                className={`tab tab-lifted flex items-center ${activeTab === 'story' ? 'tab-active text-orange-600 border-orange-600' : 'text-gray-600 hover:text-orange-500'}`}
                                onClick={() => setActiveTab('story')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${activeTab === 'story' ? 'text-orange-600' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Project Story
                            </button>
                            <button
                                className={`tab tab-lifted flex items-center ${activeTab === 'documents' ? 'tab-active text-green-600 border-green-600' : 'text-gray-600 hover:text-green-500'}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${activeTab === 'documents' ? 'text-green-600' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                Documents
                            </button>
                            <button
                                className={`tab tab-lifted flex items-center ${activeTab === 'phases' ? 'tab-active text-purple-600 border-purple-600' : 'text-gray-600 hover:text-purple-500'}`}
                                onClick={() => setActiveTab('phases')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${activeTab === 'phases' ? 'text-purple-600' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                </svg>
                                Phases
                            </button>
                            {shouldShowUpdatesTab() && (
                                <button
                                    className={`tab tab-lifted flex items-center ${activeTab === 'updates' ? 'tab-active text-red-600 border-red-600' : 'text-gray-600 hover:text-red-500'}`}
                                    onClick={() => setActiveTab('updates')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${activeTab === 'updates' ? 'text-red-600' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Updates
                                </button>
                            )}
                        </div>

                        <div className="bg-base-100 rounded-b-xl rounded-tr-xl shadow-md p-4 overflow-y-auto flex-grow">
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Right side - Evaluation Panel */}
                    <div className="lg:w-2/5 h-full flex flex-col">
                        {status === 'loading' && !isInitialLoad ? (
                            <div className="bg-base-100 rounded-xl shadow-md p-6 flex items-center justify-center h-full">
                                <div className="loading loading-spinner loading-lg"></div>
                                <span className="ml-4 text-lg">Loading evaluation data...</span>
                            </div>
                        ) : (
                            renderEvaluationPanel()
                        )}
                    </div>
                </div>
            </div>

            {/* Final Review Modal */}
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