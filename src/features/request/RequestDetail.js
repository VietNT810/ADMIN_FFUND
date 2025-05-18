import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRequestById, responseRequest } from './requestSlice';
import Loading from '../../components/Loading';
import { PaperClipIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify'; // Ensure you have react-toastify installed

const RequestDetail = () => {
  const { requestId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  // Fetch request data from the store
  const { request, status, error } = useSelector((state) => state.request);

  const handleResponse = () => {
    setIsModalOpen(true);
  };

  const confirmResponse = () => {
    if (responseMessage) {
      dispatch(responseRequest({ requestId, response: responseMessage }))
        .then(() => {
          toast.success('Response sent successfully!');
          setIsModalOpen(false);
          setResponseMessage('');
          navigate('/app/request'); // Navigate to request list after successful response
        })
        .catch(() => {
          toast.error('Failed to send response.');
        });
    } else {
      toast.error("Please enter a response message.");
    }
  };

  useEffect(() => {
    if (requestId) {
      dispatch(getRequestById(requestId))
        .finally(() => setIsLoading(false)); // Stop loading once the data is fetched
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

  if (isLoading || status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
        {request ? (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => navigate('/app/request')}
              className="btn btn-ghost"
            >
              Back
            </button>

            {/* Request Information */}
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-gray-800">{request.title || 'Untitled Request'}</h2>
              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
              <p className="text-base text-gray-700">{request.description || 'No description provided'}</p>

              {/* User Information */}
              {request.user ? (
                <div className="flex items-center space-x-4 my-4">
                  {request.user.userAvatar ? (
                    <img
                      src={request.user.userAvatar}
                      alt={request.user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserCircleIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{request.user.fullName || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-600">{request.user.roles || 'N/A'}</p>
                    {request.user.email && <p className="text-sm text-gray-500">{request.user.email}</p>}
                    {request.user.telephoneNumber && <p className="text-sm text-gray-500">{request.user.telephoneNumber}</p>}
                    {request.user.userFfundLink && (
                      <a href={request.user.userFfundLink} className="text-blue-500 text-sm">
                        Profile Link
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 my-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Unknown User</h3>
                    <p className="text-sm text-gray-600">No user information available</p>
                  </div>
                </div>
              )}

              {/* Request Type and Response */}
              <div className="flex flex-col space-y-2">
                <span className="text-lg font-medium text-gray-600">
                  Type: {request.type ? request.type.replace('_', ' ') : 'Unknown'}
                </span>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <h4 className="font-semibold text-gray-700">Response</h4>
                  <p className="text-gray-800">{request.response || "No response yet"}</p>
                </div>
              </div>

              {/* Status and Attachment */}
              <div className="flex flex-col items-end space-y-2 mt-4">
                {request.attachmentUrl && (
                  <div className="flex items-center space-x-2">
                    <PaperClipIcon className="w-5 h-5 text-gray-500" />
                    <a
                      href={request.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
                <span className={`badge ${request.status === 'PENDING' ? 'badge-warning' : request.status === 'EXTEND_TIME' ? 'badge-info' : 'badge-success'}`}>
                  {request.status}
                </span>
              </div>
            </div>

            {/* Response Button */}
            {request.status === 'PENDING' && (
              <button
                onClick={handleResponse}
                className="btn bg-green-500 hover:bg-green-600 text-white mt-6"
              >
                Respond
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-600">No request found</div>
        )}
      </div>

      {/* Modal for Responding to Request */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Respond to Request</h3>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Enter your response..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmResponse}
                className="btn btn-success"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;