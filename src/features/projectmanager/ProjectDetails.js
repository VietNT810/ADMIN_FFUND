import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectById } from './components/projectSlice';
import { EyeIcon } from '@heroicons/react/24/outline';
import Loading from '../../components/Loading';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, status, error } = useSelector(state => state.project || { currentProject: null, error: null, status: 'idle' });

  // State to manage full image modal
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
    }
  }, [dispatch, projectId]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowFullImage(true);
  };

  const handleCloseModal = () => {
    setShowFullImage(false);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-lg p-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-primary mb-4"
        >
          Back
        </button>

        {currentProject ? (
          <>
            <div className="mb-6">
              {/* Project Image */}
              <div 
                className="relative"
                onClick={() => handleImageClick(currentProject.projectImage)} // Click to open image in modal
              >
                <img 
                  src={currentProject.projectImage} 
                  alt={currentProject.title} 
                  className="w-full h-64 object-cover rounded-lg shadow-lg mb-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-6">
              {/* Project Title and Description */}
              <h2 className="text-3xl font-semibold text-orange-600">{currentProject.title}</h2>
              <p className="mt-2 text-base-content">{currentProject.description}</p>
            </div>

            {/* Project Information */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="card bg-green-100 p-4 rounded-lg shadow-md">
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

              <div className="card bg-orange-100 p-4 rounded-lg shadow-md">
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
            </div>

            {/* Team Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-orange-600">Team Members</h3>
              <div className="space-y-4">
                {currentProject.team?.teamMembers.map((member) => (
                  <div key={member.memberId} className="flex flex-row items-center p-4 shadow-md mb-4 rounded-lg">
                    <img 
                      src={member.memberAvatar} 
                      alt={member.memberName} 
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-green-600">{member.memberName}</h4>
                      <p className="text-sm text-gray-600">{member.teamRole ? member.teamRole : 'No role assigned'}</p>
                      <p className="text-sm text-gray-600">{member.memberEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>No project found</div>
        )}
      </div>

      {/* Modal for Full Image View */}
      {showFullImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-lg">
            <button
              onClick={handleCloseModal}
              className="btn btn-ghost absolute top-4 right-4 text-white"
            >
              Close
            </button>
            <img src={selectedImage} alt="Full Project Image" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
