import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDocumentByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';
import {
  DocumentIcon, DocumentTextIcon, DocumentChartBarIcon,
  PresentationChartBarIcon, TableCellsIcon, ChartPieIcon,
  DocumentMagnifyingGlassIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const ProjectDetailsDocument = ({ getClassName }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { documents, status, error } = useSelector(state => state.project);

  useEffect(() => {
    if (projectId) {
      dispatch(getDocumentByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  // Get file extension from URL
  const getFileExtension = (url) => {
    if (!url) return '';
    const filename = url.split('/').pop();
    return filename.split('.').pop().toLowerCase();
  };

  // Get document icon based on file extension
  const getDocumentIcon = (url, type) => {
    const extension = getFileExtension(url);

    // Icon and color based on file extension
    switch (extension) {
      case 'pdf':
        return <DocumentTextIcon className="w-10 h-10 text-red-600" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon className="w-10 h-10 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <TableCellsIcon className="w-10 h-10 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <PresentationChartBarIcon className="w-10 h-10 text-orange-500" />;
      case 'csv':
        return <DocumentChartBarIcon className="w-10 h-10 text-purple-600" />;
      case 'txt':
        return <ClipboardDocumentListIcon className="w-10 h-10 text-gray-600" />;
      default:
        // Fallback to document type if extension is not recognized
        return getDocumentTypeIcon(type);
    }
  };

  // Get icon based on document type (fallback)
  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'SWOT_ANALYSIS':
        return <ChartPieIcon className="w-10 h-10 text-purple-600" />;
      case 'BUSINESS_MODEL_CANVAS':
        return <DocumentChartBarIcon className="w-10 h-10 text-blue-600" />;
      case 'BUSINESS_PLAN':
        return <ClipboardDocumentListIcon className="w-10 h-10 text-indigo-600" />;
      case 'MARKET_RESEARCH':
        return <DocumentMagnifyingGlassIcon className="w-10 h-10 text-amber-600" />;
      case 'FINANCIAL_PLAN':
        return <TableCellsIcon className="w-10 h-10 text-emerald-600" />;
      default:
        return <DocumentIcon className="w-10 h-10 text-gray-600" />;
    }
  };

  
  const formatDocumentType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  
  const formatFileName = (description) => {
    if (!description) return '';
    try {
      const decoded = decodeURIComponent(description);
      return decoded.replace(/^[\d_]+/g, '').substring(0, 40) + (decoded.length > 40 ? '...' : '');
    } catch (e) {
      return description.substring(0, 40) + (description.length > 40 ? '...' : '');
    }
  };

  return (
    <div className={`${getClassName?.("pills-document")} p-6 bg-base-100 shadow-xl rounded-lg`} id="pills-document" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 mb-6 flex items-center">
        <DocumentTextIcon className="w-6 h-6 mr-2" />
        Project Documents
      </h2>

      {documents?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {documents.map((document) => (
            <div key={document.id} className="card bg-base-200 shadow-md hover:shadow-lg rounded-lg transition-all duration-300 overflow-hidden">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                  {getDocumentIcon(document.documentUrl, document.documentType)}
                  <span className="bg-base-300 text-xs px-2 py-1 rounded-full">
                    {getFileExtension(document.documentUrl).toUpperCase()}
                  </span>
                </div>

                <h3 className="font-medium text-base mb-1">{formatDocumentType(document.documentType)}</h3>
                <p className="text-sm text-base-content opacity-70 mb-3 line-clamp-2">
                  {formatFileName(document.documentDescription)}
                </p>

                <div className="card-actions justify-end mt-auto">
                  <a
                    href={document.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    View Document
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <DocumentIcon className="w-16 h-16 text-gray-400 mb-3" />
          <p className="text-gray-500 text-lg">No documents available for this project</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsDocument;