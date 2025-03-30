import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUpdatePostByProjectId } from './components/projectSlice';

const ProjectDetailsUpdate = ({ getClassName }) => {
  const { projectId } = useParams();  // Get projectId from URL
  const dispatch = useDispatch();

  // Select updates, loading status, and error from Redux store
  const { updates, status, error } = useSelector(state => state.project);

  // Fetch update posts when the component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(getUpdatePostByProjectId(projectId));  // Dispatch action to fetch updates
    }
  }, [dispatch, projectId]);

  // Render loading or error state if needed
  if (status === 'loading') return <div className="text-center text-gray-600">Loading Updates...</div>;
  if (status === 'failed') return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-update")} p-6 bg-white shadow-lg rounded-lg`} id="pills-update" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 mb-6">Project Updates</h2>

      {updates?.length > 0 ? (
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.projectUpdatePostId} className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{update.title}</h3>
              <p className="text-gray-700 mb-4">{update.postContent}</p>

              {/* Display image media */}
              {update.postMedia && (
                <img src={update.postMedia} alt={update.title} className="max-w-full h-auto object-cover rounded-lg mb-4" />
              )}

              <p className="text-xs text-gray-500">Posted on: {new Date(update.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No updates available for this project.</p>
      )}
    </div>
  );
};

export default ProjectDetailsUpdate;
