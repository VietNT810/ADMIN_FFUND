import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUpdatePostByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetailsUpdate = ({ getClassName }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { updates, status, error } = useSelector(state => state.project);

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getUpdatePostByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (updates && updates.length > 0) {
      // Sắp xếp các bài đăng theo createdAt giảm dần
      const sortedUpdates = [...updates].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      // Đặt bài đăng mới nhất làm bài được chọn
      setSelectedUpdate(sortedUpdates[0]);
    }
  }, [updates]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="text-center text-red-600">{error}</div>;

  return (
    <div
      className={`${getClassName?.("pills-update")} p-8 bg-base-100 dark:bg-base-800 shadow-lg rounded-lg min-h-screen`}
      id="pills-update"
      role="tabpanel"
    >
      <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-8 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Project Updates
      </h2>

      {updates?.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[32rem]">
          {/* Timeline sidebar */}
          <div className="md:w-1/3 md:max-w-xs flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">Update Timeline</h3>
            <div className="space-y-1 overflow-y-auto pr-2 flex-grow max-h-[65vh]">
              {[...updates]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp theo createdAt
                .map((update, index) => (
                  <motion.div
                    key={update.projectUpdatePostId}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 border-l-4 ${selectedUpdate?.projectUpdatePostId === update.projectUpdatePostId
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700'
                      }`}
                    onClick={() => setSelectedUpdate(update)}
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">{update.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(update.createdAt)}</p>

                    {/* New badge for the most recent update */}
                    {index === 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                        Latest
                      </span>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Selected update detail */}
          <div className="md:w-2/3 flex-grow h-full flex flex-col">
            <AnimatePresence mode="wait">
              {selectedUpdate && (
                <motion.div
                  key={selectedUpdate.projectUpdatePostId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full min-h-[65vh]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header with date */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                    <h3 className="text-xl font-bold">{selectedUpdate.title}</h3>
                    <p className="text-sm opacity-90">{formatDate(selectedUpdate.createdAt)}</p>
                  </div>

                  {/* Media (if available) */}
                  {selectedUpdate.postMedia && (
                    <motion.div
                      className="relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={selectedUpdate.postMedia}
                        alt={selectedUpdate.title}
                        className="w-full h-80 object-cover cursor-zoom-in"
                        onClick={() => handleImageClick(selectedUpdate.postMedia)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-black bg-opacity-70 text-white text-sm py-1 px-3 rounded-full">
                          Click to enlarge
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {selectedUpdate.postContent}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Update #{selectedUpdate.projectUpdatePostId}</span>
                    {selectedUpdate.updatedAt !== selectedUpdate.createdAt && (
                      <span>Edited: {formatDate(selectedUpdate.updatedAt)}</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <motion.div
          className="text-center p-12 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[32rem] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No updates available for this project.</p>
        </motion.div>
      )}

      {/* Modal for Image View */}
      {showModal && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={closeModal}
        >
          <motion.div
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
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