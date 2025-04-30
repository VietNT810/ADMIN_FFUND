import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, suspendProject, completeProject, getProjectStatistics, getProjectsManager } from './components/projectSlice';
import { getCategoriesContent } from '../category/categorySlice';
import { MagnifyingGlassIcon, EyeIcon, PauseIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, status, error, totalPages, statistics } = useSelector(state => state.project || { projects: [], error: null, status: 'idle', statistics: null });
  const { categories } = useSelector(state => state.category || { categories: [] });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('APPROVED');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [isPotential, setIsPotential] = useState(false);
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    dispatch(getCategoriesContent());
    const defaultQuery = `status:eq:${selectedStatus}`;

    if (userRole === 'MANAGER') {
      dispatch(getProjectsManager({ query: `status:eq:PENDING_APPROVAL`, page, size: 10, sortField, sortOrder }));
    } else {
      dispatch(getProjects({ query: defaultQuery, page, size: 10, sortField, sortOrder }));
      dispatch(getProjectStatistics());
    }
  }, [dispatch, page, sortField, sortOrder, selectedStatus, userRole]);

  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedMainCategory !== "All") queryParts.push(`category.name:eq:${selectedMainCategory}`);
    if (selectedSubCategory !== "All") queryParts.push(`subCategories.subCategory.name:eq:${selectedSubCategory}`);
    if (selectedStatus) queryParts.push(`status:eq:${selectedStatus}`);
    if (isPotential) queryParts.push(`isPotential:true`);
    if (queryParts.length === 0) return;

    const query = queryParts.join(",");

    if (userRole === 'MANAGER') {
      dispatch(getProjectsManager({ query, page, size: 10, sortField, sortOrder }));
    } else {
      dispatch(getProjects({ query, page, size: 10, sortField, sortOrder }));
    }
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
        })
        .catch(() => {
          toast.error('Error suspending project.');
        });
    } else {
      alert("Please enter a reason for suspending the project.");
    }
  };

  const handleComplete = (projectId) => {
    setSelectedProjectId(projectId);
    setCompleteModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'SUSPENDED': return 'badge-error';
      case 'DRAFT': return 'badge-warning';
      case 'FUNDRAISING_COMPLETED': return 'badge-info';
      case 'PENDING_APPROVAL': return 'badge-warning';
      default: return 'badge';
    }
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') {
    return <div className="alert alert-error">{error}</div>;
  }

  const filteredSubCategories = selectedMainCategory !== 'All'
    ? categories.find(category => category.categoryName === selectedMainCategory)?.subCategories || []
    : [];

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">

        {/* Statistics Section */}
        {userRole !== 'MANAGER' && statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card bg-blue-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-blue-700">Total Projects</h3>
              <p className="text-2xl font-bold text-blue-800">{statistics.totalProjects}</p>
            </div>
            <div className="card bg-purple-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-purple-700">Potential Projects</h3>
              <p className="text-2xl font-bold text-purple-800">{statistics.potentialProjects}</p>
            </div>
            <div className="card bg-green-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-green-700">Approved Projects</h3>
              <p className="text-2xl font-bold text-green-800">{statistics.status_APPROVED}</p>
            </div>
            <div className="card bg-red-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-red-700">Suspended Projects</h3>
              <p className="text-2xl font-bold text-red-800">{statistics.status_SUSPENDED}</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6 bg-base-100 p-4 rounded-lg shadow-md">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search projects"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input input-bordered w-full"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory('All'); // Reset subCategory khi đổi category
              }}
              className="select select-bordered w-full"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>

            {/* Subcategory Filter */}
            <div className="relative">
              <div
                className={`tooltip tooltip-top w-full ${selectedMainCategory === 'All' ? '' : 'hidden'}`}
                data-tip="Please select a category first"
              >
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="select select-bordered w-full"
                  disabled={selectedMainCategory === 'All'}
                >
                  <option value="All">All Subcategories</option>
                  {filteredSubCategories.map((subCategory, index) => (
                    <option key={index} value={subCategory.subCategoryName}>
                      {subCategory.subCategoryName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedMainCategory !== 'All' && (
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="All">All Subcategories</option>
                  {filteredSubCategories.map((subCategory, index) => (
                    <option key={index} value={subCategory.subCategoryName}>
                      {subCategory.subCategoryName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DRAFT">Draft</option>
              <option value="FUNDRAISING_COMPLETED">Fundraising Completed</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>

            {/* Sort Order Filter */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Potential Projects Filter */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Show Potential Projects</span>
            <button
              onClick={() => setIsPotential(!isPotential)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${isPotential ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isPotential ? 'translate-x-5' : 'translate-x-1'
                  }`}
              ></span>
            </button>
          </div>

          {/* Search Button */}
          <div className="mt-4">
            <button
              onClick={handleSearch}
              className="btn bg-orange-500 hover:bg-orange-600 text-white w-full"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-1" />
              Search
            </button>
          </div>
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
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
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
                        <>
                          <button className="tooltip" data-tip="Suspend" onClick={() => handleSuspend(project.id)}>
                            <PauseIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
                          </button>
                        </>
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

      {/* Suspend Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300">
            <h3 className="text-xl font-bold text-error mb-4 flex items-center gap-2">
              <PauseIcon className="w-6 h-6" />
              Suspend Project
            </h3>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Enter reason..."
            />
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-error" onClick={confirmSuspend}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
