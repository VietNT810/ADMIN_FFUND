import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, suspendProject } from './components/projectSlice';
import { getCategoriesContent } from '../category/categorySlice';
import { MagnifyingGlassIcon, EyeIcon, PauseIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, status, error, totalPages } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });
  const { categories } = useSelector(state => state.category || { categories: [] });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('APPROVED');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    dispatch(getCategoriesContent());
    const defaultQuery = `status:eq:${selectedStatus}`;
    dispatch(getProjects({ query: defaultQuery, page, size: 10, sortField, sortOrder }));
  }, [dispatch, page, sortField, sortOrder, selectedStatus]);

  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedMainCategory !== "All") queryParts.push(`category.name:eq:${selectedMainCategory}`);
    if (selectedStatus) queryParts.push(`status:eq:${selectedStatus}`);
    if (queryParts.length === 0) return;
    const query = queryParts.join(",");
    dispatch(getProjects({ query, page, size: 10, sortField, sortOrder }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const handleSuspend = (projectId) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  };

  const confirmSuspend = () => {
    if (suspendReason) {
      dispatch(suspendProject({ projectId: selectedProjectId, reason: suspendReason }))
        .then(() => {
          toast.success('Project suspended successfully!');
          setIsModalOpen(false);
          setSuspendReason('');
          window.location.reload();
        })
        .catch(() => {
          toast.error('Error suspending project.');
        });
    } else {
      alert("Please enter a reason for suspending the project.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'SUSPENDED': return 'badge-error';
      case 'DRAFT': return 'badge-secondary';
      case 'PENDING_APPROVAL': return 'badge-warning';
      default: return 'badge';
    }
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
        {/* Search and Sort Section */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input input-bordered w-64"
          />
          <select
            value={selectedMainCategory}
            onChange={(e) => setSelectedMainCategory(e.target.value)}
            className="select select-bordered"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select select-bordered"
          >
            <option value="APPROVED">Approved</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="select select-bordered"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <button
            onClick={handleSearch}
            className="btn btn-primary relative group"
          >
            <MagnifyingGlassIcon className="w-5 h-5 inline-block" />
            <span className="absolute left-1/2 transform -translate-x-1/2 top-12 text-sm text-base-content opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Search
            </span>
          </button>
        </div>

        {/* Project Table */}
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 shadow-md rounded-lg">
            <thead>
              <tr className="bg-base-200 text-left text-sm font-semibold">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Project Title</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
                <tr key={project.id}>
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm">{project.title}</td>
                  <td className="px-4 py-2 text-sm">{project.team?.teamName || "No Team"}</td>
                  <td className={`px-4 py-2 text-sm ${getStatusColor(project.status)}`}>{project.status}</td>
                  <td className="px-4 py-2 text-sm">{project.location}</td>
                  <td className="px-4 py-2 text-sm">{new Date(project.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <div className="flex space-x-4">
                      <Link
                        to={`/app/project-details/${project.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      {project.status === 'APPROVED' && (
                        <button
                          onClick={() => handleSuspend(project.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <PauseIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-base-content py-4">No projects available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for Suspend Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Suspend Project</h3>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Enter reason for suspending the project..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmSuspend}
                className="btn btn-error"
              >
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
