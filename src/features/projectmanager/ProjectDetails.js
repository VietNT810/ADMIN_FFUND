import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectById } from './components/projectSlice';
import { getMemberById } from '../team/teamSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, status, error } = useSelector(state => state.project || { currentProject: null, error: null, status: 'idle' });
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // New states for member modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const mediaArray = [
    currentProject?.projectImage,
    currentProject?.projectVideoDemo
  ].filter(Boolean);

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

  // New function to handle member click
  const handleMemberClick = async (memberId) => {
    setMemberLoading(true);
    try {
      const memberData = await dispatch(getMemberById(memberId)).unwrap();
      setSelectedMember(memberData);
      setShowMemberModal(true);
    } catch (error) {
      console.error("Failed to fetch member details:", error);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn bg-orange-500 hover:bg-orange-600 text-white mb-6"
        >
          Back
        </button>

        {currentProject ? (
          <>
            {/* Project Media */}
            <div className="mb-8">
              <div
                className="relative cursor-pointer"
                onClick={() => handleMediaClick(0)}
              >
                <img
                  src={currentProject.projectImage}
                  alt={currentProject.title}
                  className="w-full h-72 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Project Title and Description */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-orange-600 mb-4">{currentProject.title}</h1>
              <p className="text-lg text-gray-700 leading-relaxed">{currentProject.description}</p>
            </motion.div>

            {/* Project Information */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-orange-500 pl-4">Project Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project Details Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="bg-green-500 text-white py-4 px-6">
                    <h3 className="text-xl font-bold">Project Details</h3>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Status</span>
                      <span className="text-lg font-medium">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentProject.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          currentProject.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {currentProject.status}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Location</span>
                      <span className="text-lg font-medium">
                        {currentProject.location?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Category</span>
                      <span className="text-lg font-medium bg-green-50 inline-block px-3 py-1 rounded-lg">
                        {currentProject.category?.name}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Sub Categories</span>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.subCategories?.map((subCategory) => (
                          <span
                            key={subCategory.id}
                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm"
                          >
                            {subCategory.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between space-x-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 uppercase tracking-wide">Created On</span>
                        <span className="text-lg font-medium">
                          {new Date(currentProject.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {currentProject.updatedAt && (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 uppercase tracking-wide">Updated On</span>
                          <span className="text-lg font-medium">
                            {new Date(currentProject.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Funding Details Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="bg-orange-500 text-white py-4 px-6">
                    <h3 className="text-xl font-bold">Funding Details</h3>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Target Amount</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${Number(currentProject.totalTargetAmount)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1 pt-3">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Project URL</span>
                      <a
                        href={currentProject.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-words transition duration-200"
                      >
                        {currentProject.projectUrl}
                      </a>
                    </div>

                    <div className="flex flex-col space-y-4 pt-3">
                      <span className="text-sm text-gray-500 uppercase tracking-wide">Demo Video</span>
                      {currentProject.projectVideoDemo ? (
                        <div className="space-y-2">
                          <a
                            href={currentProject.projectVideoDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 7l-7 5 7 5V7z"></path>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            Watch Demo Video
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No demo video available</span>
                      )}
                    </div>
                  </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {currentProject.team?.teamMembers.map((member) => (
                  <div
                    key={member.memberId}
                    className="flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
                    onClick={() => handleMemberClick(member.memberId)}
                  >
                    <img
                      src={
                        member.memberAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.memberName)}&background=random&color=fff`
                      }
                      alt={member.memberName}
                      className="w-20 h-20 rounded-full mr-4 shadow-md"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-green-600">{member.memberName}</h4>
                      <p className="text-sm text-gray-600">{member.teamRole || 'Team Member'}</p>
                      <p className="text-sm text-gray-600">{member.memberEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <div className="text-center text-gray-600">No project found</div>
        )}
      </div>

      {/* Modal for Full Image/Video View */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full shadow-xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            {mediaArray[currentMediaIndex]?.includes('youtube.com') ? (
              <iframe
                className="w-full h-96 rounded-lg"
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
                className="btn bg-orange-500 hover:bg-orange-600 text-white"
              >
                Prev
              </button>
              <button
                onClick={handleNextMedia}
                className="btn bg-orange-500 hover:bg-orange-600 text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-xl max-w-3xl w-full shadow-2xl relative"
          >
            <button
              onClick={handleCloseMemberModal}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>

            {memberLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loading />
              </div>
            ) : selectedMember ? (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center mb-4">
                    {selectedMember.userAvatar ? (
                      <img
                        src={selectedMember.userAvatar}
                        alt={selectedMember.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.fullName)}&background=random&color=fff&size=200`}
                        alt={selectedMember.fullName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-center text-orange-600">{selectedMember.fullName}</h2>
                  <p className="text-gray-600 mt-1">{selectedMember.email}</p>
                </div>

                <div className="md:w-2/3 flex flex-col">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold text-green-600 mb-4">Academic Information</h3>
                    <div className="space-y-2">
                      <p><strong>Class:</strong> {selectedMember.exeClass}</p>
                      <p><strong>FPT Facility:</strong> {selectedMember.fptFacility?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-orange-600 mb-4">Portfolio</h3>
                    {selectedMember.studentPortfolio ? (
                      <div>
                        <p className="mb-4">Check out {selectedMember.fullName}'s portfolio:</p>
                        <a
                          href={selectedMember.studentPortfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          View Portfolio
                        </a>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-100 rounded-lg">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <p className="mt-2 text-gray-600">User not provided a portfolio link yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 py-20">
                <p className="text-xl">Member information could not be loaded</p>
                <p className="mt-2">Please try again later</p>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCloseMemberModal}
                className="btn bg-orange-500 hover:bg-orange-600 text-white"
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

export default ProjectDetails;