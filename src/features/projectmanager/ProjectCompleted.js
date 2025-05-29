import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getProjectToComplete, completeProject } from './components/projectSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectCompleted = () => {
  const dispatch = useDispatch();
  const { projects, status, error, totalPages } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const userRole = localStorage.getItem('role');

  // Debounced search term for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      dispatch(getProjectToComplete({ title: debouncedSearchTerm, page, size: 10 }));
    }
  }, [dispatch, debouncedSearchTerm, page]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setDebouncedSearchTerm(searchTerm);
    }
  };

  const handleComplete = (projectId) => {
    setSelectedProjectId(projectId);
    setCompleteModalOpen(true);
  };

  const confirmComplete = () => {
    dispatch(completeProject(selectedProjectId))
      .then(() => {
        setCompleteModalOpen(false);
        toast.success('Project completed!');
      })
      .catch(() => {
        toast.error('Failed to complete project.');
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'FUNDRAISING_COMPLETED': return 'badge-info';
      default: return 'badge';
    }
  };

  // Filter projects by 'APPROVED' or 'FUNDRAISING_COMPLETED' status
  const filteredProjects = projects.filter(
    (project) => project.status === 'APPROVED' || project.status === 'FUNDRAISING_COMPLETED'
  );

  if (status === 'loading') return <Loading />;
  if (status === 'failed') {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">

        {/* Filter Section */}
        <div className="mb-6 bg-base-100 p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input input-bordered w-full"
          />
          <button
            onClick={() => setDebouncedSearchTerm(searchTerm)}
            className="btn bg-orange-500 hover:bg-orange-600 text-white w-full"
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 shadow-md rounded-lg border">
            <thead className="bg-base-200 text-sm font-semibold text-base-content border-b">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredProjects) && filteredProjects.length > 0 ? filteredProjects.map((project, index) => (
                <motion.tr
                  key={project.id}
                  className="hover:bg-base-100 transition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium">{project.title}</td>
                  <td className="px-4 py-2 text-sm">{project.team?.teamName || "No Team"}</td>
                  <td className="px-4 py-2">
                    <span className={`badge ${getStatusColor(project.status)} px-3 py-1 text-xs`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{project.location}</td>
                  <td className="px-4 py-2 text-sm">{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-3">
                      {userRole === 'MANAGER' ? (
                        <Link to={`/app/project-scoring/${project.id}`} className="tooltip" data-tip="Score">
                          <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                        </Link>
                      ) : (
                        <Link to={`/app/project-details/${project.id}`} className="tooltip" data-tip="View">
                          <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                        </Link>
                      )}
                      {project.status === 'APPROVED' && (
                        <button className="tooltip" data-tip="Complete" onClick={() => handleComplete(project.id)}>
                          <CheckCircleIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-base-content py-4">No projects available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      </div>

      {/* Complete Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300">
            <h3 className="text-xl font-bold text-success mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6" />
              Complete Project
            </h3>
            <p>Are you sure you want to mark this project as completed?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button className="btn btn-ghost" onClick={() => setCompleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-success" onClick={confirmComplete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCompleted;
