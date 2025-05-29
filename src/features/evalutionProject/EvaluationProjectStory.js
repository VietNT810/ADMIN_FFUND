import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getStoryByProjectId } from '../../features/projectmanager/components/projectSlice';
import Loading from '../../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetailsStoryEvaluation = ({ getClassName }) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const contentRef = useRef(null);

    const { story, status, error } = useSelector(state => state.project);

    const [selectedBlock, setSelectedBlock] = useState(null);
    const [tocVisible, setTocVisible] = useState(false);

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
                rootMargin: '-60px 0px 0px 0px',
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

    // Scroll to a specific heading within the content area
    const scrollToHeading = (headingId) => {
        const element = document.getElementById(headingId);
        if (element && contentRef.current) {
            const container = contentRef.current;
            const elementPosition = element.offsetTop - container.offsetTop;

            container.scrollTo({
                top: elementPosition - 20, // Add some padding
                behavior: 'smooth'
            });

            setSelectedBlock(headingId);
            // Auto-hide TOC after selection
            setTocVisible(false);
        }
    };

    const toggleTOC = () => {
        setTocVisible(!tocVisible);
    };

    if (status === 'loading') return <Loading />;
    if (status === 'failed') return <div className="alert alert-error">{error}</div>;

    // Get all headings for TOC
    const headings = story?.blocks?.filter(block => block.type === 'HEADING') || [];

    return (
        <div className="relative bg-base-100 dark:bg-base-800 overflow-hidden">
            {/* TOC Toggle Button - Always visible with better contrast */}
            <button
                onClick={toggleTOC}
                className={`absolute top-4 left-4 z-20 p-2 rounded-md ${tocVisible
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    } transition-colors shadow-md`}
                aria-label="Toggle Table of Contents"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

            {/* Table of Contents - Popup style instead of sidebar */}
            <AnimatePresence>
                {tocVisible && (
                    <motion.div
                        className="absolute top-16 left-4 z-10 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 w-72 max-h-[60vh] overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-gray-700">
                                <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                    Table of Contents
                                </h3>
                                <button
                                    onClick={toggleTOC}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-2 max-h-[calc(60vh-48px)]">
                                <nav className="space-y-1">
                                    {headings.map((heading) => {
                                        const metadata = heading.metadata ? JSON.parse(heading.metadata) : {};
                                        const level = metadata?.additionalProp1?.level || 2;

                                        return (
                                            <button
                                                key={heading.storyBlockId}
                                                onClick={() => scrollToHeading(heading.storyBlockId)}
                                                className={`block text-left w-full px-3 py-2 rounded-md transition-all duration-200 text-sm
                                                  ${selectedBlock === heading.storyBlockId
                                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    } 
                                                  ${level === 2 ? '' : 'pl-5 border-l-2 border-orange-200 dark:border-orange-800'}`}
                                            >
                                                <span className="line-clamp-2">{heading.content}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div
                ref={contentRef}
                className={`${getClassName?.('pills-story')} p-4 overflow-y-auto max-h-[calc(100vh-250px)] transition-all`}
                style={{ paddingLeft: '48px' }} // Consistent padding regardless of TOC visibility
            >
                <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-4">Project Story</h2>
                <div className="space-y-6">
                    {story?.blocks?.length > 0 ? (
                        (() => {
                            // Create initial section for content before any headings
                            const sections = [{
                                heading: {
                                    storyBlockId: 'overview',
                                    content: 'Project Overview',
                                    type: 'HEADING'
                                },
                                content: []
                            }];

                            // Group blocks by heading
                            story.blocks.forEach(block => {
                                if (block.type === 'HEADING') {
                                    sections.push({
                                        heading: block,
                                        content: [],
                                    });
                                } else {
                                    sections[sections.length - 1].content.push(block);
                                }
                            });

                            return sections.filter(section => section.content.length > 0).map((section, index) => (
                                <div key={section.heading.storyBlockId} id={section.heading.storyBlockId} className="scroll-mt-16">
                                    {/* Heading */}
                                    <div className="mb-3">
                                        <h3
                                            className={`text-lg font-semibold ${selectedBlock === section.heading.storyBlockId
                                                    ? 'text-orange-600 dark:text-orange-400'
                                                    : 'text-gray-800 dark:text-gray-200'
                                                }`}
                                        >
                                            {section.heading.content}
                                        </h3>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3">
                                        {section.content.map((block) => {
                                            if (block.type === 'TEXT') {
                                                return (
                                                    <p
                                                        key={block.storyBlockId}
                                                        className="text-gray-700 dark:text-gray-100 text-sm leading-relaxed"
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
                                                        className="max-w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
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
                                                        className="w-full h-64 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                                                        title="Project Story Video"
                                                        allow="autoplay; encrypted-media"
                                                    ></iframe>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>

                                    {/* Divider */}
                                    {index < sections.length - 1 && <hr className="my-4 border-gray-200 dark:border-gray-700" />}
                                </div>
                            ))
                        })()
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-300">No story available for this project.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProjectDetailsStoryEvaluation;