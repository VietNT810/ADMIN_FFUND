import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, assignManagerToProject } from './components/projectSlice';
import { EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getUsersContent } from '../userManger/userSlice';

const AssignManager = () => {
  const dispatch = useDispatch();
  const { projects, totalPages, status, error } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });
  const { users } = useSelector(state => state.user || { users: [] });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getUsersContent({ query: 'roles:eq:MANAGER', size: 100 }));
  
        await dispatch(getProjects({ query: 'status:eq:DRAFT', page, size: 10, sortField, sortOrder }));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Failed to load data');
      }
    };
  
    fetchData();
  }, [dispatch, page, sortField, sortOrder]);  

  const handleAssignManager = () => {
    if (selectedManagerId) {
      dispatch(assignManagerToProject({ projectId: selectedProjectId, managerId: selectedManagerId }))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while assigning the manager.");
          } else {
            toast.success(result.payload);
            setShowConfirmation(false);
            dispatch(getProjects({ query: 'status:eq:DRAFT', page, size: 10, sortField, sortOrder}));
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
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">

        {/* Table View for Pending Projects */}
        <div className="overflow-auto">
          <table className="table w-full bg-base-100 shadow-md rounded-lg border">
            <thead className="bg-base-200 text-sm font-semibold text-base-content border-b">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Manager Assigned</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
                project.status === 'DRAFT' && (
                  <motion.tr
                    key={project.id}
                    className="hover:bg-base-100 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium">{project.title}</td>
                    <td className="px-4 py-2 text-sm">{project.managerName || "No manager assigned yet"}</td>
                    <td className="px-4 py-2 text-sm">{project.location}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <div className="flex justify-center gap-3"> 
                        <Link
                          to={`/app/project-details/${project.id}`}
                          className="text-blue-500 hover:text-blue-800 tooltip" data-tip="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => confirmAction('assign', project.id)}
                          className="text-red-500 hover:text-red-800 tooltip" data-tip="Assign Manager"
                        >
                          <UserIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-base-content py-4">No projects to assign</td>
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
              Assign Manager
            </h3>
            <p className="text-sm text-base-content">
              Are you sure you want to assign a manager to this project?
            </p>
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
                onClick={handleAssignManager}
                className="btn btn-primary text-white"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignManager;
