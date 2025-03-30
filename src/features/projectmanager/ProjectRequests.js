import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, approveProject, rejectProject } from './components/projectSlice';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ProjectRequests = () => {
  const dispatch = useDispatch();
  const { projects, status, error } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false); // For showing the confirmation modal
  const [actionType, setActionType] = useState(''); // Either 'approve' or 'reject'
  const [selectedProjectId, setSelectedProjectId] = useState(null); // ID of the selected project for action
  const [notification, setNotification] = useState(null); // Notification message for success/error
  const reasonInputRef = useRef(null); // Reference for the rejection reason input field

  useEffect(() => {
    const query = `status:eq:PENDING_APPROVAL`;
    dispatch(getProjects({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
  }, [dispatch]);

  const toggleDropdown = (projectId) => {
    setOpenDropdown(openDropdown === projectId ? null : projectId);
  };

  const handleApprove = () => {
    dispatch(approveProject(selectedProjectId))
      .then(() => {
        setShowConfirmation(false); // Close the modal after action is confirmed
        setNotification('Project approved successfully!'); // Success notification
        setTimeout(() => window.location.reload(), 2000); // Reload page after 2 seconds
      })
      .catch((error) => {
        setShowConfirmation(false);
        setNotification('Failed to approve project.'); // Error notification
      });
  };

  const handleReject = () => {
    const reason = reasonInputRef.current.value.trim(); // Get the reason from the modal input field
    if (reason) {
      dispatch(rejectProject({ projectId: selectedProjectId, reason }))
        .then(() => {
          setShowConfirmation(false); // Close the modal after action is confirmed
          setNotification('Project rejected successfully!'); // Success notification
          setTimeout(() => window.location.reload(), 2000); // Reload page after 2 seconds
        })
        .catch((error) => {
          setShowConfirmation(false);
          setNotification('Failed to reject project.'); // Error notification
        });
    } else {
      alert("Rejection reason is required.");
    }
  };

  const confirmAction = (action, projectId) => {
    setActionType(action);
    setSelectedProjectId(projectId);
    setShowConfirmation(true); // Show confirmation modal
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setSelectedProjectId(null);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="p-4 mb-4 bg-red-200 text-red-800 rounded-lg text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Project Requests (Pending Approval)</h2>

        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Project Title</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
                project.status === 'PENDING_APPROVAL' && (
                  <tr key={project.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{project.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{project.team?.teamName || "No Team"}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{project.location}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{new Date(project.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <button
                        onClick={() => toggleDropdown(project.id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition duration-200"
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5 inline-block" />
                      </button>
                      {openDropdown === project.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                          <ul className="py-1">
                            <li>
                              <button
                                onClick={() => confirmAction('approve', project.id)}
                                className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                              >
                                Approve Project
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => confirmAction('reject', project.id)}
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Reject Project
                              </button>
                            </li>
                            <li>
                              {/* Link to Project Details page */}
                              <Link
                                to={`/app/project-details/${project.id}`}
                                className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                              >
                                View Project
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              )) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-600 py-4">No pending projects</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {actionType === 'approve' ? 'Approve Project' : 'Reject Project'}
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to {actionType} this project?
            </p>
            {actionType === 'reject' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  ref={reasonInputRef}
                  className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                  rows="4"
                />
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={cancelAction} className="bg-gray-300 px-4 py-2 rounded-md">
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={`${
                  actionType === 'approve' ? 'bg-green-500' : 'bg-red-500'
                } text-white px-4 py-2 rounded-md`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-md shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;
