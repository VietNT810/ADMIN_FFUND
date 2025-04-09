import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReport, responseReport } from './reportSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { PaperClipIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Report = () => {
  const dispatch = useDispatch();
  const { reports, status, error } = useSelector(state => state.report || { reports: [], error: null, status: 'idle' });

  const [selectedReportId, setSelectedReportId] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedStatus) queryParts.push(`status:eq:${selectedStatus}`);
    const query = queryParts.join(",");
    dispatch(getAllReport({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
  }, [dispatch, searchTerm, selectedStatus, sortOrder]);

  const handleResponse = (reportId) => {
    setSelectedReportId(reportId);
    setIsModalOpen(true);
  };

  const confirmResponse = () => {
    if (responseMessage) {
      dispatch(responseReport({ reportId: selectedReportId, response: responseMessage }))
        .then(() => {
          toast.success('Response sent successfully!');
          setIsModalOpen(false);
          setResponseMessage('');
          dispatch(getAllReport({ query: `status:eq:${selectedStatus}`, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
        })
        .catch(() => {
          toast.error('Failed to send response.');
        });
    } else {
      alert("Please enter a response message.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'RESOLVED': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`title:eq:${searchTerm}`);
    if (selectedStatus) queryParts.push(`status:eq:${selectedStatus}`);
    const query = queryParts.join(",");
    dispatch(getAllReport({ query, page: 0, size: 10, sortField: 'createdAt', sortOrder }));
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
        {/* Search and Sort Section */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search reports by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
            className="input input-bordered w-64"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select select-bordered"
          >
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="select select-bordered"
          >
            <option value="asc">Newest to Oldest</option>
            <option value="desc">Oldest to Newest</option>
          </select>
          <button
            onClick={handleSearch}
            className="btn bg-orange-500 hover:bg-orange-600 dark:text-base-200 relative group"
          >
            <MagnifyingGlassIcon className="w-5 h-5 inline-block" />
            <span className="absolute left-1/2 transform -translate-x-1/2 top-12 text-sm text-base-content opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Search
            </span>
          </button>
        </div>

        {/* Report List */}
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="bg-base-200 shadow-md rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* User Avatar and Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <img
                        src={report.user.userAvatar || 'https://via.placeholder.com/40'}
                        alt={report.user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{report.user.fullName}</h3>
                        <p className="text-sm text-gray-500">{report.user.roles}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-700">{report.description}</p>
                  </div>

                  {/* Status and Attachment */}
                  <div className="flex flex-col items-end space-y-2">
                    {report.attachmentUrl && (
                      <div className="flex items-center space-x-2">
                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                        <a href={report.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Attachment
                        </a>
                      </div>
                    )}
                    <span className={`badge ${getStatusColor(report.status)}`}>{report.status}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Link
                    to={`/app/report-project/${report.id}`}
                    className="text-blue-600 hover:text-blue-800 relative group"
                  >
                    <EyeIcon className="w-5 h-5 inline-block" />
                    <span className="absolute left-1/2 transform -translate-x-1/2 top-12 text-sm text-base-content opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View Details
                    </span>
                  </Link>
                  {report.status === 'PENDING' && (
                    <button
                      onClick={() => handleResponse(report.id)}
                      className="btn btn-sm bg-green-500 hover:bg-green-600 dark:text-base-200"
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600">No reports available</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          {/* Pagination buttons here */}
        </div>
      </div>

      {/* Modal for Responding to Report */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Respond to Report</h3>
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

export default Report;
