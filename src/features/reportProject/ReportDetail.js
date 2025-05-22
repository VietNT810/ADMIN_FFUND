import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReportById } from './reportSlice';
import { getProjectById } from '../projectmanager/components/projectSlice';
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
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  StarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const ReportDetail = () => {
  const { reportId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);

  // Get report data from the store
  const { report, status, error } = useSelector((state) => state.report);
  
  // Get project data from the store
  const { currentProject } = useSelector((state) => state.project);

  useEffect(() => {
    if (reportId) {
      dispatch(getReportById(reportId))
        .unwrap()
        .then((data) => {
          if (data && data.projectId) {
            setProjectLoading(true);
            dispatch(getProjectById(data.projectId))
              .finally(() => setProjectLoading(false));
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, reportId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
      case 'REJECTED':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
          label: 'Rejected'
        };
      default:
        return {
          icon: <DocumentTextIcon className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
          label: status || 'Unknown'
        };
    }
  };

  const renderUserAvatar = (user) => {
    if (avatarError || !user?.userAvatar) {
      return (
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 border-2 border-base-300 dark:border-base-700">
          <span className="text-gray-600 text-xl font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </span>
        </div>
      );
    }

    return (
      <img
        src={user.userAvatar}
        alt={user.fullName}
        className="w-14 h-14 rounded-full object-cover border-2 border-base-300 dark:border-base-700"
        onError={() => setAvatarError(true)}
      />
    );
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'OBSCENE_CONTENT': return 'Obscene Content';
      case 'MISINFORMATION': return 'Misinformation';
      case 'FRAUD_SCAM': return 'Fraud or Scam';
      case 'COPYRIGHT_VIOLATION': return 'Copyright Violation';
      case 'PRIVACY_VIOLATION': return 'Privacy Violation';
      case 'OTHER': return 'Other Issue';
      default: return type?.replace('_', ' ') || 'Unknown';
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
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {getReportTypeLabel(report.type)}
                </span>
                {report.priority && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {report.priority} Priority
                  </span>
                )}
              </div>
              
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
            {/* Project Information */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Project Information</h3>
              
              <div className="bg-base-200 dark:bg-base-800 rounded-lg p-4">
                {projectLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="loading loading-spinner loading-md text-primary"></div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <BuildingOfficeIcon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {currentProject?.title || report.projectTitle || "Unnamed Project"}
                        </h3>
                        <Link 
                          to={`/app/project-scoring/${report.projectId}`}
                          className="btn btn-sm btn-primary flex items-center gap-1"
                        >
                          View Detail
                        </Link>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {currentProject?.category && (
                          <div className="flex items-center">
                            <TagIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium">{currentProject.category.name}</span>
                          </div>
                        )}
                        
                        {currentProject?.subCategories && currentProject.subCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {currentProject.subCategories.map(sub => (
                              <span 
                                key={sub.id} 
                                className="px-2 py-1 bg-base-300 dark:bg-base-700 rounded text-xs"
                              >
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <span className="font-medium">Project ID:</span> {report.projectId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Reported By */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Reported By</h3>
              
              <div className="bg-base-200 dark:bg-base-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-1">
                  {report.user && renderUserAvatar(report.user)}
                  
                  <div>
                    <h3 className="font-semibold">{report.user?.fullName || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.user?.roles || 'User'}
                    </p>
                    {report.user?.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Report Details</h3>
              
              <div className="bg-base-200 dark:bg-base-800 rounded-lg p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{report.description}</p>
                </div>
                
                {report.attachmentUrl && (
                  <div className="mt-4 flex items-center">
                    <PaperClipIcon className="w-5 h-5 text-primary mr-2" />
                    <a
                      href={report.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-focus hover:underline"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Response Section (if available) */}
            {report.response && (
              <div>
                <h3 className="font-medium mb-4 text-gray-500 dark:text-gray-400 uppercase text-sm">Response</h3>
                
                <div className={`bg-${report.status === 'RESOLVED' ? 'green' : 'red'}-50 dark:bg-${report.status === 'RESOLVED' ? 'green' : 'red'}-900/20 border border-${report.status === 'RESOLVED' ? 'green' : 'red'}-100 dark:border-${report.status === 'RESOLVED' ? 'green' : 'red'}-900 rounded-lg p-6`}>
                  <div className="flex items-center mb-4">
                    {report.status === 'RESOLVED' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    )}
                    <h4 className={`font-medium text-${report.status === 'RESOLVED' ? 'green' : 'red'}-800 dark:text-${report.status === 'RESOLVED' ? 'green' : 'red'}-400`}>
                      Official Response ({report.status})
                    </h4>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{report.response}</p>
                  </div>
                  
                  {report.resolvedAt && (
                    <div className={`mt-4 text-sm text-${report.status === 'RESOLVED' ? 'green' : 'red'}-700 dark:text-${report.status === 'RESOLVED' ? 'green' : 'red'}-400 flex items-center`}>
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>Responded on {formatDate(report.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-t border-base-300 dark:border-base-700 p-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/app/report-project')}
                className="btn btn-ghost"
              >
                Back to Reports
              </button>
              
              <Link 
                to={`/app/project-scoring/${report.projectId}`}
                className="btn btn-outline btn-primary"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                Go to Project Scoring
              </Link>
            </div>
            
            {/* Show action buttons based on status */}
            {report.status === 'PENDING' && (
              <button 
                onClick={() => navigate('/app/report-project')}
                className="btn btn-info text-white"
              >
                <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Mark for Review
              </button>
            )}
            
            {report.status === 'UNDER_REVIEW' && (
              <button 
                onClick={() => navigate('/app/report-project')}
                className="btn btn-success text-white"
              >
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