import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectById } from './components/projectSlice';
import { Button, Card, Modal } from 'react-bootstrap';

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

  if (status === 'loading') return <div>Loading project details...</div>;
  if (status === 'failed') return <div className="p-4 mb-4 bg-red-200 text-red-800 rounded-lg text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Back Button */}
        <Button variant="primary" onClick={() => navigate(-1)} className="mb-4">
          Back
        </Button>

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
              <p className="mt-2 text-gray-700">{currentProject.description}</p>
            </div>

            {/* Project Information */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-green-100 p-4 rounded-lg shadow-md">
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

              <div className="bg-orange-100 p-4 rounded-lg shadow-md">
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
                  <Card key={member.memberId} className="flex flex-row items-center p-4 shadow-md mb-4 rounded-lg">
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
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>No project found</div>
        )}
      </div>
    </div>
  );
};

// Modal for Full Image View
const ImageModal = ({ show, imageUrl, onClose }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Full Project Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img src={imageUrl} alt="Full Image" className="w-full h-auto" />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectDetails;
