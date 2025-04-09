import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDocumentByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';
import { DocumentIcon, PaperClipIcon, PlayIcon } from '@heroicons/react/24/outline'; // Heroicons

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

  // Helper function to render appropriate icon based on document type
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <DocumentIcon className="text-red-600 w-8 h-8" />;
      case 'Word':
        return <PaperClipIcon className="text-blue-600 w-8 h-8" />;
      case 'Excel':
        return <PlayIcon className="text-green-600 w-8 h-8" />;
      default:
        return <DocumentIcon className="text-gray-600 w-8 h-8" />;
    }
  };

  return (
    <div className={`${getClassName?.("pills-document")} p-6 bg-base-100 shadow-xl rounded-lg`} id="pills-document" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 mb-4">Project Documents</h2>

      {documents?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div key={document.id} className="card bg-base-200 shadow-lg p-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
              {/* Render document icon based on type */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{getDocumentIcon(document.documentType)}</div>
                <span className="text-sm text-gray-600">{document.documentType}</span>
              </div>

              {/* Document details */}
              <h3 className="font-semibold text-lg text-base-content mb-2">{document.documentType}</h3>
              <p className="text-sm text-base-content opacity-80 mb-4">{document.documentDescription}</p>

              <div className="mt-2">
                <a
                  href={document.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <strong>View Document</strong>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No documents available for this project.</p>
      )}
    </div>
  );
};

export default ProjectDetailsDocument;
