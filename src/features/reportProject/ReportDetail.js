import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReportById } from './reportSlice';
import Loading from '../../components/Loading';
import { 
  PaperClipIcon, 
  ArrowLeftIcon,
  ClockIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ReportDetail = () => {
  const { reportId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch report data from the store
  const { report, status, error } = useSelector((state) => state.report);

  useEffect(() => {
    if (reportId) {
      dispatch(getReportById(reportId))
        .finally(() => setIsLoading(false)); // Stop loading once the data is fetched
    }
  }, [dispatch, reportId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
          label: 'Pending Review'
        };
      case 'UNDER_REVIEW':
        return {
          icon: <DocumentMagnifyingGlassIcon className="w-5 h-5" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
          label: 'Under Review'
        };
      case 'RESOLVED':
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
          label: 'Resolved'
        };
      default:
        return {
          icon: <DocumentTextIcon className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
          label: status
        };
    }
  };

  if (isLoading || status === 'loading') return <Loading />;
  
  if (status === 'failed') return (
    <div className="min-h-screen bg-base-200 py-8 px-4 text-base-content flex items-center justify-center">
      <div className="max-w-md w-full bg-base-100 shadow-xl rounded-lg p-6">
        <div className="flex items-center justify-center text-error mb-4">
          <ExclamationTriangleIcon className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Error Loading Report</h2>
        <p className="text-center mb-4">{error}</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/app/report-project')}
            className="btn btn-primary"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-base-200 py-8 px-4 text-base-content flex items-center justify-center">
      <div className="max-w-md w-full bg-base-100 shadow-xl rounded-lg p-6">
        <div className="flex items-center justify-center text-gray-400 mb-4">
          <DocumentTextIcon className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Report Not Found</h2>
        <p className="text-center mb-4">The report you're looking for doesn't exist or has been removed.</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/app/report-project')}
            className="btn btn-primary"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );

  const statusDetails = getStatusDetails(report.status);

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4 text-base-content">
      <div className="max-w-4xl mx-auto">
        {/* Navigation and Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <button
            onClick={() => navigate('/app/report-project')}
            className="btn btn-outline btn-primary"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Reports
          </button>
          
          <div className={`px-4 py-2 rounded-full border flex items-center space-x-2 ${statusDetails.color}`}>
            {statusDetails.icon}
            <span className="font-medium">{statusDetails.label}</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-base-100 shadow-xl rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-base-300 dark:border-base-700">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{report.title || "Untitled Report"}</h1>
              
              <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1.5" />
                  <span>Submitted on {formatDate(report.createdAt)}</span>
                </div>
                
                {report.updatedAt && report.updatedAt !== report.createdAt && (
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    <span>Updated on {formatDate(report.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section - Vertical Layout */}
          <div className="p-6 space-y-8">
            {/* User Info & Metadata */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Reported By</h3>
              
              <div className="bg-base-200 dark:bg-base-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {report.user.userAvatar ? (
                    <img
                      src={report.user.userAvatar}
                      alt={report.user.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-base-300 dark:border-base-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircleIcon className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold">{report.user.fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.user.roles}
                    </p>
                    {report.user.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.user.email}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Attachment */}
                {report.attachmentUrl && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-500 dark:text-gray-400 uppercase text-sm">Attachments</h3>
                    <div className="bg-base-100 dark:bg-base-700 rounded-md p-3 flex items-center">
                      <PaperClipIcon className="w-5 h-5 text-primary mr-3" />
                      <a
                        href={report.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-focus hover:underline truncate flex-1"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Report Content */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Report Details</h3>
              
              <div className="bg-base-200 dark:bg-base-800 rounded-lg p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{report.description}</p>
                </div>
              </div>
            </div>

            {/* Response Section (if available) */}
            {report.response && (
              <div>
                <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Response</h3>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="font-medium text-green-800 dark:text-green-400">
                      Official Response
                    </h4>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{report.response}</p>
                  </div>
                  
                  {report.respondedAt && (
                    <div className="mt-4 text-sm text-green-700 dark:text-green-400 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>Responded on {formatDate(report.respondedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-t border-base-300 dark:border-base-700 p-6 flex justify-between items-center">
            <button
              onClick={() => navigate('/app/report-project')}
              className="btn btn-ghost"
            >
              Back to Reports
            </button>
            
            {/* Show action buttons based on status */}
            {report.status === 'PENDING' && (
              <button className="btn btn-info text-white">
                <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Mark for Review
              </button>
            )}
            
            {report.status === 'UNDER_REVIEW' && (
              <button className="btn btn-success text-white">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Respond to Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;