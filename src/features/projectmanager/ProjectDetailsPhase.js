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
    return <p>No phases available for this project.</p>;
  }

  return (
    <div className={`${getClassName?.("pills-phase")} p-6 bg-base-100 shadow-xl rounded-lg`} id="pills-phase" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 mb-4">Project Phases</h2>

      {phases?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase) => (
            <motion.div
              key={phase.id}
              className="card bg-base-200 shadow-lg p-6 rounded-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-semibold text-lg text-base-content mb-2">Phase {phase.phaseNumber}</h3>
              <p className="text-sm text-base-content mb-2"><strong>Status:</strong> {phase.status}</p>
              <p className="text-sm text-base-content mb-2"><strong>Start Date:</strong> {new Date(phase.startDate).toLocaleDateString()}</p>
              <p className="text-sm text-base-content mb-2"><strong>End Date:</strong> {new Date(phase.endDate).toLocaleDateString()}</p>
              <p className="text-sm text-base-content mb-2"><strong>Target Amount:</strong> {phase.targetAmount}</p>
              <p className="text-sm text-base-content mb-4"><strong>Raised Amount:</strong> {phase.raiseAmount}</p>

              {/* Display milestones for this phase */}
              <div>
                <h4 className="font-semibold text-md text-orange-500 mb-2">Milestones</h4>
                {milestones[phase.id]?.length > 0 ? (
                  milestones[phase.id].map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      className="card bg-base-100 shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg"
                      onClick={() => handleMilestoneClick(milestone)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h5 className="font-semibold text-lg text-base-content">{milestone.title}</h5>
                      <p className="text-sm text-base-content"><strong>Price:</strong> ${milestone.price}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-base-content">No milestones available for this phase.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-base-content">No phases available for this project.</p>
      )}

      {/* Modal for Milestone Details */}
      {showModal && selectedMilestone && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            className="bg-base-100 p-6 rounded-lg w-full max-w-lg shadow-2xl"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={closeModal}
              className="btn btn-ghost absolute top-4 right-4 text-white"
            >
              Close
            </button>
            <h3 className="text-2xl font-semibold text-base-content mb-4">{selectedMilestone.title}</h3>
            <p className="text-base-content">{selectedMilestone.description}</p>
            <p className="mt-2 text-sm text-base-content"><strong>Price:</strong> ${selectedMilestone.price}</p>

            {selectedMilestone.items && selectedMilestone.items.length > 0 && (
              <div className="mt-4">
                <h6 className="font-semibold text-sm text-base-content">Items</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedMilestone.items.map((item) => (
                    <div key={item.id} className="card bg-base-200 p-2">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-32 object-cover rounded-md mb-2" 
                      />
                      <p className="text-sm text-base-content">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
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
