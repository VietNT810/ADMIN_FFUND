import React, { useState } from 'react';
import ProjectDetailsDocument from './ProjectDetailsDocument';
import ProjectDetailsPhase from './ProjectDetailsPhase';
import ProjectDetailsStory from './ProjectDetailsStory';
import ProjectDetailsUpdate from './ProjectDetailsUpdate';

const ProjectDetailsContent = () => {
  const [expandedTab, setExpandedTab] = useState(null); 
  
  const projectDetailsSections = [
    { id: "pills-story", name: "Story" },
    { id: "pills-update", name: "Updates" },
    { id: "pills-phase", name: "Phase" },
    { id: "pills-document", name: "Document" },
  ];

  const handleToggle = (tabId) => {
    // Toggle the state of the clicked section
    setExpandedTab(expandedTab === tabId ? null : tabId);
    
    // Scroll the section into view after expanding
    const sectionElement = document.getElementById(tabId);
    sectionElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="project-details-content mt-4">
      {/* Toggle buttons for each section */}
      <ul className="space-y-4">
        {projectDetailsSections.map((section) => (
          <li key={section.id}>
            <button
              className={`w-full px-4 py-2 text-lg font-semibold text-left rounded-md transition duration-300 
                ${expandedTab === section.id ? 'bg-orange-500 text-white' : 'bg-base-200 dark:bg-base-700 text-base-content dark:text-gray-300 hover:bg-orange-200 dark:hover:bg-orange-600'}`}
              onClick={() => handleToggle(section.id)}
            >
              {section.name}
            </button>

            {/* Render content when the section is expanded */}
            {expandedTab === section.id && (
              <div id={section.id} className="p-4 mt-2 dark:bg-base-800 rounded-lg shadow-md">
                {/* Dynamically render the correct component */}
                {section.id === "pills-story" && <ProjectDetailsStory />}
                {section.id === "pills-update" && <ProjectDetailsUpdate />}
                {section.id === "pills-phase" && <ProjectDetailsPhase />}
                {section.id === "pills-document" && <ProjectDetailsDocument />}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDetailsContent;
