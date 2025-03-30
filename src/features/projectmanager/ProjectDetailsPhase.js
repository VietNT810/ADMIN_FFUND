import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPhaseByProjectId, getMilestoneByPhaseId } from './components/projectSlice';
import { Col, Row } from 'react-bootstrap';

const ProjectDetailsPhase = ({ getClassName }) => {
  const { projectId } = useParams();  // Get projectId from URL
  const dispatch = useDispatch();

  // Select the state values from Redux store
  const { phases, milestones, status, error } = useSelector(state => state.project);

  // Fetch phases on component mount
  useEffect(() => {
    if (projectId) {
      dispatch(getPhaseByProjectId(projectId)); // Fetch project phases
    }
  }, [dispatch, projectId]);

  // Fetch milestones for each phase
  useEffect(() => {
    if (phases?.length > 0) {
      phases.forEach(phase => {
        dispatch(getMilestoneByPhaseId(phase.id));  // Dispatch to fetch milestones for each phase
      });
    }
  }, [dispatch, phases]);

  // Handle loading or error states
  if (status === 'loading') return <div>Loading Phases and Milestones...</div>;
  if (status === 'failed') return <div className="text-red-600">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-phase")} p-6 bg-white shadow-md rounded-lg`} id="pills-phase" role="tabpanel">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">Project Phases</h2>

      {phases?.length > 0 ? (
        <Row>
          {phases.map((phase) => (
            <Col key={phase.id} sm={12} md={6} lg={4} className="mb-4">
              <div className="p-4 bg-gray-50 border rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-800">Phase {phase.phaseNumber}</h3>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {phase.status}</p>
                <p className="text-sm text-gray-600"><strong>Start Date:</strong> {new Date(phase.startDate.join('-')).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600"><strong>End Date:</strong> {new Date(phase.endDate.join('-')).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600"><strong>Target Amount:</strong> {phase.targetAmount}</p>
                <p className="text-sm text-gray-600"><strong>Raised Amount:</strong> {phase.raiseAmount}</p>

                {/* Display milestones for this phase */}
                <div className="mt-4">
                  <h4 className="font-semibold text-md">Milestones</h4>
                  {milestones[phase.id]?.length > 0 ? (
                    milestones[phase.id].map((milestone) => (
                      <div key={milestone.id} className="p-4 bg-white border rounded-lg shadow-md mb-4">
                        <h5 className="font-semibold text-lg text-gray-800">{milestone.title}</h5>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <p className="text-sm text-gray-600"><strong>Price:</strong> ${milestone.price}</p>

                        {/* Display items for the milestone */}
                        {milestone.items && milestone.items.length > 0 && (
                          <div className="mt-2">
                            <h6 className="font-semibold text-sm">Items</h6>
                            <Row className="space-y-2">
                              {milestone.items.map((item) => (
                                <Col key={item.id} sm={6} md={4} lg={3}>
                                  <div className="p-2 bg-gray-50 border rounded-lg">
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.name} 
                                      className="w-full h-32 object-cover rounded-md mb-2" 
                                    />
                                    <p className="text-sm text-gray-600">{item.name}</p>
                                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No milestones available for this phase.</p>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-gray-600">No phases available for this project.</p>
      )}
    </div>
  );
};

export default ProjectDetailsPhase;
