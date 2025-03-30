import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDocumentByProjectId } from './components/projectSlice';
import { Col, Row } from 'react-bootstrap';

const ProjectDetailsDocument = ({ getClassName }) => {
  const { projectId } = useParams();  // Get projectId from URL
  const dispatch = useDispatch();

  // Select the state values from Redux store
  const { documents, status, error } = useSelector(state => state.project);

  // Fetch documents on component mount
  useEffect(() => {
    if (projectId) {
      dispatch(getDocumentByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  // Render Loading or Error state if needed
  if (status === 'loading') return <div>Loading Documents...</div>;
  if (status === 'failed') return <div className="text-red-600">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-document")} p-6 bg-white shadow-md rounded-lg`} id="pills-document" role="tabpanel">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">Project Documents</h2>

      {documents?.length > 0 ? (
        <Row>
          {documents.map((document) => (
            <Col key={document.id} sm={12} md={6} lg={4} className="mb-4">
              <div className="p-4 bg-gray-50 border rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-800">{document.documentType}</h3>
                <p className="text-sm text-gray-600">{document.documentDescription}</p>
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
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-gray-600">No documents available for this project.</p>
      )}
    </div>
  );
};

export default ProjectDetailsDocument;
