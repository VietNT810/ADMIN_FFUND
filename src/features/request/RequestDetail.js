import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRequestById, responseRequest, responseTimeExtendRequest } from './requestSlice';
import Loading from '../../components/Loading';
import { 
  PaperClipIcon, 
  BuildingOfficeIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const RequestDetail = () => {
  const { requestId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState('RESOLVED');

  // Fetch request data from the store
  const { request, status, error } = useSelector((state) => state.request);

  const handleResponse = () => {
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
      requestId: requestId, 
      response: responseMessage,
      status: responseStatus
    };

    // Use different API function based on request type
    const actionToDispatch = request.type === 'EXTEND_TIME' 
      ? responseTimeExtendRequest(payload)
      : responseRequest(payload);

    dispatch(actionToDispatch)
      .unwrap()
      .then(() => {
        toast.success(`Request ${responseStatus.toLowerCase()} successfully!`);
        setIsModalOpen(false);
        setResponseMessage('');
        dispatch(getRequestById(requestId)); // Refresh the request data
      })
      .catch((err) => {
        console.error('Response error:', err);
        toast.error('Failed to send response.');
      });
  };

  useEffect(() => {
    if (requestId) {
      dispatch(getRequestById(requestId))
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, requestId]);

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

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'EXTEND_TIME':
        return <ClockIcon className="w-6 h-6 text-blue-500" />;
      case 'PROJECT_SUSPEND':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case 'STRIPE_ACCOUNT':
        return <CreditCardIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <BuildingOfficeIcon className="w-6 h-6 text-gray-500" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'DECLINE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || status === 'loading') return <Loading />;
  if (status === 'failed') return (
    <div className="min-h-screen bg-base-200 py-6 px-4 flex items-center justify-center">
      <div className="alert alert-error max-w-lg shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-base-200 py-6 px-4 flex items-center justify-center">
      <div className="alert alert-warning max-w-lg shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Request not found</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header with back button */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/app/request')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Requests
          </button>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </div>
        </div>
        
        <div className="p-6">
          {/* Request Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              {getRequestTypeIcon(request.type)}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {getRequestTypeLabel(request.type)}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title || 'Untitled Request'}</h1>
            
            <div className="text-sm text-gray-500 mb-4">
              <span>Submitted on {formatDate(request.createdAt)}</span>
              {request.updatedAt && request.updatedAt !== request.createdAt && (
                <span className="ml-3">· Updated on {formatDate(request.updatedAt)}</span>
              )}
            </div>
          </div>

          {/* Project Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-md">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">{request.projectTitle}</h3>
                  
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Project ID:</strong> {request.projectId}</p>
                    
                    {request.type === 'EXTEND_TIME' && request.extendDay > 0 && (
                      <div className="mt-3 flex items-center text-blue-600">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Requesting {request.extendDay} days extension</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-gray-700 whitespace-pre-line">{request.description || 'No description provided'}</p>
              
              {request.attachmentUrl && (
                <div className="mt-4 flex items-center">
                  <PaperClipIcon className="w-5 h-5 text-gray-500 mr-2" />
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
          </div>

          {/* Response Section - if there's a response */}
          {request.response && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response</h2>
              
              <div className={`border rounded-lg p-5 ${
                request.status === 'RESOLVED' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {request.status === 'RESOLVED' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    request.status === 'RESOLVED' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Official Response ({request.status})
                  </span>
                </div>
                
                <p className="text-gray-700 whitespace-pre-line">{request.response}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {request.status === 'PENDING' && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleResponse}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                Respond to Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Responding to Request */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Respond to Request</h3>
              <p className="text-sm text-gray-500 mt-1">
                {request.type === 'EXTEND_TIME' 
                  ? 'Respond to time extension request'
                  : `Respond to ${getRequestTypeLabel(request.type).toLowerCase()} request`}
              </p>
            </div>
            
            <div className="p-6">
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
              
              <div className="mb-4">
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  id="response"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your detailed response..."
                ></textarea>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmResponse}
                className={`px-4 py-2 rounded-md text-white ${
                  responseStatus === 'RESOLVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
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

export default RequestDetail;