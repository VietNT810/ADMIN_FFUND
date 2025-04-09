import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, approveProject, rejectProject } from './components/projectSlice';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'; // Use appropriate icons
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ProjectRequests = () => {
  const dispatch = useDispatch();
  const { projects, status, error } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const reasonInputRef = useRef(null);

  useEffect(() => {
    const query = `status:eq:PENDING_APPROVAL`;
    dispatch(getProjects({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
  }, [dispatch]);

  const handleApprove = async () => {
    try {
      const response = await dispatch(approveProject(selectedProjectId));
      if (response.meta.requestStatus === 'fulfilled') {
        setShowConfirmation(false);
        toast.success('Project approved successfully!');
        const query = `status:eq:PENDING_APPROVAL`;
        dispatch(getProjects({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
      } else {
        toast.error('Failed to approve project.');
      }
    } catch (error) {
      setShowConfirmation(false);
      toast.error('Failed to approve project.');
    }
  };  

  const handleReject = () => {
    const reason = reasonInputRef.current.value.trim();
    if (reason) {
      dispatch(rejectProject({ projectId: selectedProjectId, reason }))
        .then(() => {
          setShowConfirmation(false);
          toast.success('Project rejected successfully!');
          const query = `status:eq:PENDING_APPROVAL`;
          dispatch(getProjects({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
        })
        .catch(() => {
          setShowConfirmation(false);
          toast.error('Failed to reject project.');
        });
    } else {
      alert("Rejection reason is required.");
    }
  };

  const confirmAction = (action, projectId) => {
    setActionType(action);
    setSelectedProjectId(projectId);
    setShowConfirmation(true);
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setSelectedProjectId(null);
  };

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'failed') {
    return <div className="p-4 mb-4 bg-red-200 text-red-800 rounded-lg text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-lg rounded-lg p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Project Requests <span className='text-yellow-500'>(Pending Approval)</span></h2>

        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 shadow-md rounded-lg">
            <thead>
              <tr className="bg-base-200 text-left text-sm font-semibold">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Project Title</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
                project.status === 'PENDING_APPROVAL' && (
                  <motion.tr
                    key={project.id}
                    className="border-t hover:bg-base-200 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-4 py-2 text-sm text-base-content">{index + 1}</td>
                    <td className="px-4 py-2 text-sm text-base-content">{project.title}</td>
                    <td className="px-4 py-2 text-sm text-base-content">{project.team?.teamName || "No Team"}</td>
                    <td className="px-4 py-2 text-sm text-base-content">{project.location}</td>
                    <td className="px-4 py-2 text-sm text-base-content">{new Date(project.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-center flex space-x-4">
                      <Link
                        to={`/app/project-details/${project.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => confirmAction('approve', project.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => confirmAction('reject', project.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                )
              )) : (
                <tr>
                  <td colSpan="6" className="text-center text-base-content py-4">No pending projects</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-base-100 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-base-content mb-4">
              {actionType === 'approve' ? 'Approve Project' : 'Reject Project'}
            </h3>
            <p className="text-sm text-base-content">
              Are you sure you want to {actionType} this project?
            </p>
            {actionType === 'reject' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-base-content">Reason</label>
                <textarea
                  ref={reasonInputRef}
                  className="w-full p-2 mt-2 border border-base-300 rounded-md"
                  rows="4"
                />
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={cancelAction} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-error'} text-white`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;
