import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllRequest, responseRequest, responseTimeExtendRequest } from './requestSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { 
  PaperClipIcon, 
  EyeIcon, 
  MagnifyingGlassIcon, 
  FolderIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Request = () => {
  const dispatch = useDispatch();
  const { requests, status, error } = useSelector(state => state.request || { requests: [], error: null, status: 'idle' });

  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestType, setSelectedRequestType] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState('RESOLVED');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedStatus && selectedStatus !== 'ALL') queryParts.push(`status:eq:${selectedStatus}`);
    const query = queryParts.join(",");
    dispatch(getAllRequest({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
  }, [dispatch, searchTerm, selectedStatus, sortOrder]);

  const handleResponse = (requestId, requestType) => {
    setSelectedRequestId(requestId);
    setSelectedRequestType(requestType);
    setResponseStatus('RESOLVED'); // Default to RESOLVED
    setResponseMessage('');
    setIsModalOpen(true);
  };

  const confirmResponse = () => {
    if (!responseMessage.trim()) {
      toast.error("Please enter a response message.");
      return;
    }

    const payload = { 
      requestId: selectedRequestId, 
      response: responseMessage,
      status: responseStatus
    };

    // Use different API function based on request type
    const actionToDispatch = selectedRequestType === 'EXTEND_TIME' 
      ? responseTimeExtendRequest(payload)
      : responseRequest(payload);

    dispatch(actionToDispatch)
      .unwrap()
      .then(() => {
        toast.success(`Request ${responseStatus.toLowerCase()} successfully!`);
        setIsModalOpen(false);
        setResponseMessage('');
        setResponseStatus('RESOLVED');
        
        // Refresh the request list
        const queryParts = [];
        if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
        if (selectedStatus && selectedStatus !== 'ALL') queryParts.push(`status:eq:${selectedStatus}`);
        const query = queryParts.join(",");
        dispatch(getAllRequest({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
      })
      .catch((err) => {
        console.error('Response error:', err);
        toast.error('Failed to send response.');
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'DECLINE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'EXTEND_TIME':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'PROJECT_SUSPEND':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'STRIPE_ACCOUNT':
        return <CreditCardIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <FolderIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'EXTEND_TIME': return 'Time Extension';
      case 'PROJECT_SUSPEND': return 'Project Suspension';
      case 'STRIPE_ACCOUNT': return 'Stripe Account';
      default: return type?.replace('_', ' ') || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedStatus && selectedStatus !== 'ALL') queryParts.push(`status:eq:${selectedStatus}`);
    const query = queryParts.join(",");
    dispatch(getAllRequest({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Request Management</h2>
        
        {/* Search and Sort Section */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search requests by title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DECLINE">Declined</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Search
          </button>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {Array.isArray(requests) && requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  {/* Request Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      {getRequestTypeIcon(request.type)}
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                        {getRequestTypeLabel(request.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FolderIcon className="w-4 h-4 mr-1" />
                      <span className="font-medium mr-1">Project:</span>
                      <span>{request.projectTitle || 'N/A'}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Created:</span> {formatDate(request.createdAt)}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{request.description}</p>
                    
                    {request.type === 'EXTEND_TIME' && request.extendDay > 0 && (
                      <div className="mb-3 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Requesting {request.extendDay} days extension
                      </div>
                    )}
                    
                    {request.attachmentUrl && (
                      <div className="flex items-center space-x-2 mb-3">
                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                        <a 
                          href={request.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/app/request/${request.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Details
                    </Link>
                    
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => handleResponse(request.id, request.type)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Responding to Request with Status Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRequestType === 'EXTEND_TIME' 
                ? 'Respond to Time Extension Request' 
                : selectedRequestType === 'PROJECT_SUSPEND'
                ? 'Respond to Project Suspension Request'
                : 'Respond to Request'}
            </h3>
            
            {/* Status Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Response Status</label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setResponseStatus('RESOLVED')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    responseStatus === 'RESOLVED' 
                      ? 'bg-green-100 text-green-800 border-2 border-green-500' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setResponseStatus('DECLINE')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    responseStatus === 'DECLINE' 
                      ? 'bg-red-100 text-red-800 border-2 border-red-500' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Decline
                </button>
              </div>
            </div>
            
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
              placeholder="Enter your response..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmResponse}
                className={`px-4 py-2 ${responseStatus === 'RESOLVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md`}
              >
                {responseStatus === 'RESOLVED' ? 'Approve Request' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Request;