import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getStoryByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectDetailsStory = ({ getClassName }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const { story, status, error } = useSelector(state => state.project);

  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getStoryByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    // IntersectionObserver to detect when a block enters the viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const blockId = entry.target.id;
          setSelectedBlock(blockId); // Set the active block
        }
      });
    }, { threshold: 0.5 });

    // Observe each block
    story?.blocks?.forEach((block) => {
      const element = document.getElementById(block.storyBlockId);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, [story?.blocks]);

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className={`${getClassName?.("pills-story")} p-6 bg-base-100 dark:bg-base-800 shadow-xl rounded-lg`} id="pills-story" role="tabpanel">
      <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-6">Project Story</h2>

      {/* Main content section */}
      <div className="space-y-6">
        {story?.blocks?.length > 0 ? (
          story.blocks.map((block) => {
            // Render Heading Blocks
            if (block.type === 'HEADING') {
              return (
                <motion.div
                  key={block.storyBlockId}
                  id={block.storyBlockId}
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className={`text-2xl font-semibold ${selectedBlock === block.storyBlockId ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {block.content}
                  </h3>
                </motion.div>
              );
            }

            // Render Text Blocks
            if (block.type === 'TEXT') {
              return (
                <motion.div
                  key={block.storyBlockId}
                  id={block.storyBlockId}
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-gray-700 dark:text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }}></p>
                </motion.div>
              );
            }

            // Render Image Blocks
            if (block.type === 'IMAGE') {
              return (
                <motion.div
                  key={block.storyBlockId}
                  id={block.storyBlockId}
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img src={block.content} alt="Story Image" className="max-w-full h-auto rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300" />
                </motion.div>
              );
            }

            // Render Video Blocks
            if (block.type === 'VIDEO') {
              const metadata = block.metadata ? JSON.parse(block.metadata) : {};
              const videoWidth = metadata.additionalProp1?.width || '560px';
              const videoHeight = metadata.additionalProp1?.height || '315px';

              return (
                <motion.div
                  key={block.storyBlockId}
                  id={block.storyBlockId}
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <iframe
                    src={block.content}
                    width={videoWidth}
                    height={videoHeight}
                    className="w-full h-80 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
                    title="Project Story Video"
                    allow="autoplay; encrypted-media"
                  ></iframe>
                </motion.div>
              );
            }

            return null;
          })
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">No story available for this project.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsStory;
