import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPhaseByProjectId, getMilestoneByPhaseId } from '../../features/projectmanager/components/projectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const EvaluationProjectDetailsPhase = ({ getClassName, evaluationMode = false }) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();

    const { phases, milestones, status, error } = useSelector(state => state.project);

    // States
    const [showModal, setShowModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [expandedPhase, setExpandedPhase] = useState(null);
    const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'detailed'
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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

    if (status === 'loading') return <Loading />;
    if (status === 'failed') return <div className="alert alert-error">{error}</div>;
    if (!phases || phases.length === 0) {
        return <p className="text-center text-gray-500">No phases available for this project.</p>;
    }

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
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full ${phase.status === 'PROCESS' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                                            } flex items-center justify-center font-bold`}>
                                            {phaseIndex + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Phase {phase.phaseNumber}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right hidden sm:block">
                                            <span className="block font-semibold text-gray-800">${phase.raiseAmount.toLocaleString()} raised</span>
                                            <span className="block text-sm text-gray-500">of ${phase.targetAmount.toLocaleString()}</span>
                                        </div>

                                        <div
                                            className={`px-3 py-1 text-xs rounded-full ${phase.status === 'PROCESS' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                                                } font-medium whitespace-nowrap`}
                                        >
                                            {phase.status}
                                        </div>

                                        <svg
                                            className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
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
                                    className="p-4 border-t border-gray-200 bg-white"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Phase details grid for larger screens */}
                                    <div className="grid md:grid-cols-4 gap-4 mb-5 pb-4 border-b border-gray-200">
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

                                    {/* Milestones Section */}
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
        </div>
    );
};

export default EvaluationProjectDetailsPhase;