import React, { useState } from 'react';
import ProjectDetailsDocument from './ProjectDetailsDocument';
import ProjectDetailsPhase from './ProjectDetailsPhase';
import ProjectDetailsStory from './ProjectDetailsStory';
import ProjectDetailsUpdate from './ProjectDetailsUpdate';
import { motion } from 'framer-motion';

const ProjectDetailsContent = () => {
  const [expandedTab, setExpandedTab] = useState(null);

  const projectDetailsSections = [
    { id: "pills-story", name: "Story", icon: "📖" },
    { id: "pills-update", name: "Updates", icon: "🔄" },
    { id: "pills-phase", name: "Phase", icon: "⏳" },
    { id: "pills-document", name: "Document", icon: "📂" },
  ];

  const handleToggle = (tabId, e) => {
    e.preventDefault();
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  return (
    <div className="project-details-content mt-4">
      {/* Toggle buttons for each section */}
      <ul className="space-y-4">
        {projectDetailsSections.map((section) => (
          <li key={section.id}>
            <motion.button
              className={`w-full px-4 py-3 text-lg font-semibold text-left rounded-md transition duration-300
                ${expandedTab === section.id ? 'bg-orange-500 text-white' : 'bg-base-200 dark:bg-base-700 text-base-content dark:text-gray-300 hover:bg-orange-200 dark:hover:bg-orange-600'}
                shadow-md hover:shadow-lg focus:outline-none`}
              onClick={(e) => handleToggle(section.id, e)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="mr-2">{section.icon}</span>
              {section.name}
            </motion.button>

            {/* Render content when the section is expanded */}
            {expandedTab === section.id && (
              <motion.div
                id={section.id}
                className="p-4 mt-2 dark:bg-base-800 rounded-lg shadow-lg transition-all duration-300"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Dynamically render the correct component */}
                {section.id === "pills-story" && <ProjectDetailsStory />}
                {section.id === "pills-update" && <ProjectDetailsUpdate />}
                {section.id === "pills-phase" && <ProjectDetailsPhase />}
                {section.id === "pills-document" && <ProjectDetailsDocument />}
              </motion.div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDetailsContent;
