import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReportById } from './reportSlice';
import Loading from '../../components/Loading';
import { PaperClipIcon } from '@heroicons/react/24/outline';

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

  if (isLoading || status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
        {report ? (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => navigate('/app/report-project')}
              className="btn btn-ghost"
            >
              Back to Reports
            </button>

            {/* Report Information */}
            <h2 className="text-2xl font-semibold">{report.title}</h2>
            <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
            <p className="text-sm text-gray-700">{report.description}</p>

            <div className="flex items-center space-x-4">
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

            {/* Status and Attachment */}
            <div className="flex flex-col items-end space-y-2">
              {report.attachmentUrl && (
                <div className="flex items-center space-x-2">
                  <PaperClipIcon className="w-5 h-5 text-gray-500" />
                  <a
                    href={report.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}
              <span className={`badge ${report.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>
                {report.status}
              </span>
            </div>
          </div>
        ) : (
          <div>No report found</div>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;
