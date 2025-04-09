import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUpdatePostByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectDetailsUpdate = ({ getClassName }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const { updates, status, error } = useSelector(state => state.project);

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getUpdatePostByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-update")} p-6 bg-base-100 dark:bg-base-800 shadow-lg rounded-lg`} id="pills-update" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-6">Project Updates</h2>

      {updates?.length > 0 ? (
        <div className="space-y-6">
          {updates.map((update) => (
            <motion.div
              key={update.projectUpdatePostId}
              className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{update.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{update.postContent}</p>

              {/* Display image media */}
              {update.postMedia && (
                <motion.img
                  src={update.postMedia}
                  alt={update.title}
                  className="max-w-full h-64 object-cover rounded-lg mb-4 cursor-pointer"
                  onClick={() => handleImageClick(update.postMedia)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">Posted on: {new Date(update.createdAt).toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">No updates available for this project.</p>
      )}

      {/* Modal for Image View */}
      {showModal && selectedImage && (
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
            <img 
              src={selectedImage} 
              alt="Selected"
              className="w-full h-auto rounded-lg" 
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsUpdate;
