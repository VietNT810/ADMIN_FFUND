import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUpdatePostByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';

const ProjectDetailsUpdate = ({ getClassName }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const { updates, status, error } = useSelector(state => state.project);

  useEffect(() => {
    if (projectId) {
      dispatch(getUpdatePostByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-update")} p-6 bg-base-100 dark:bg-base-800 shadow-lg rounded-lg`} id="pills-update" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-6">Project Updates</h2>

      {updates?.length > 0 ? (
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.projectUpdatePostId} className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{update.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{update.postContent}</p>

              {/* Display image media */}
              {update.postMedia && (
                <img src={update.postMedia} alt={update.title} className="max-w-full h-auto object-cover rounded-lg mb-4" />
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">Posted on: {new Date(update.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">No updates available for this project.</p>
      )}
    </div>
  );
};

export default ProjectDetailsUpdate;
