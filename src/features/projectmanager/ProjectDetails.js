import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectById } from './components/projectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, status, error } = useSelector(state => state.project || { currentProject: null, error: null, status: 'idle' });

  // State to manage full image/video modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Prepare media array (images and videos)
  const mediaArray = [
    currentProject?.projectImage,
    currentProject?.projectVideoDemo
  ].filter(Boolean); // Only include non-null/undefined media

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
    }
  }, [dispatch, projectId]);

  const handleMediaClick = (index) => {
    setCurrentMediaIndex(index);
    setShowMediaModal(true);
  };

  const handleCloseModal = () => {
    setShowMediaModal(false);
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaArray.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + mediaArray.length) % mediaArray.length);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-lg p-8">

        {/* Back Button */}
        <motion.button 
          onClick={() => navigate(-1)} 
          className="btn bg-orange-500 hover:bg-orange-600 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Back
        </motion.button>

        {currentProject ? (
          <>
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Project Image */}
              <div 
                className="relative"
                onClick={() => handleMediaClick(0)} // Click to open media in modal
              >
                <img 
                  src={currentProject.projectImage} 
                  alt={currentProject.title} 
                  className="w-full h-64 object-cover rounded-lg shadow-xl mb-4 cursor-pointer transition-transform duration-300 hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.div 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Project Title and Description */}
              <h2 className="text-4xl font-semibold text-orange-600 mb-4">{currentProject.title}</h2>
              <p className="text-lg text-base-content">{currentProject.description}</p>
            </motion.div>

            {/* Project Information */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card bg-green-100 p-6 rounded-lg shadow-lg">
                <p><strong>Status:</strong> <span className="text-green-600">{currentProject.status}</span></p>
                <p><strong>Location:</strong> {currentProject.location}</p>
                <p><strong>Category:</strong> {currentProject.category?.name}</p>
                <p><strong>Sub Categories:</strong> 
                  {currentProject.subCategories?.map((subCategory, index) => (
                    <span key={subCategory.id}>
                      {subCategory.name}
                      {index < currentProject.subCategories.length - 1 && ", "}
                    </span>
                  ))}
                </p>
                <p><strong>Created At:</strong> {new Date(currentProject.createdAt).toLocaleString()}</p>
              </div>

              <div className="card bg-orange-100 p-6 rounded-lg shadow-lg">
                <p><strong>Target Amount:</strong> {currentProject.totalTargetAmount}</p>
                <div className="mb-2">
                  <strong>Project URL:</strong> 
                  <a href={currentProject.projectUrl} className="text-blue-600" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {currentProject.projectUrl}
                  </a>
                </div>
                <div className="mb-2">
                  <strong>Demo Video:</strong> 
                  <a href={currentProject.projectVideoDemo} className="text-blue-600" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                    {currentProject.projectVideoDemo}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Team Section */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-semibold text-orange-600 mb-4">Team Members</h3>
              <div className="space-y-6">
                {currentProject.team?.teamMembers.map((member) => (
                  <div key={member.memberId} className="flex flex-row items-center p-6 shadow-lg mb-6 rounded-lg hover:shadow-xl transition duration-300">
                    <img 
                      src={member.memberAvatar} 
                      alt={member.memberName} 
                      className="w-20 h-20 rounded-full mr-6 shadow-md"
                    />
                    <div>
                      <h4 className="text-xl font-semibold text-green-600">{member.memberName}</h4>
                      <p className="text-sm text-gray-700">{member.teamRole || 'No role assigned'}</p>
                      <p className="text-sm text-gray-700">{member.memberEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <div>No project found</div>
        )}
      </div>

      {/* Modal for Full Image/Video View */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg max-w-lg w-full shadow-xl">
            <button
              onClick={handleCloseModal}
              className="btn btn-ghost absolute top-4 right-4 text-white"
            >
              Close
            </button>
            {/* Show image or video based on current media index */}
            {mediaArray[currentMediaIndex]?.includes('youtube.com') ? (
              <iframe
                className="w-full h-72 rounded-lg"
                src={mediaArray[currentMediaIndex]}
                title="Project Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={mediaArray[currentMediaIndex]} alt="Full Project Media" className="w-full h-auto rounded-lg" />
            )}
            <div className="flex justify-between mt-4">
              <button 
                onClick={handlePrevMedia} 
                className="btn bg-orange-500 hover:bg-orange-600"
              >
                Prev
              </button>
              <button 
                onClick={handleNextMedia} 
                className="btn bg-orange-500 hover:bg-orange-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
