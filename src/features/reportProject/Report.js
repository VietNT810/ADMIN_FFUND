import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReport, responseReport, approveReportForUnderReview } from './reportSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import {
  PaperClipIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Report = () => {
  const dispatch = useDispatch();
  const { reports, status, error } = useSelector(state => state.report || { reports: [], error: null, status: 'idle' });

  const [selectedReportId, setSelectedReportId] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState('RESOLVED');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [sortOrder, setSortOrder] = useState('asc');
  const [responseError, setResponseError] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState({});

  useEffect(() => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedStatus && selectedStatus !== 'ALL') queryParts.push(`status:eq:${selectedStatus}`);
    const query = queryParts.join(",");
    dispatch(getAllReport({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
  }, [dispatch, searchTerm, selectedStatus, sortOrder]);

  const handleResponse = (reportId) => {
    setSelectedReportId(reportId);
    setResponseStatus('RESOLVED'); // Default to RESOLVED
    setResponseError('');
    setResponseMessage('');
    setIsModalOpen(true);
  };

  const handleAvatarError = (userId) => {
    setAvatarErrors(prev => ({ ...prev, [userId]: true }));
  };

  const handleApproveForReview = (reportId) => {
    setIsProcessingApproval(prev => ({ ...prev, [reportId]: true }));

    const payload = {
      reportId,
      data: {
        status: "UNDER_REVIEW"
      }
    };

    dispatch(approveReportForUnderReview(payload))
      .unwrap()
      .then(() => {
        toast.success('Report marked for review successfully');

        dispatch(getAllReport({
          query: selectedStatus !== 'ALL' ? `status:eq:${selectedStatus}` : '',
          page: 0,
          size: 10,
          sortField: 'createdAt',
          sortOrder
        }));
      })
      .catch((err) => {
        console.error('Approval error:', err);
        toast.error('Failed to mark report for review');
      })
      .finally(() => {
        setIsProcessingApproval(prev => ({ ...prev, [reportId]: false }));
      });
  };

  const confirmResponse = () => {
    setResponseError('');

    if (!responseMessage.trim()) {
      setResponseError('Response message cannot be empty');
      return;
    }

    const payload = {
      reportId: selectedReportId,
      data: {
        status: responseStatus,
        reason: responseMessage
      }
    };

    dispatch(responseReport(payload))
      .unwrap()
      .then(() => {
        toast.success(`Report ${responseStatus.toLowerCase()} successfully!`);
        setIsModalOpen(false);
        setResponseMessage('');
        setResponseStatus('RESOLVED');
        dispatch(getAllReport({
          query: selectedStatus !== 'ALL' ? `status:eq:${selectedStatus}` : '',
          page: 0,
          size: 10,
          sortField: 'createdAt',
          sortOrder
        }));
      })
      .catch((err) => {
        console.error('Response error:', err);
        if (err?.error === "Report must be under review to respond") {
          setResponseError("This report must be under review status before responding");
        } else if (err?.reason) {
          setResponseError(err.reason);
        } else if (err?.error?.reason) {
          setResponseError(err.error.reason);
        } else if (typeof err?.error === 'string') {
          setResponseError(err.error);
        } else {
          setResponseError('Failed to send response. Please try again.');
        }
        toast.error('Failed to send response.');
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-4 h-4 mr-1" />;
      case 'UNDER_REVIEW':
        return <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-1" />;
      case 'RESOLVED':
        return <CheckCircleIcon className="w-4 h-4 mr-1" />;
      case 'REJECTED':
        return <XCircleIcon className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedStatus && selectedStatus !== 'ALL') queryParts.push(`status:eq:${selectedStatus}`);
    const query = queryParts.join(",");
    dispatch(getAllReport({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderUserAvatar = (user) => {
    if (avatarErrors[user.id] || !user.userAvatar) {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-200 border-2 border-base-300 dark:border-base-700">
          <span className="text-yellow-600 text-lg font-bold">
            {user.fullName?.charAt(0) || 'U'}
          </span>
        </div>
      );
    }
    return (
      <img
        src={user.userAvatar}
        alt={user.fullName}
        className="w-10 h-10 rounded-full object-cover border-2 border-base-300 dark:border-base-700"
        onError={() => handleAvatarError(user.id)}
      />
    );
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content flex items-center justify-center">
      <div className="alert alert-error max-w-lg shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className="font-bold">Error</h3>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 text-base-content">
      <div className="max-w-7xl mx-auto">
        <div className="bg-base-100 shadow-xl rounded-xl overflow-hidden">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-base-300 dark:border-base-700">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-grow md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reports by title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  className="input input-bordered w-full pl-10 bg-base-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="btn btn-outline btn-primary"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                Filters
              </button>

              <button
                onClick={handleSearch}
                className="btn btn-primary"
              >
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Search
              </button>
            </div>

            {isFilterOpen && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg flex flex-wrap gap-4 items-center">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Status</span>
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option value="ALL">All Reports</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Sort By</span>
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option value="asc">Newest to Oldest</option>
                    <option value="desc">Oldest to Newest</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn btn-ghost self-end"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Close Filters
                </button>
              </div>
            )}
          </div>

          {/* Report List */}
          <div className="p-6">
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-base-200 hover:bg-base-300 dark:hover:bg-base-700 transition-colors duration-200 shadow-md rounded-lg overflow-hidden"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* User Info & Report Content */}
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-3">
                            {renderUserAvatar(report.user)}
                            <div>
                              <h3 className="font-semibold">{report.user.fullName}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>{report.user.roles}</span>
                                <span>•</span>
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="text-lg font-medium mb-2">{report.title || "Untitled Report"}</h4>
                            <p className="text-gray-700 dark:text-gray-300">{report.description}</p>
                          </div>

                          {report.attachmentUrl && (
                            <div className="flex items-center space-x-2 mb-4 text-primary hover:text-primary-focus">
                              <PaperClipIcon className="w-5 h-5" />
                              <a
                                href={report.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:underline"
                              >
                                View Attachment
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col md:items-end space-y-3 md:min-w-[200px]">
                          <div className={`px-3 py-1.5 rounded-full flex items-center justify-center ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="font-medium">{report.status}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/app/report-project/${report.id}`}
                              className="btn btn-sm btn-outline btn-primary"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View Details
                            </Link>

                            {report.status === 'PENDING' && (
                              <button
                                onClick={() => handleApproveForReview(report.id)}
                                disabled={isProcessingApproval[report.id]}
                                className="btn btn-sm btn-info text-white"
                              >
                                {isProcessingApproval[report.id] ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <>
                                    <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-1" />
                                    Mark for Review
                                  </>
                                )}
                              </button>
                            )}

                            {report.status === 'UNDER_REVIEW' && (
                              <button
                                onClick={() => handleResponse(report.id)}
                                className="btn btn-sm btn-success text-white"
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Respond
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-300 dark:bg-base-700 mb-4">
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No reports available</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedStatus !== 'ALL'
                      ? "Try adjusting your search filters"
                      : "No reports have been submitted yet"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="border-t border-base-300 dark:border-base-700 p-4 flex justify-center">
            {/* Pagination placeholder - you can implement actual pagination here */}
            <div className="join">
              <button className="join-item btn btn-sm btn-disabled">Previous</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm btn-disabled">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Responding to Report */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md mx-4 animate-fadeIn">
            <div className="p-6 border-b border-base-300 dark:border-base-700">
              <h3 className="text-xl font-bold">Respond to Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select a response status and provide details
              </p>
            </div>

            <div className="p-6">
              {/* Status Selection */}
              <div className="mb-4">
                <label className="label">
                  <span className="label-text font-medium">Select Response Status</span>
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setResponseStatus('RESOLVED')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${responseStatus === 'RESOLVED'
                      ? 'bg-green-100 text-green-800 border-2 border-green-500 dark:bg-green-900 dark:text-green-200 dark:border-green-500'
                      : 'bg-base-200 border border-base-300 text-base-content hover:bg-base-300 dark:bg-base-700 dark:border-base-600 dark:hover:bg-base-600'
                      }`}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponseStatus('REJECTED')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${responseStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-800 border-2 border-red-500 dark:bg-red-900 dark:text-red-200 dark:border-red-500'
                      : 'bg-base-200 border border-base-300 text-base-content hover:bg-base-300 dark:bg-base-700 dark:border-base-600 dark:hover:bg-base-600'
                      }`}
                  >
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Reject
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Response Message</span>
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className={`textarea textarea-bordered min-h-32 w-full focus:textarea-primary ${responseError ? 'textarea-error' : ''}`}
                  placeholder="Enter your detailed response..."
                />
                {responseError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{responseError}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-base-300 dark:border-base-700 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmResponse}
                className={`btn ${responseStatus === 'RESOLVED' ? 'btn-success' : 'btn-error'}`}
              >
                {responseStatus === 'RESOLVED' ? 'Resolve Report' : 'Reject Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;