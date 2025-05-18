import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPhaseByProjectId, getMilestoneByPhaseId, getPhaseDocumentByPhaseId } from '../../features/projectmanager/components/projectSlice';
import { getPhaseInvesment, getProjectPaymentInformationByProjectId, payoutCompletedPhase, refundBannedProjectByPhaseId } from './components/evalutionProjectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';
import {
    DocumentTextIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { DownloadIcon, RefreshCcwDotIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const EvaluationProjectDetailsPhase = ({
    getClassName,
    evaluationMode = false,
    updatePhaseDocuments,
    setCurrentExpandedPhase
}) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();

    const { phases, milestones, status, error } = useSelector(state => state.project);
    const { evaluations, phaseInvestments = [], status: evaluationStatus } = useSelector(state => state.evaluation);

    // States
    const [showModal, setShowModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [expandedPhase, setExpandedPhase] = useState(null);
    const [viewMode, setViewMode] = useState('compact');
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [phaseDocuments, setPhaseDocuments] = useState({});
    const [documentLoading, setDocumentLoading] = useState({});
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [activePhaseTab, setActivePhaseTab] = useState('overview');

    // Investment table states
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
    const [isRefunding, setIsRefunding] = useState(false);
    const { currentProject } = useSelector(state => state.project || { currentProject: null });

    const [isProcessingPayout, setIsProcessingPayout] = useState({});
    const [paymentInfo, setPaymentInfo] = useState(null);

    useEffect(() => {
        if (projectId) {
            dispatch(getPhaseByProjectId(projectId));
        }
    }, [dispatch, projectId]);

    useEffect(() => {
        if (phases?.length > 0) {
            // Load all milestone data for all phases at once
            const phasePromises = phases.map(phase =>
                dispatch(getMilestoneByPhaseId(phase.id))
            );

            // After all phase data is loaded
            Promise.all(phasePromises).then(() => {
                // Only auto-expand the first phase on initial load
                if (!initialLoadComplete && !expandedPhase) {
                    setExpandedPhase(phases[0].id);
                    setInitialLoadComplete(true);
                }
            });
        }
    }, [dispatch, phases, expandedPhase, initialLoadComplete]);

    // Load phase documents when a phase is expanded
    useEffect(() => {
        if (expandedPhase && !phaseDocuments[expandedPhase]) {
            setDocumentLoading(prev => ({ ...prev, [expandedPhase]: true }));

            dispatch(getPhaseDocumentByPhaseId(expandedPhase))
                .unwrap()
                .then(data => {
                    setPhaseDocuments(prev => ({
                        ...prev,
                        [expandedPhase]: Array.isArray(data) ? data : [data]
                    }));
                })
                .catch(error => {
                    console.error('Failed to load phase documents:', error);
                })
                .finally(() => {
                    setDocumentLoading(prev => ({ ...prev, [expandedPhase]: false }));
                });
        }

        // Reset active tab when changing phases
        setActivePhaseTab('overview');
    }, [expandedPhase, phaseDocuments, dispatch]);

    useEffect(() => {
        if (expandedPhase && !phaseDocuments[expandedPhase]) {
            setDocumentLoading(prev => ({ ...prev, [expandedPhase]: true }));

            dispatch(getPhaseDocumentByPhaseId(expandedPhase))
                .unwrap()
                .then(data => {
                    const processedData = Array.isArray(data) ? data : [data];
                    setPhaseDocuments(prev => ({
                        ...prev,
                        [expandedPhase]: processedData
                    }));

                    // Inform parent component about documents
                    if (updatePhaseDocuments) {
                        updatePhaseDocuments(expandedPhase, processedData);
                    }
                })
                .catch(error => {
                    console.error('Failed to load phase documents:', error);
                })
                .finally(() => {
                    setDocumentLoading(prev => ({ ...prev, [expandedPhase]: false }));
                });
        }

        setActivePhaseTab('overview');

        // Inform parent component about expanded phase
        if (setCurrentExpandedPhase) {
            setCurrentExpandedPhase(expandedPhase);
        }
    }, [expandedPhase, phaseDocuments, dispatch, updatePhaseDocuments, setCurrentExpandedPhase]);

    // Load phase investments when tab is changed to investments
    useEffect(() => {
        if (expandedPhase && activePhaseTab === 'investments' && !evaluations?.length) {
            loadPhaseInvestments();
        }
    }, [expandedPhase, activePhaseTab]);

    useEffect(() => {
        if (projectId) {
            loadPaymentInformation();
        }
    }, [projectId]);

    const loadPhaseInvestments = () => {
        if (!expandedPhase) return;

        console.log("Loading phase investments for phase:", expandedPhase);
        setIsLoadingInvestments(true);
        dispatch(getPhaseInvesment({
            phaseId: expandedPhase,
            query: searchQuery,
            page: currentPage,
            size: pageSize,
            sortField,
            sortOrder
        }))
            .unwrap()
            .then((result) => {
                console.log("Investment loading result:", result);
                setIsLoadingInvestments(false);
            })
            .catch(error => {
                console.error('Failed to load phase investments:', error);
                setIsLoadingInvestments(false);
            });
    };

    const loadPaymentInformation = async () => {
        try {
            const result = await dispatch(getProjectPaymentInformationByProjectId(projectId)).unwrap();
            setPaymentInfo(result.data);
        } catch (error) {
            console.error("Error loading payment information:", error);
        }
    };

    const handleRefundProject = async (phaseId) => {
        if (!phaseId) {
            toast.error("Phase ID is required for refunding");
            return;
        }

        try {
            setIsRefunding(true);
            await dispatch(refundBannedProjectByPhaseId({ phaseId })).unwrap();
            toast.success("Refunds processed successfully");
            loadPhaseInvestments();
        } catch (error) {
            toast.error(error.error || "Failed to process refunds");
            console.error("Refund error:", error);
        } finally {
            setIsRefunding(false);
        }
    };

    const handlePayout = async (phaseId) => {
        // Check conditions first
        const phase = phases.find(p => p.id === phaseId);
        const phaseDocsList = phaseDocuments[phaseId] || [];

        if (!phase) {
            toast.error("Phase information not found");
            return;
        }

        if (!phaseDocsList.length) {
            toast.warning("All required phase documents must be provided before payout");
            return;
        }

        if (paymentInfo && paymentInfo.pendingBalance > 0) {
            toast.warning("Cannot process payout while there's pending balance");
            return;
        }

        try {
            setIsProcessingPayout(prev => ({ ...prev, [phaseId]: true }));
            await dispatch(payoutCompletedPhase({ phaseId })).unwrap();
            toast.success("Phase payout processed successfully");
            dispatch(getPhaseByProjectId(projectId));
            loadPaymentInformation();
        } catch (error) {
            toast.error(error?.error || "Failed to process payout");
            console.error("Payout error:", error);
        } finally {
            setIsProcessingPayout(prev => ({ ...prev, [phaseId]: false }));
        }
    };

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }

        setTimeout(() => {
            loadPhaseInvestments();
        }, 0);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadPhaseInvestments();
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleMilestoneClick = (milestone) => {
        setSelectedMilestone(milestone);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMilestone(null);
    };

    const togglePhaseExpansion = (phaseId) => {
        setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
    };

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        setShowDocumentModal(true);
    };

    const closeDocumentModal = () => {
        setShowDocumentModal(false);
        setSelectedDocument(null);
    };

    const getDocumentTypeLabel = (type) => {
        switch (type) {
            case 'PROGRESS_REPORT': return 'Progress Report';
            case 'FUND_USAGE_REPORT': return 'Fund Usage Report';
            default: return type;
        }
    };

    const getDocumentFileName = (url) => {
        if (!url) return 'Document';
        const parts = url.split('/');
        return parts[parts.length - 1] || 'Document';
    };

    const downloadDocument = (url, fileName) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || getDocumentFileName(url);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getInvestmentStatusColor = (status) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (status === 'loading') return <Loading />;
    if (status === 'failed') return <div className="alert alert-error">{error}</div>;
    if (!phases || phases.length === 0) {
        return <p className="text-center text-gray-500">No phases available for this project.</p>;
    }

    // Calculate pagination information
    const totalPages = Math.ceil((phaseInvestments?.length || 0) / pageSize);

    return (
        <div className={`${getClassName?.("pills-phase")} p-4 bg-white shadow-md rounded-lg`} id="pills-phase" role="tabpanel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Project Timeline & Milestones</h2>
                <div className="flex items-center space-x-2">
                    <button
                        className={`px-3 py-1.5 rounded-l-md text-sm font-medium ${viewMode === 'compact' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => setViewMode('compact')}
                    >
                        Compact
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-r-md text-sm font-medium ${viewMode === 'detailed' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => setViewMode('detailed')}
                    >
                        Detailed
                    </button>
                </div>
            </div>

            {/* Phases Cards */}
            <div className="space-y-6">
                {phases.map((phase, phaseIndex) => {
                    const phaseProgress = phase.targetAmount > 0
                        ? (phase.raiseAmount / phase.targetAmount) * 100
                        : 0;
                    const progressDisplay = `${Math.round(phaseProgress)}%`;
                    const phaseMilestones = milestones[phase.id] || [];
                    const isExpanded = expandedPhase === phase.id;
                    const phaseHasDocuments = phaseDocuments[phase.id]?.length > 0;
                    const isDocumentLoading = documentLoading[phase.id];

                    return (
                        <motion.div
                            key={phase.id}
                            className={`border rounded-lg overflow-hidden ${isExpanded ? 'shadow-lg border-teal-300' : 'shadow-sm hover:shadow-md border-gray-200'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: phaseIndex * 0.1 }}
                        >
                            {/* Phase Header - Always visible */}
                            <div
                                className={`p-4 cursor-pointer ${isExpanded ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                                onClick={() => togglePhaseExpansion(phase.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full ${phase.status === 'PROCESS' ? 'bg-teal-100 text-teal-700' :
                                        phase.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            'bg-amber-100 text-amber-700'} flex items-center justify-center font-bold`}>
                                        {phaseIndex + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-800">Phase {phase.phaseNumber}</h3>

                                            {/* Payout Button - Only show for COMPLETED phases */}
                                            {phase.status === 'COMPLETED' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePayout(phase.id);
                                                    }}
                                                    disabled={isProcessingPayout[phase.id] || !phaseDocuments[phase.id]?.length || (paymentInfo && paymentInfo.pendingBalance > 0)}
                                                    className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ml-2 ${isProcessingPayout[phase.id] ?
                                                        'bg-gray-200 text-gray-500 cursor-not-allowed' :
                                                        (!phaseDocuments[phase.id]?.length || (paymentInfo && paymentInfo.pendingBalance > 0)) ?
                                                            'bg-yellow-100 text-yellow-700 cursor-not-allowed' :
                                                            'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                    title={
                                                        !phaseDocuments[phase.id]?.length ?
                                                            "All required phase documents must be provided before payout" :
                                                            (paymentInfo && paymentInfo.pendingBalance > 0) ?
                                                                "Cannot process payout while there's pending balance" :
                                                                "Process payout for this completed phase"
                                                    }
                                                >
                                                    {isProcessingPayout[phase.id] ? (
                                                        <>
                                                            <div className="w-3 h-3 border-t-2 border-green-700 rounded-full animate-spin mr-1"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                            Payout
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full ${phaseProgress >= 100 ? 'bg-teal-500' :
                                            phaseProgress >= 70 ? 'bg-teal-500' :
                                                phaseProgress >= 30 ? 'bg-amber-500' :
                                                    'bg-orange-500'
                                            }`}
                                        style={{ width: `${Math.min(100, phaseProgress)}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 flex justify-between text-xs text-gray-500">
                                    <span>{progressDisplay}</span>
                                    <span>{phase.totalInvestors} investors</span>
                                </div>
                            </div>

                            {/* Phase Details - Expandable content */}
                            {isExpanded && (
                                <motion.div
                                    className="border-t border-gray-200 bg-white"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Tabs for Phase Details */}
                                    <div className="border-b border-gray-200">
                                        <nav className="flex space-x-2 px-4">
                                            <button
                                                className={`px-4 py-3 text-sm font-medium border-b-2 ${activePhaseTab === 'overview'
                                                    ? 'border-teal-500 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setActivePhaseTab('overview')}
                                            >
                                                Overview
                                            </button>
                                            <button
                                                className={`px-4 py-3 text-sm font-medium border-b-2 ${activePhaseTab === 'documents'
                                                    ? 'border-teal-500 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setActivePhaseTab('documents')}
                                            >
                                                Documents
                                            </button>
                                            <button
                                                className={`px-4 py-3 text-sm font-medium border-b-2 ${activePhaseTab === 'milestones'
                                                    ? 'border-teal-500 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setActivePhaseTab('milestones')}
                                            >
                                                Milestones
                                            </button>
                                            <button
                                                className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${activePhaseTab === 'investments'
                                                    ? 'border-teal-500 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setActivePhaseTab('investments')}
                                            >
                                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                Investments
                                            </button>
                                        </nav>
                                    </div>

                                    <div className="p-4">
                                        {/* Overview Tab */}
                                        {activePhaseTab === 'overview' && (
                                            <div>
                                                {/* Phase details grid for larger screens */}
                                                <div className="grid md:grid-cols-4 gap-4 mb-5">
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Timeline</span>
                                                        <span className="font-medium">{new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Target Amount</span>
                                                        <span className="font-medium">${phase.targetAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Raised Amount</span>
                                                        <span className="font-medium text-teal-600">${phase.raiseAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 block">Investors</span>
                                                        <span className="font-medium">{phase.totalInvestors}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                                                    <h4 className="font-medium text-lg mb-3">Phase Summary</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="border rounded-lg bg-white p-4">
                                                            <h5 className="text-sm font-medium text-gray-500 mb-2">Progress</h5>
                                                            <div className="flex items-end space-x-2">
                                                                <span className="text-2xl font-bold text-teal-600">{Math.round(phaseProgress)}%</span>
                                                                <span className="text-gray-500 text-sm">complete</span>
                                                            </div>
                                                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                                <div
                                                                    className={`h-2.5 rounded-full ${phaseProgress >= 100 ? 'bg-teal-500' :
                                                                        phaseProgress >= 70 ? 'bg-teal-500' :
                                                                            phaseProgress >= 30 ? 'bg-amber-500' :
                                                                                'bg-orange-500'
                                                                        }`}
                                                                    style={{ width: `${Math.min(100, phaseProgress)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="border rounded-lg bg-white p-4">
                                                            <h5 className="text-sm font-medium text-gray-500 mb-2">Funding</h5>
                                                            <div className="flex items-end space-x-2">
                                                                <span className="text-2xl font-bold text-blue-600">${phase.raiseAmount.toLocaleString()}</span>
                                                                <span className="text-gray-500 text-sm">of ${phase.targetAmount.toLocaleString()}</span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                From {phase.totalInvestors} investors
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Documents Tab */}
                                        {activePhaseTab === 'documents' && (
                                            <div className="mb-6">
                                                <h4 className="font-medium text-lg mb-3 flex items-center">
                                                    <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                    Phase Documents
                                                </h4>

                                                {isDocumentLoading ? (
                                                    <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                                                        <span className="text-gray-600">Loading documents...</span>
                                                    </div>
                                                ) : phaseHasDocuments ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {phaseDocuments[phase.id].map((document, idx) => (
                                                            <motion.div
                                                                key={document.id || idx}
                                                                className="border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all flex flex-col"
                                                                whileHover={{ y: -2 }}
                                                            >
                                                                <div className="flex items-start mb-2">
                                                                    <DocumentTextIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mr-2" />
                                                                    <div>
                                                                        <h5 className="font-medium text-gray-800">
                                                                            {getDocumentTypeLabel(document.type)}
                                                                        </h5>
                                                                        <p className="text-xs text-gray-500">
                                                                            Phase {document.phaseNumber}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {document.documentDescription && (
                                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                        {document.documentDescription}
                                                                    </p>
                                                                )}

                                                                <div className="mt-auto flex justify-between items-center pt-2">
                                                                    <button
                                                                        onClick={() => handleDocumentClick(document)}
                                                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                                    >
                                                                        <InformationCircleIcon className="w-4 h-4 mr-1" />
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={() => downloadDocument(document.documentUrl, getDocumentFileName(document.documentUrl))}
                                                                        className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
                                                                    >
                                                                        <DownloadIcon className="w-4 h-4 mr-1" />
                                                                        Download
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                                                        No documents available for this phase.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Milestones Tab */}
                                        {activePhaseTab === 'milestones' && (
                                            <div>
                                                <h4 className="font-medium text-lg mb-3 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    Milestones {phaseMilestones.length > 0 ? `(${phaseMilestones.length})` : ''}
                                                </h4>

                                                {phaseMilestones.length > 0 ? (
                                                    viewMode === 'compact' ? (
                                                        // Compact view - Grid layout for milestones
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {phaseMilestones.map((milestone) => (
                                                                <motion.div
                                                                    key={milestone.id}
                                                                    className="border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-teal-300 transition-all"
                                                                    onClick={() => handleMilestoneClick(milestone)}
                                                                    whileHover={{ y: -2 }}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <h5 className="font-medium text-gray-800 line-clamp-1">{milestone.title}</h5>
                                                                        <span className="text-orange-600 font-medium text-sm">${milestone.price.toLocaleString()}</span>
                                                                    </div>
                                                                    {milestone.description && (
                                                                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                                            {milestone.description}
                                                                        </p>
                                                                    )}
                                                                    {milestone.items && (
                                                                        <div className="mt-2 flex items-center text-xs text-gray-500">
                                                                            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                                                            </svg>
                                                                            {milestone.items.length} rewards
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        // Detailed view - List layout for milestones with more details
                                                        <div className="space-y-4">
                                                            {phaseMilestones.map((milestone) => (
                                                                <motion.div
                                                                    key={milestone.id}
                                                                    className="border rounded-lg overflow-hidden hover:shadow-md cursor-pointer"
                                                                    onClick={() => handleMilestoneClick(milestone)}
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                >
                                                                    <div className="flex flex-col sm:flex-row">
                                                                        {milestone.items && milestone.items[0] && milestone.items[0].imageUrl && (
                                                                            <div className="w-full sm:w-36 h-32 sm:h-auto flex-shrink-0">
                                                                                <img
                                                                                    src={milestone.items[0].imageUrl}
                                                                                    alt={milestone.title}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="p-4 flex-grow">
                                                                            <div className="flex justify-between items-start">
                                                                                <h5 className="font-medium text-gray-800">{milestone.title}</h5>
                                                                                <span className="ml-2 text-orange-600 font-semibold">${milestone.price.toLocaleString()}</span>
                                                                            </div>

                                                                            {milestone.description && (
                                                                                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                                                                                    {milestone.description}
                                                                                </p>
                                                                            )}

                                                                            {milestone.items && (
                                                                                <div className="mt-3 flex items-center text-sm">
                                                                                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-medium">
                                                                                        {milestone.items.length} rewards
                                                                                    </span>
                                                                                    <span className="text-orange-500 ml-auto text-xs">View details →</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No milestones available for this phase.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Investments Tab */}
                                        {activePhaseTab === 'investments' && (
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-lg flex items-center">
                                                        <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600" />
                                                        Phase Investments
                                                    </h4>

                                                    {currentProject && currentProject.status === 'BAN' && (
                                                        <button
                                                            onClick={() => handleRefundProject(expandedPhase)}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                                                            disabled={isRefunding}
                                                        >
                                                            {isRefunding ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <RefreshCcwDotIcon className="w-4 h-4 mr-2" />
                                                                    Refund Investors
                                                                </>
                                                            )}
                                                        </button>
                                                    )}

                                                    <form onSubmit={handleSearchSubmit} className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Search investor..."
                                                            className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                            value={searchQuery}
                                                            onChange={handleSearchChange}
                                                        />
                                                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
                                                        <button
                                                            type="submit"
                                                            className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 hidden sm:inline-block"
                                                        >
                                                            Search
                                                        </button>
                                                    </form>
                                                </div>

                                                {isLoadingInvestments ? (
                                                    <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                                        <span className="text-gray-600">Loading investments...</span>
                                                    </div>
                                                ) : phaseInvestments?.length > 0 ? (
                                                    <div className="overflow-x-auto border rounded-lg">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                                        onClick={() => handleSort('id')}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            ID
                                                                            {sortField === 'id' && (
                                                                                sortOrder === 'asc' ?
                                                                                    <ChevronUpIcon className="w-4 h-4 ml-1" /> :
                                                                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                                            )}
                                                                        </div>
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                                        onClick={() => handleSort('investorName')}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            Investor
                                                                            {sortField === 'investorName' && (
                                                                                sortOrder === 'asc' ?
                                                                                    <ChevronUpIcon className="w-4 h-4 ml-1" /> :
                                                                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                                            )}
                                                                        </div>
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                                        onClick={() => handleSort('amount')}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            Amount
                                                                            {sortField === 'amount' && (
                                                                                sortOrder === 'asc' ?
                                                                                    <ChevronUpIcon className="w-4 h-4 ml-1" /> :
                                                                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                                            )}
                                                                        </div>
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                                        onClick={() => handleSort('milestoneName')}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            Milestone
                                                                            {sortField === 'milestoneName' && (
                                                                                sortOrder === 'asc' ?
                                                                                    <ChevronUpIcon className="w-4 h-4 ml-1" /> :
                                                                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                                            )}
                                                                        </div>
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                                        onClick={() => handleSort('status')}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            Status
                                                                            {sortField === 'status' && (
                                                                                sortOrder === 'asc' ?
                                                                                    <ChevronUpIcon className="w-4 h-4 ml-1" /> :
                                                                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                                                            )}
                                                                        </div>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {phaseInvestments.map((investment) => (
                                                                    <tr key={investment.id} className="hover:bg-gray-50">
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                                            #{investment.id}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                                            <div className="flex items-center">
                                                                                <UserCircleIcon className="w-6 h-6 text-gray-400 mr-2" />
                                                                                <div className="text-sm font-medium text-gray-800">
                                                                                    {investment.investorName || 'Unknown'}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                                            ${investment.amount?.toLocaleString() || '0'}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                                            {investment.milestoneName || 'General Support'}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                                            <span className={`px-2 py-1 text-xs rounded-full ${getInvestmentStatusColor(investment.status)}`}>
                                                                                {investment.status || 'Unknown'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                                                        <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                        <p className="text-gray-500">No investment records found for this phase.</p>
                                                    </div>
                                                )}

                                                {/* Pagination */}
                                                {phaseInvestments?.length > 0 && (
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="text-sm text-gray-500">
                                                            Showing {Math.min(currentPage * pageSize + 1, phaseInvestments.length)} to {Math.min((currentPage + 1) * pageSize, phaseInvestments.length)} of {phaseInvestments.length} entries
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                                                disabled={currentPage === 0}
                                                                className={`px-3 py-1 text-sm rounded ${currentPage === 0
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                Previous
                                                            </button>
                                                            {[...Array(totalPages)].map((_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handlePageChange(idx)}
                                                                    className={`px-3 py-1 text-sm rounded ${currentPage === idx
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    {idx + 1}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                                                disabled={currentPage >= totalPages - 1}
                                                                className={`px-3 py-1 text-sm rounded ${currentPage >= totalPages - 1
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Milestone Details Modal */}
            {showModal && selectedMilestone && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <motion.div
                        className="bg-white rounded-lg w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Milestone Details</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-5 overflow-y-auto flex-grow">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMilestone.title}</h2>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                        ${selectedMilestone.price.toLocaleString()}
                                    </div>

                                    <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                                        Phase {phases.find(p => p.id === selectedMilestone.phaseId)?.phaseNumber || ''}
                                    </div>
                                </div>

                                {selectedMilestone.description && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">Description</h4>
                                        <p className="text-gray-600">{selectedMilestone.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Rewards/Items Section */}
                            {selectedMilestone.items && selectedMilestone.items.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                                            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                                        </svg>
                                        Rewards ({selectedMilestone.items.length})
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedMilestone.items.map((item) => (
                                            <div key={item.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                                                {item.imageUrl && (
                                                    <div className="h-40 overflow-hidden">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-3">
                                                    <h5 className="text-gray-800 font-medium">{item.name}</h5>
                                                    <div className="mt-1 flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                                                        {item.price && (
                                                            <span className="text-sm font-medium text-orange-600">${item.price.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="mt-2 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Milestones in the same phase */}
                            {milestones[selectedMilestone.phaseId]?.length > 1 && (
                                <div className="mt-8 pt-4 border-t border-gray-200">
                                    <h4 className="text-lg font-medium text-gray-800 mb-3">Other Milestones in this Phase</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {milestones[selectedMilestone.phaseId]
                                            .filter(m => m.id !== selectedMilestone.id)
                                            .map((milestone) => (
                                                <div
                                                    key={milestone.id}
                                                    className="border rounded-md p-3 cursor-pointer hover:bg-gray-50 hover:border-teal-300 transition-all flex justify-between items-center"
                                                    onClick={() => handleMilestoneClick(milestone)}
                                                >
                                                    <span className="font-medium text-gray-700">{milestone.title}</span>
                                                    <span className="text-sm text-orange-600">${milestone.price.toLocaleString()}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t bg-gray-50 sticky bottom-0">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-md text-white font-medium transition-colors w-full sm:w-auto"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Document Details Modal */}
            {showDocumentModal && selectedDocument && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <motion.div
                        className="bg-white rounded-lg w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Document Details</h3>
                            <button
                                onClick={closeDocumentModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 overflow-y-auto flex-grow">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{getDocumentTypeLabel(selectedDocument.type)}</h2>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        Phase {selectedDocument.phaseNumber}
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        {selectedDocument.submitted ? 'Submitted' : 'Not Submitted'}
                                    </div>
                                </div>

                                {selectedDocument.documentDescription && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">Description</h4>
                                        <p className="text-gray-600">{selectedDocument.documentDescription}</p>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-700 mb-3">File Information</h4>
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <div className="flex items-center mb-3">
                                            <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-800">{getDocumentFileName(selectedDocument.documentUrl)}</p>
                                                <p className="text-sm text-gray-500">
                                                    {selectedDocument.documentUrl?.split('.').pop()?.toUpperCase() || 'Document'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Preview */}
                                {selectedDocument.documentUrl && (
                                    <div className="mt-6">
                                        <h4 className="text-md font-medium text-gray-700 mb-3">Preview</h4>
                                        <div className="border rounded-lg overflow-hidden bg-gray-100 h-60 flex items-center justify-center">
                                            {selectedDocument.documentUrl.match(/\.(pdf)$/i) ? (
                                                <iframe
                                                    src={`${selectedDocument.documentUrl}#toolbar=0`}
                                                    className="w-full h-full"
                                                    title="PDF Document"
                                                ></iframe>
                                            ) : selectedDocument.documentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                <img
                                                    src={selectedDocument.documentUrl}
                                                    alt="Document"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <DocumentTextIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                                                    <p className="text-gray-600">Preview not available</p>
                                                    <p className="text-sm text-gray-500">Please download to view</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t bg-gray-50 sticky bottom-0 flex justify-between">
                            <button
                                onClick={closeDocumentModal}
                                className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-gray-700 font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => downloadDocument(selectedDocument.documentUrl, getDocumentFileName(selectedDocument.documentUrl))}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white font-medium transition-colors flex items-center"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download Document
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default EvaluationProjectDetailsPhase;