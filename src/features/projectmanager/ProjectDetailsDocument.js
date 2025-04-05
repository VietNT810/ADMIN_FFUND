import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDocumentByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';

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

  return (
    <div className={`${getClassName?.("pills-document")} p-6 bg-base-100 shadow-xl rounded-lg`} id="pills-document" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 mb-4">Project Documents</h2>

      {documents?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div key={document.id} className="card bg-base-200 shadow-md p-4">
              <h3 className="font-semibold text-lg text-base-content">{document.documentType}</h3>
              <p className="text-sm text-base-content opacity-80">{document.documentDescription}</p>
              <div className="mt-2">
                <a
                  href={document.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Document
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
