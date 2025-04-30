import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getStoryByProjectId } from './components/projectSlice';
import Loading from '../../components/Loading';
import { motion } from 'framer-motion';

const ProjectDetailsStory = ({ getClassName, evaluationMode, projectId: propProjectId }) => {
  // Ref cho container chính để định vị TOC bên trong nó
  const mainContainerRef = useRef(null);
  // Ref cho content để cuộn
  const contentRef = useRef(null);

  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId;
  const dispatch = useDispatch();

  const { story, status, error } = useSelector(state => state.project);

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showTableOfContent, setShowTableOfContent] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(getStoryByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!story?.blocks || story.blocks.length === 0) return;

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-50px 0px 0px 0px',
    };

    if (evaluationMode && contentRef.current) {
      observerOptions.root = contentRef.current;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockId = entry.target.id;
            setSelectedBlock(blockId);
          }
        });
      },
      observerOptions
    );

    setTimeout(() => {
      story.blocks.forEach((block) => {
        if (block.type === 'HEADING') {
          const element = document.getElementById(block.storyBlockId);
          if (element) {
            observer.observe(element);
          }
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, [story?.blocks, evaluationMode]);

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (!element) return;

    if (evaluationMode && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const relativeTop = elementTop - containerTop;

      contentRef.current.scrollTo({
        top: contentRef.current.scrollTop + relativeTop - 20,
        behavior: 'smooth'
      });
    } else {
      const offset = 96;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    if (evaluationMode) {
      setShowTableOfContent(false);
    }
  };

  const toggleTableOfContent = () => {
    setShowTableOfContent(prev => !prev);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div
      ref={mainContainerRef}
      className={evaluationMode ? "relative h-full" : "min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 text-base-content"}
    >
      {/* Nút hiện/ẩn TOC - nổi ở góc phải trong container */}
      {evaluationMode && (
        <button
          onClick={toggleTableOfContent}
          className="absolute top-2 right-2 z-10 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg"
          title={showTableOfContent ? "Hide Table of Contents" : "Show Table of Contents"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
      )}

      {/* Table of Contents - absolute trong container chính */}
      {((evaluationMode && showTableOfContent) || (!evaluationMode)) && (
        <motion.div
          className={evaluationMode
            ? "absolute top-12 right-2 z-10 w-72 max-h-[80%] overflow-auto shadow-xl"
            : "hidden lg:block w-1/4"
          }
          initial={evaluationMode ? { opacity: 0, y: -20 } : {}}
          animate={evaluationMode ? { opacity: 1, y: 0 } : {}}
          exit={evaluationMode ? { opacity: 0, y: -20 } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className={evaluationMode ? "" : "sticky top-20"}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Table of Contents
                {evaluationMode && (
                  <button
                    onClick={toggleTableOfContent}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </h3>
              <nav className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {story?.blocks
                  ?.filter((block) => block.type === 'HEADING')
                  .map((heading) => {
                    const metadata = heading.metadata ? JSON.parse(heading.metadata) : {};
                    const level = metadata?.additionalProp1?.level || 2;

                    return (
                      <button
                        key={heading.storyBlockId}
                        onClick={() => scrollToHeading(heading.storyBlockId)}
                        className={`block text-left w-full px-3 py-2 rounded-md transition-all duration-200 ${selectedBlock === heading.storyBlockId
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          } ${level === 2 ? 'text-base font-semibold' : 'text-sm pl-6 border-l border-gray-300 dark:border-gray-600'}`}
                      >
                        {level > 2 && (
                          <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2 opacity-70"></span>
                        )}
                        {heading.content}
                      </button>
                    );
                  })}
              </nav>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={evaluationMode ? "w-full" : "flex-grow"}>
        {/* Container nội dung với ref để cuộn */}
        <div
          ref={contentRef}
          className={`${getClassName?.('pills-story') || ''} ${evaluationMode ? "h-[calc(100vh-14rem)] overflow-y-auto pt-10" : "p-6 bg-base-100 dark:bg-base-800 shadow-xl rounded-lg"
            }`}
        >
          {!evaluationMode && <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-6">Project Story</h2>}
          <div className="space-y-8">
            {story?.blocks?.length > 0 ? (
              story.blocks.reduce((sections, block) => {
                if (block.type === 'HEADING') {
                  sections.push({
                    heading: block,
                    content: [],
                  });
                } else if (sections.length > 0) {
                  sections[sections.length - 1].content.push(block);
                }
                return sections;
              }, []).map((section, index) => (
                <div key={section.heading.storyBlockId} id={section.heading.storyBlockId}>
                  {/* Heading */}
                  <div className="mb-6">
                    <h3
                      className={`text-2xl font-semibold ${selectedBlock === section.heading.storyBlockId
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-800 dark:text-gray-200'
                        }`}
                    >
                      {section.heading.content}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    {section.content.map((block) => {
                      if (block.type === 'TEXT') {
                        return (
                          <p
                            key={block.storyBlockId}
                            className="text-gray-700 dark:text-gray-100 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: block.content }}
                          ></p>
                        );
                      }

                      if (block.type === 'IMAGE') {
                        return (
                          <img
                            key={block.storyBlockId}
                            src={block.content}
                            alt="Story Image"
                            className="max-w-full h-auto rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
                          />
                        );
                      }

                      if (block.type === 'VIDEO') {
                        const metadata = block.metadata ? JSON.parse(block.metadata) : {};
                        const videoWidth = metadata.additionalProp1?.width || '560px';
                        const videoHeight = metadata.additionalProp1?.height || '315px';

                        return (
                          <iframe
                            key={block.storyBlockId}
                            src={block.content}
                            width={videoWidth}
                            height={videoHeight}
                            className="w-full h-80 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
                            title="Project Story Video"
                            allow="autoplay; encrypted-media"
                          ></iframe>
                        );
                      }

                      return null;
                    })}
                  </div>

                  {index < story.blocks.length - 1 && <hr className="my-8 border-gray-300 dark:border-gray-600" />}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-300">No story available for this project.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailsStory;