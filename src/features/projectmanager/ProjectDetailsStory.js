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
  const [criteriaScores, setCriteriaScores] = useState({
    'Design Quality': '',
    'Code Structure': '',
    'Documentation': '',
    'Innovation': '',
    'Performance': ''
  });
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (projectId) {
      dispatch(getStoryByProjectId(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    // IntersectionObserver to detect when a block enters the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockId = entry.target.id;
            setSelectedBlock(blockId); // Set the active block
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-96px 0px 0px 0px', // Bù khoảng cách 96px từ trên
      }
    );

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

  const handleScoreChange = (criterion, value) => {
    setCriteriaScores(prev => ({
      ...prev,
      [criterion]: value
    }));
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 text-base-content">
      <div className="container mx-auto flex gap-6 relative">
        {/* Left Sidebar: Table of Contents */}
        <div className="hidden lg:block w-1/4">
          <div className="sticky top-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Table of Contents
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
                        onClick={() => {
                          const element = document.getElementById(heading.storyBlockId);
                          if (element) {
                            const offset = 96;
                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth',
                            });
                          }
                        }}
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
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className={`${getClassName?.('pills-story')} p-6 bg-base-100 dark:bg-base-800 shadow-xl rounded-lg`}>
            <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-6">Project Story</h2>
            <div className="space-y-8">
              {story?.blocks?.length > 0 ? (
                story.blocks.reduce((sections, block) => {
                  // Group blocks by heading
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

                    {/* Divider */}
                    {index < story.blocks.length - 1 && <hr className="my-8 border-gray-300 dark:border-gray-600" />}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-300">No story available for this project.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Evaluation Checklist */}
        {userRole !== 'ADMIN' && (
          <div className="hidden lg:block w-1/4">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-r-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Evaluation Checklist
                </h3>
                <div className="space-y-4">
                  {Object.keys(criteriaScores).map((criterion) => (
                    <div key={criterion} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-medium text-gray-700 dark:text-gray-200">{criterion}</label>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {criteriaScores[criterion] ? `${criteriaScores[criterion]}/10` : 'Not rated'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={criteriaScores[criterion]}
                          onChange={(e) => handleScoreChange(criterion, e.target.value)}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={criteriaScores[criterion]}
                          onChange={(e) => handleScoreChange(criterion, e.target.value)}
                          className="ml-3 w-12 text-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Overall Score</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {Object.values(criteriaScores).filter(Boolean).length > 0
                          ? (Object.values(criteriaScores).reduce((sum, val) => sum + Number(val || 0), 0) /
                            Object.values(criteriaScores).filter(Boolean).length).toFixed(1)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetailsStory;