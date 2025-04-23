import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPhaseByProjectId, getMilestoneByPhaseId } from './components/projectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectDetailsPhase = ({ getClassName }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const { phases, milestones, status, error } = useSelector(state => state.project);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getPhaseByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (phases?.length > 0) {
      phases.forEach(phase => {
        dispatch(getMilestoneByPhaseId(phase.id));
      });
    }
  }, [dispatch, phases]);

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMilestone(null);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  // Ensure that phases data exists before rendering
  if (!phases || phases.length === 0) {
    return <p className="text-center text-gray-500">No phases available for this project.</p>;
  }

  return (
    <div className={`${getClassName?.("pills-phase")} p-6 bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl rounded-lg`} id="pills-phase" role="tabpanel">
      <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">Project Phases</h2>

      {phases?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {phases.map((phase) => {
            const phaseProgress = phase.targetAmount > 0
              ? (phase.raiseAmount / phase.targetAmount) * 100
              : 0;
            const progressDisplay = `${Math.round(phaseProgress)}%`;
            const phaseMilestones = milestones[phase.id] || [];

            return (
              <motion.div
                key={phase.id}
                className="card bg-white shadow-lg p-6 rounded-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl border-t-4 border-orange-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-xl text-gray-800">Phase {phase.phaseNumber}</h3>

                  {/* Status badge - inline display */}
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${phase.status === 'PROCESS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    } font-medium`}>
                    {phase.status}
                  </span>
                </div>

                {/* Progress bar with percentage inside */}
                <div className="w-full bg-gray-200 rounded-full h-6 mb-4 relative overflow-hidden">
                  <div
                    className="bg-green-500 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ width: `${Math.min(100, phaseProgress)}%` }}
                  >
                    {progressDisplay}
                  </div>
                  {/* If progress is too low to show text inside colored bar, show text on top */}
                  {phaseProgress < 25 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {progressDisplay}
                    </div>
                  )}
                </div>

                {/* Phase details */}
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Timeline:</span>
                    <span>{new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Target:</span>
                    <span className="font-medium">${phase.targetAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Raised:</span>
                    <span className="font-medium text-orange-600">${phase.raiseAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Investors:</span>
                    <span>{phase.totalInvestors}</span>
                  </div>
                </div>

                {/* Display milestones for this phase */}
                <div className="mt-4">
                  <h4 className="font-semibold text-md text-orange-500 mb-2">
                    Milestones {phaseMilestones.length > 0 ? `(${phaseMilestones.length})` : ''}
                  </h4>

                  {phaseMilestones.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {phaseMilestones.map((milestone) => (
                        <motion.div
                          key={milestone.id}
                          className="card bg-gray-50 shadow-md p-4 cursor-pointer hover:shadow-lg rounded-lg border-l-4 border-transparent hover:border-orange-400"
                          onClick={() => handleMilestoneClick(milestone)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h5 className="font-semibold text-lg text-gray-800">{milestone.title}</h5>
                          <p className="text-sm text-gray-600">
                            <strong>Price:</strong> <span className="text-orange-600 font-medium">${milestone.price.toLocaleString()}</span>
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No milestones available for this phase.</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No phases available for this project.</p>
      )}

      {/* Modal for Milestone Details */}
      {showModal && selectedMilestone && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            className="bg-white p-8 rounded-lg w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">{selectedMilestone.title}</h3>
            <p className="text-lg text-gray-600 mb-4">{selectedMilestone.description}</p>
            <p className="text-lg text-gray-600 mb-6">
              <strong>Price:</strong> <span className="text-orange-600 font-semibold">${selectedMilestone.price.toLocaleString()}</span>
            </p>

            {selectedMilestone.items && selectedMilestone.items.length > 0 && (
              <div className="mt-6">
                <h6 className="font-semibold text-xl text-gray-800 mb-4">Items</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedMilestone.items.map((item) => (
                    <div key={item.id} className="card bg-gray-100 p-6 rounded-lg shadow-md">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                      <p className="text-lg text-gray-800 font-semibold">{item.name}</p>
                      <p className="text-md text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones List */}
            {milestones[selectedMilestone.phaseId]?.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-2xl text-orange-500 mb-6">Other Milestones in Phase</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {milestones[selectedMilestone.phaseId].map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`card bg-gray-50 shadow-md p-6 cursor-pointer hover:shadow-lg rounded-lg ${milestone.id === selectedMilestone.id ? 'border-2 border-orange-500' : ''
                        }`}
                      onClick={() => handleMilestoneClick(milestone)}
                    >
                      <h5 className="font-semibold text-xl text-gray-800">{milestone.title}</h5>
                      <p className="text-lg text-gray-600">
                        <strong>Price:</strong> <span className="text-orange-600">${milestone.price.toLocaleString()}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPhase;