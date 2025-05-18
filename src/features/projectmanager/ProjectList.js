import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, suspendProject, completeProject, getProjectStatistics, getProjectsManager, approveSuspendedProject } from './components/projectSlice';
import { getCategoriesContent } from '../category/categorySlice';
import { MagnifyingGlassIcon, EyeIcon, PauseIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { getViolationsByManager } from '../violation/components/violationSlice';

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, status, error, totalPages, statistics } = useSelector(state => state.project || { projects: [], error: null, status: 'idle', statistics: null });
  const { categories } = useSelector(state => state.category || { categories: [] });

  // Filter state that will be applied on search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [isPotential, setIsPotential] = useState(false);

  // Current applied filters (only updated when search/apply is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    mainCategory: 'All',
    subCategory: 'All',
    status: 'PENDING_APPROVAL', // Default for MANAGER
    isPotential: false,
    page: 0
  });

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userRole = localStorage.getItem('role');

  useEffect(() => {
    dispatch(getCategoriesContent());

    // Initial load - use default filters based on role
    if (userRole === 'MANAGER') {
      setSelectedStatus('PENDING_APPROVAL');
      setAppliedFilters(prev => ({ ...prev, status: 'PENDING_APPROVAL' }));
      dispatch(getProjectsManager({
        query: `status:eq:PENDING_APPROVAL`,
        page: 0,
        size: 10,
        sortField,
        sortOrder
      }));
    } else {
      setSelectedStatus('APPROVED');
      setAppliedFilters(prev => ({ ...prev, status: 'APPROVED' }));
      dispatch(getProjects({
        query: `status:eq:APPROVED`,
        page: 0,
        size: 10,
        sortField,
        sortOrder
      }));
      dispatch(getProjectStatistics());
    }
  }, [dispatch, sortField, sortOrder, userRole]);

  // Only triggered when pagination changes or explicit search
  useEffect(() => {
    if (appliedFilters.page !== page) {
      handleSearch(true);
    }
  }, [page]);

  const buildQueryFromFilters = () => {
    const queryParts = [];

    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedMainCategory !== "All") queryParts.push(`category.name:eq:${selectedMainCategory}`);
    if (selectedSubCategory !== "All") queryParts.push(`subCategories.subCategory.name:eq:${selectedSubCategory}`);
    if (selectedStatus) queryParts.push(`status:eq:${selectedStatus}`);
    if (isPotential) queryParts.push(`isPotential:true`);

    return queryParts.join(",");
  };

  const handleSearch = (isPaginationChange = false) => {
    setIsLoading(true);

    // If pagination change, use current applied filters but update page
    const currentPage = isPaginationChange ? page : 0;
    if (!isPaginationChange) setPage(0);

    // Update applied filters
    setAppliedFilters({
      searchTerm,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      status: selectedStatus,
      isPotential,
      page: currentPage
    });

    const query = buildQueryFromFilters();

    const searchPromise = userRole === 'MANAGER'
      ? dispatch(getProjectsManager({
        query: query || undefined,
        page: currentPage,
        size: 10,
        sortField,
        sortOrder
      }))
      : dispatch(getProjects({
        query: query || undefined,
        page: currentPage,
        size: 10,
        sortField,
        sortOrder
      }));

    searchPromise.then(() => {
      setIsLoading(false);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const handleSuspend = async (projectId) => {
    try {
      setIsLoading(true);
      const violationsResult = await dispatch(getViolationsByManager(projectId)).unwrap();
      setIsLoading(false);

      if (!violationsResult || !violationsResult.length || violationsResult.length === 0) {
        const confirm = window.confirm(
          "No violations have been recorded for this project. You need to add at least one violation before suspending a project. Would you like to navigate to the Violations tab to add a violation now?"
        );

        if (confirm) {
          navigate(`/app/project-scoring/${projectId}?tab=violations`);
        }
        return;
      }

      setSelectedProjectId(projectId);
      setIsModalOpen(true);

    } catch (error) {
      setIsLoading(false);
      toast.error("Error checking violations: " + (error.message || "Please try again"));
      console.error("Error checking violations:", error);
    }
  };

  const confirmSuspend = async () => {
    if (suspendReason) {
      try {
        await dispatch(suspendProject({
          projectId: selectedProjectId,
          reason: suspendReason
        })).unwrap();

        toast.success('Project suspended successfully!');
        setIsModalOpen(false);
        setSuspendReason('');
        handleSearch();
      } catch (error) {
        toast.error(error || 'Error suspending project. Please try again.');
        console.error('Suspend project error:', error);
      }
    } else {
      toast.warning("Please enter a reason for suspending the project.");
    }
  };

  const handleApproveSuspended = (projectId) => {
    setSelectedProjectId(projectId);
    setApproveModalOpen(true);
  };

  const confirmApproveSuspended = async () => {
    try {
      await dispatch(approveSuspendedProject(selectedProjectId)).unwrap();
      toast.success('Project has been approved and is now active!');
      setApproveModalOpen(false);
      handleSearch();
    } catch (error) {
      toast.error(error || 'Error approving suspended project. Please try again.');
      console.error('Approve suspended project error:', error);
    }
  };

  const handleComplete = (projectId) => {
    setSelectedProjectId(projectId);
    setCompleteModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'FUNDRAISING_COMPLETED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'RESUBMIT':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

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
        <div className="mb-6 bg-base-100 p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-orange-500" />
            Filter Projects
          </h3>

          {/* Search Bar */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 block mb-1">Project Title</label>
            <input
              type="text"
              placeholder="Search by project title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input input-bordered w-full"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Main Category</label>
              <select
                value={selectedMainCategory}
                onChange={(e) => {
                  setSelectedMainCategory(e.target.value);
                  setSelectedSubCategory('All'); // Reset subCategory when category changes
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
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Subcategory</label>
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
            <div>
              <label className="text-sm text-gray-600 block mb-1">Project Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">All Projects</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="RESUBMIT">Resubmit</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
                <option value="FUNDRAISING_COMPLETED">Fundraising Completed</option>
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </select>
            </div>

            {/* Sort Order Filter */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Sort Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Potential Projects Filter */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Show Potential Projects</span>
            <button
              onClick={() => setIsPotential(!isPotential)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${isPotential ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isPotential ? 'translate-x-5' : 'translate-x-1'}`}
              ></span>
            </button>
          </div>

          {/* Apply Filter Button */}
          <div className="mt-6">
            <button
              onClick={() => handleSearch()}
              className="btn bg-orange-500 hover:bg-orange-600 text-white w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying Filters...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Apply Filters
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="overflow-x-auto">
                <table className="table w-full bg-base-100 shadow-md rounded-lg border">
                  <thead className="bg-base-200 text-sm font-semibold text-base-content border-b">
                    <tr>
                      <th className="px-4 py-3">ID</th>
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
                        className="hover:bg-base-100 transition border-b"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-4 py-2 text-sm">{project.id}</td>
                        <td className="px-4 py-2 text-sm font-medium">{project.title}</td>
                        <td className="px-4 py-2 text-sm">{project.teamName || "No Team"}</td>
                        <td className="px-4 py-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{project.location}</td>
                        <td className="px-4 py-2 text-sm">{new Date(project.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-start gap-3">
                            {userRole === 'MANAGER' ? (
                              <Link to={`/app/project-scoring/${project.id}`} className="tooltip" data-tip="Score">
                                <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                              </Link>
                            ) : (
                              <Link to={`/app/project-details/${project.id}`} className="tooltip" data-tip="View">
                                <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                              </Link>
                            )}

                            {/* Action buttons that change based on project status */}
                            {project.status === 'APPROVED' && (
                              <button className="tooltip" data-tip="Suspend" onClick={() => handleSuspend(project.id)}>
                                <PauseIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
                              </button>
                            )}

                            {project.status === 'SUSPENDED' && (
                              <button className="tooltip" data-tip="Approve Suspended" onClick={() => handleApproveSuspended(project.id)}>
                                <CheckCircleIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
                              </button>
                            )}

                            {/* Placeholder for consistent spacing when neither button is present */}
                            {project.status !== 'APPROVED' && project.status !== 'SUSPENDED' && (
                              <div className="w-5"></div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="text-center text-base-content py-8">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="text-lg text-gray-600">No projects available</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suspend Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <motion.div
            className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
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
              <button className="btn btn-ghost" onClick={() => {
                setIsModalOpen(false);
                setSuspendReason('');
              }}>Cancel</button>
              <button className="btn btn-error" onClick={confirmSuspend}>Confirm</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Approve Suspended Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <motion.div
            className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-bold text-success mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6" />
              Approve Suspended Project
            </h3>
            <p className="mb-4 text-gray-700">
              This will reactivate the suspended project and make it visible to users again.
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={() => setApproveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={confirmApproveSuspended}
              >
                Confirm Approval
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;