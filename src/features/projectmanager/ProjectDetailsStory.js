import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getStoryByProjectId } from './components/projectSlice';

const ProjectDetailsStory = ({ getClassName }) => {
  const { projectId } = useParams();  // Get projectId from URL
  const dispatch = useDispatch();

  // Select the story data and loading status from Redux store
  const { story, status, error } = useSelector(state => state.project);

  // Fetch story on component mount or projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(getStoryByProjectId(projectId));  // Dispatch to fetch story
    }
  }, [dispatch, projectId]);

  // Handle loading or error states
  if (status === 'loading') return <div className="text-center text-gray-600">Loading Story...</div>;
  if (status === 'failed') return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-story")} p-6 bg-white shadow-lg rounded-lg`} id="pills-story" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 mb-6">Project Story</h2>

      {/* Render Story Blocks */}
      {story?.blocks?.length > 0 ? (
        <div className="space-y-6">
          {story.blocks.map((block) => {
            // Render Heading Blocks
            if (block.type === 'HEADING') {
              return (
                <div key={block.storyBlockId} className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{block.content}</h3>
                </div>
              );
            }
            // Render Text Blocks
            if (block.type === 'TEXT') {
              return (
                <div key={block.storyBlockId} className="mb-4">
                  <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: block.content }}></p>
                </div>
              );
            }
            // Render Image Blocks
            if (block.type === 'IMAGE') {
              return (
                <div key={block.storyBlockId} className="mb-4">
                  <img src={block.content} alt="Story Image" className="max-w-full h-auto rounded-lg shadow-md" />
                </div>
              );
            }
            // Render Video Blocks with a check for metadata width and height
            if (block.type === 'VIDEO') {
              const metadata = block.metadata ? JSON.parse(block.metadata) : {};
              const videoWidth = metadata.additionalProp1?.width || '560px';  // Default width if not provided
              const videoHeight = metadata.additionalProp1?.height || '315px'; // Default height if not provided

              return (
                <div key={block.storyBlockId} className="mb-4">
                  <iframe
                    src={block.content}
                    width={videoWidth}
                    height={videoHeight}
                    className="w-full h-80 rounded-lg shadow-md"
                    title="Project Story Video"
                    allow="autoplay; encrypted-media"
                  ></iframe>
                </div>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <p className="text-center text-gray-600">No story available for this project.</p>
      )}
    </div>
  );
};

export default ProjectDetailsStory;
