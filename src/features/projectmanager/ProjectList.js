import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from './components/projectSlice';
import { getCategoriesContent } from '../category/categorySlice';
import { MagnifyingGlassIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, status, error, totalPages } = useSelector(state => state.project || { projects: [], error: null, status: 'idle' });
  const { categories } = useSelector(state => state.category || { categories: [] });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [sortField, setSortField] = useState('createdAt');  // Default sort by createdAt
  const [sortOrder, setSortOrder] = useState('asc');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Fetch categories when component mounts
    dispatch(getCategoriesContent());
    // Fetch projects when component mounts or parameters change
    dispatch(getProjects({ query: '', page, size: 10, sortField, sortOrder }));
  }, [dispatch, page, sortField, sortOrder]);

  const handleSearch = () => {
    const queryParts = [];

    // Add the search term for title, if provided
    if (searchTerm) {
      queryParts.push(`title:eq:${searchTerm}`);
    }

    // Add the selected category filter, if not "All"
    if (selectedMainCategory !== "All") {
      queryParts.push(`category.name:eq:${selectedMainCategory}`);
    }

    // Ensure at least one search criterion is provided
    if (queryParts.length === 0) {
      console.error("No search criteria provided.");
      return;
    }

    // Join the query parts with a comma to form the final query string
    const query = queryParts.join(",");
    console.log("Constructed Query:", query);

    // Set the sorting options
    const sort = `${sortOrder === 'asc' ? '+' : '-'}${sortField}`;
    
    // Dispatch the action to fetch projects based on the query and sorting
    dispatch(getProjects({ query, page, size: 10, sortField, sortOrder }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleDropdown = (projectId) => {
    setOpenDropdown(openDropdown === projectId ? null : projectId);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="p-4 mb-4 bg-red-200 text-red-800 rounded-lg text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Search and Sort Section */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-4 py-2 border rounded-lg w-64"
          />
          <select
            value={selectedMainCategory}
            onChange={(e) => setSelectedMainCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition duration-200 relative group"
          >
            <MagnifyingGlassIcon className="w-5 h-5 inline-block" />
            <span className="absolute left-1/2 transform -translate-x-1/2 top-12 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Search
            </span>
          </button>
        </div>

        {/* Project Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Project Title</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Location</th> {/* New column for location */}
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project, index) => (
                <tr key={project.id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{project.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{project.team?.teamName || "No Team"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{project.status}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{project.location}</td> {/* Display location */}
                  <td className="px-4 py-2 text-sm text-gray-600">{new Date(project.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-center">
                    <button
                      onClick={() => toggleDropdown(project.id)}
                      className="bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition duration-200"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5 inline-block" />
                    </button>
                    {/* Dropdown menu */}
                    {openDropdown === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                        <ul className="py-1">
                          <li>
                            <a
                              href={project.projectUrl}
                              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                            >
                              View Project
                            </a>
                          </li>
                          <li>
                            <a
                              href={project.projectVideoDemo}
                              className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                            >
                              View Demo Video
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-600 py-4">No projects available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-4">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="px-4 py-2 bg-gray-300 rounded-lg">Previous</button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="px-4 py-2 bg-gray-300 rounded-lg">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
