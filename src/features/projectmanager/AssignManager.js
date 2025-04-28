import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, approveProject, rejectProject, assignManagerToProject } from './components/projectSlice';
import { EyeIcon, CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getUsersContent } from '../userManger/userSlice';

const ProjectRequests = () => {
  const dispatch = useDispatch();
  const { projects, status, error } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });
  const { users } = useSelector(state => state.user || { users: [] });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const reasonInputRef = useRef(null);

  useEffect(() => {
    dispatch(getUsersContent({ query: 'roles:eq:MANAGER', size: 100 }));
    dispatch(getProjects({ query: 'status:eq:DRAFT', sortField: 'createdAt', sortOrder: 'asc' }));
  }, [dispatch]);

  const handleApprove = () => {
    dispatch(approveProject(selectedProjectId))
        .then((result) => {
          if(result.error) {
            toast.error(result.payload || "An error occurred while processing the project.");
          } else {
            setShowConfirmation(false);
            toast.success(result.payload);
            dispatch(getProjects({ query: 'status:eq:DRAFT', page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
          }
        })
        .catch(() => {
            toast.error('Failed to approve project.');
        });
  };

  const handleReject = () => {
    const reason = reasonInputRef.current.value.trim();
    if (reason) {
      dispatch(rejectProject({ projectId: selectedProjectId, reason }))
        .then(() => {
          setShowConfirmation(false);
          toast.success('Project rejected successfully!');
          dispatch(getProjects({ query: 'status:eq:DRAFT', page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
        })
        .catch(() => {
          toast.error('Failed to reject project.');
        });
    } else {
      alert("Rejection reason is required.");
    }
  };

  const handleAssignManager = () => {
    if (selectedManagerId) {
      dispatch(assignManagerToProject({ projectId: selectedProjectId, managerId: selectedManagerId }))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while assigning the manager.");
          } else {
            toast.success(result.payload);
            setShowConfirmation(false);
            dispatch(getProjects({ query: 'status:eq:DRAFT', page: 0, size: 10, sortField: 'createdAt', sortOrder: 'asc' }));
          }
        })
        .catch(() => {
          toast.error('Failed to assign manager.');
        });
    } else {
      alert("Please select a manager to assign.");
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
      <div className="max-w-7xl mx-auto bg-base-100 shadow-lg rounded-lg p-8 space-y-8">

        {/* Card View for Pending Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
            project.status === 'DRAFT' && (
              <motion.div
                key={project.id}
                className="bg-base-100 shadow-md rounded-lg p-4 hover:bg-base-200 transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.team?.teamName || "No Team"}</p>
                <p className="text-sm text-gray-500">{project.location}</p>
                <p className="text-sm text-gray-400">{new Date(project.createdAt).toLocaleString()}</p>
                
                <div className="mt-4 flex justify-between space-x-4">
                  <Link
                    to={`/app/project-details/${project.id}`}
                    className="text-blue-500 hover:text-blue-800 tooltip"
                    data-tip="View"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                  {/* <button
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
                  </button> */}
                  <button
                    onClick={() => confirmAction('assign', project.id)}
                    className="text-red-500 hover:text-red-800 tooltip"
                    data-tip="Assign"
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )
          )) : (
            <div className="text-center text-base-content col-span-full">No pending projects</div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-base-100 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-base-content mb-4">
              {actionType === 'approve' ? 'Approve Project' : actionType === 'reject' ? 'Reject Project' : 'Assign Manager'}
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
            {actionType === 'assign' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-base-content">Assign Manager</label>
                <select
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full p-2 mt-2 border border-base-300 rounded-md"
                >
                  <option value="">Select a Manager</option>
                  {users && users.length > 0 && users.map((user) => (
                    <option key={user.id} value={user.id}>{user.fullName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={cancelAction} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : actionType === 'reject' ? handleReject : handleAssignManager}
                className={`btn ${actionType === 'approve' ? 'btn-success' : actionType === 'reject' ? 'btn-error' : 'btn-primary'} text-white`}
              >
                {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;
