import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, approveProject, rejectProject, assignManagerToProject } from './components/projectSlice';
import { EyeIcon, UserIcon, FolderIcon, CalendarIcon, MapPinIcon, UsersIcon, PhotoIcon, VideoCameraIcon, GlobeAltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
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
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const reasonInputRef = useRef(null);
  const [activeMediaType, setActiveMediaType] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (projects?.length) {
      const mediaPreferences = {};
      projects.forEach(project => {
        mediaPreferences[project.id] = imageErrors[project.id] ? 'video' : project.projectImage ? 'image' : 'video';
      });
      setActiveMediaType(mediaPreferences);
    }
  }, [projects, imageErrors]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await dispatch(getUsersContent({ query: 'roles:eq:MANAGER', size: 100 })).unwrap();

        await dispatch(getProjects({
          query: 'status:eq:PENDING_APPROVAL',
          sortField: 'createdAt',
          sortOrder: 'asc'
        })).unwrap();
      } catch (err) {
        toast.error('Error loading data: ' + (err.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const toggleMediaType = (projectId) => {
    setActiveMediaType(prev => ({
      ...prev,
      [projectId]: prev[projectId] === 'image' ? 'video' : 'image'
    }));
  };

  const handleImageError = (projectId) => {
    setImageErrors(prev => ({
      ...prev,
      [projectId]: true
    }));

    if (projects.find(p => p.id === projectId)?.projectVideoDemo) {
      setActiveMediaType(prev => ({
        ...prev,
        [projectId]: 'video'
      }));
    }
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const handleApprove = () => {
    dispatch(approveProject(selectedProjectId))
      .then((result) => {
        if (result.error) {
          toast.error(result.payload || "An error occurred while processing the project.");
        } else {
          setShowConfirmation(false);
          toast.success(result.payload);
          dispatch(getProjects({ query: 'status:eq:PENDING_APPROVAL', sortField: 'createdAt', sortOrder: 'asc' }));
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
          dispatch(getProjects({ query: 'status:eq:PENDING_APPROVAL', sortField: 'createdAt', sortOrder: 'asc' }));
        })
        .catch(() => {
          toast.error('Failed to reject project.');
        });
    } else {
      toast.error("Rejection reason is required.");
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
            dispatch(getProjects({ query: 'status:eq:PENDING_APPROVAL', sortField: 'createdAt', sortOrder: 'asc' }));
          }
        })
        .catch(() => {
          toast.error('Failed to assign manager.');
        });
    } else {
      toast.error("Please select a manager to assign.");
    }
  };

  const confirmAction = (action, projectId) => {
    setActionType(action);
    setSelectedProjectId(projectId);
    setSelectedProject(projects.find(p => p.id === projectId));
    setSelectedManagerId(null);
    setShowConfirmation(true);
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setSelectedProjectId(null);
    setSelectedProject(null);
    setSelectedManagerId(null);
  };

  const filteredProjects = projects.filter(project =>
    project.status === 'PENDING_APPROVAL' &&
    (project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.team?.teamName || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading || status === 'loading') {
    return <Loading />;
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800 max-w-lg w-full shadow-md">
          <h3 className="text-lg font-medium mb-2">Error Loading Projects</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 text-base-content">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">Project Requests</h1>
          <p className="text-base-content/70 mt-2">Review and manage project requests that need manager assignment</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-base-100 rounded-lg shadow-md mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base-content/70">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Media Preview Section */}
                  <div className="relative h-52 bg-gray-100 border-b border-gray-200">
                    {activeMediaType[project.id] === 'image' && project.projectImage ? (
                      <img
                        src={project.projectImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(project.id)}
                      />
                    ) : project.projectVideoDemo && getYoutubeVideoId(project.projectVideoDemo) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(project.projectVideoDemo)}`}
                        title={project.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <PhotoIcon className="h-16 w-16 text-gray-400" />
                        <p className="text-gray-500 mt-2">No media available</p>
                      </div>
                    )}

                    {/* Media Switcher */}
                    {(project.projectImage && !imageErrors[project.id] && project.projectVideoDemo) && (
                      <div className="absolute bottom-3 right-3 z-10 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <button
                          onClick={() => toggleMediaType(project.id)}
                          className={`p-2 ${activeMediaType[project.id] === 'image' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                          title="Show Image"
                        >
                          <PhotoIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleMediaType(project.id)}
                          className={`p-2 ${activeMediaType[project.id] === 'video' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                          title="Show Video"
                        >
                          <VideoCameraIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Manager Badge if assigned */}
                    {project.managerId && (
                      <div className="absolute top-3 left-3 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                        <UserIcon className="w-3 h-3" />
                        <span>Manager: {project.managerName}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <div className="mb-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{project.location?.replace('_', ' ') || "No Location"}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <GlobeAltIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                          {project.projectUrl ? new URL(project.projectUrl).hostname : "No URL"}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatCurrency(project.totalTargetAmount)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center space-x-2">
                      <Link
                        to={`/app/project-details/${project.id}`}
                        className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0"
                      >
                        <EyeIcon className="w-3.5 h-3.5 mr-1" />
                        View Details
                      </Link>
                      <button
                        onClick={() => confirmAction('assign', project.id)}
                        className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex-shrink-0"
                      >
                        <UserIcon className="w-3.5 h-3.5 mr-1" />
                        {project.managerId ? 'Reassign' : 'Assign'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "No projects match your search criteria" : "There are no projects requiring manager assignment"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            className="bg-base-100 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-medium text-base-content">
                {actionType === 'approve' ? 'Approve Project' : actionType === 'reject' ? 'Reject Project' : 'Assign Manager'}
              </h3>
              <button
                onClick={cancelAction}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              {selectedProject && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedProject.title}</h4>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Team: {selectedProject.team?.teamName || "No Team"}</p>
                    <p>Location: {selectedProject.location || "No Location"}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-base-content mb-4">
                {actionType === 'assign'
                  ? 'Please select a manager to assign to this project. The manager will be responsible for overseeing the project progress and deliverables.'
                  : `Are you sure you want to ${actionType} this project?`
                }
              </p>

              {actionType === 'reject' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-base-content mb-2">Rejection Reason</label>
                  <textarea
                    ref={reasonInputRef}
                    className="w-full p-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none resize-none transition-all"
                    placeholder="Please provide a detailed reason for rejection"
                    rows="4"
                  />
                </div>
              )}

              {actionType === 'assign' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-base-content mb-2">Assign Manager</label>
                  <div className="relative">
                    <select
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full p-3 pr-10 border border-base-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none text-base-content transition-all cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a Manager</option>
                      {users && users.length > 0 ? (
                        users.map((user) => (
                          <option key={user.id} value={user.id}>{user.fullName}</option>
                        ))
                      ) : (
                        <option value="" disabled>No managers available</option>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {users && users.length === 0 && (
                    <p className="mt-2 text-sm text-red-500">No managers are available in the system.</p>
                  )}
                </div>
              )}

              <div className="flex justify-end items-center space-x-3 mt-6">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 border border-base-300 text-base-content bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={actionType === 'approve' ? handleApprove : actionType === 'reject' ? handleReject : handleAssignManager}
                  disabled={actionType === 'reject' && (!reasonInputRef?.current?.value || reasonInputRef?.current?.value.trim() === '') ||
                    (actionType === 'assign' && !selectedManagerId)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : actionType === 'reject'
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    } ${((actionType === 'reject' && (!reasonInputRef?.current?.value || reasonInputRef?.current?.value.trim() === '')) ||
                      (actionType === 'assign' && !selectedManagerId))
                      ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Assign Manager'}
                </button>
              </div>
            </div>

            {status === 'loading' && (
              <div className="absolute inset-0 bg-base-100 bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-400 border-t-transparent"></div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;