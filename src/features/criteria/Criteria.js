import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getAllCriteria, createCriteria, getAllCriteriaType, updateCriteria, deleteCriteria } from './criteriaSlice';
import { MagnifyingGlassIcon, EyeIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCategoriesContent } from '../category/categorySlice'
import { useLocation, useNavigate } from 'react-router-dom';

const Criteria = () => {
  const dispatch = useDispatch();
  const { criteriaList, criteriaTypes, status, error, totalPages } = useSelector(state => state.criteria);
  const { categories } = useSelector(state => state.category || { categories: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newCriteria, setNewCriteria] = useState({
    maximumPoint: '',
    description: '',
    categoryId: '',
    typeId: ''
  });
  const [editCriteriaId, setEditCriteriaId] = useState(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [criteriaToDelete, setCriteriaToDelete] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showNoCriteriaWarning, setShowNoCriteriaWarning] = useState(false);


  useEffect(() => {
    if (selectedMainCategory !== 'All') {
      const queryParts = [`category.name:eq:${selectedMainCategory}`];
      const query = queryParts.join(",");

      dispatch(getAllCriteria({ query, page: 0, size: 10, sortField, sortOrder }))
        .then((response) => {
          if (response.payload &&
            response.payload.criteriaList &&
            response.payload.criteriaList.length === 0) {
            setShowNoCriteriaWarning(true);
          } else {
            setShowNoCriteriaWarning(false);
          }
        });

      const searchParams = new URLSearchParams();
      searchParams.set('category', selectedMainCategory);
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    } else {
      setShowNoCriteriaWarning(false);
      navigate({
        pathname: location.pathname,
        search: ""
      }, { replace: true });

      dispatch(getAllCriteria({ page: 0, size: 10, sortField, sortOrder }));
    }
  }, [selectedMainCategory, dispatch, navigate, location.pathname, sortField, sortOrder]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');

    if (categoryParam) {
      setSelectedMainCategory(categoryParam);

      const queryParts = [`category.name:eq:${categoryParam}`];
      const query = queryParts.join(",");

      dispatch(getAllCriteria({ query, page: 0, size: 10, sortField, sortOrder }))
        .then((response) => {
          if (response.payload &&
            response.payload.criteriaList &&
            response.payload.criteriaList.length === 0) {
            setShowNoCriteriaWarning(true);
          } else {
            setShowNoCriteriaWarning(false);
          }
        });
    } else {
      setShowNoCriteriaWarning(false);
    }

    dispatch(getCategoriesContent());
    dispatch(getAllCriteriaType());
  }, [dispatch, location.search]);

  const handleSearch = () => {
    const queryParts = [];

    if (searchTerm) queryParts.push(`categoryName:eq:${searchTerm}`);

    if (selectedMainCategory !== "All") {
      queryParts.push(`category.name:eq:${selectedMainCategory}`);

      const searchParams = new URLSearchParams();
      searchParams.set('category', selectedMainCategory);

      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });

      const query = queryParts.join(",");
      dispatch(getAllCriteria({ query, page, size: 10, sortField, sortOrder }))
        .then((response) => {
          if (response.payload &&
            response.payload.criteriaList &&
            response.payload.criteriaList.length === 0) {
            setShowNoCriteriaWarning(true);
          } else {
            setShowNoCriteriaWarning(false);
          }
        });
    } else {
      navigate({
        pathname: location.pathname,
        search: ""
      }, { replace: true });

      setShowNoCriteriaWarning(false);
      dispatch(getAllCriteria({ page, size: 10, sortField, sortOrder }));
    }
  };

  useEffect(() => {
    if (selectedMainCategory !== 'All') {
      handleSearch();
    } else {
      dispatch(getAllCriteria({ page, size: 10, sortField, sortOrder }));
      setShowNoCriteriaWarning(false);
    }
  }, [selectedMainCategory]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCriteria(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (validateForm(newCriteria, false)) {
      dispatch(createCriteria(newCriteria))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while processing the category.");
          } else {
            toast.success(result.payload);
            setModalOpen(false);
            resetNewCriteria();

            dispatch(getAllCriteria({
              query: selectedMainCategory !== 'All' ? `category.name:eq:${selectedMainCategory}` : searchTerm,
              page,
              size: 10,
              sortField,
              sortOrder
            })).then(response => {
              if (response.payload &&
                response.payload.criteriaList &&
                response.payload.criteriaList.length > 0) {
                setShowNoCriteriaWarning(false);
              }
            });
          }
        })
        .catch((error) => {
          toast.error(error.message || "An unexpected error occurred.");
        });
    }
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (validateForm(newCriteria, true)) {
      dispatch(updateCriteria({ ...newCriteria, id: editCriteriaId }))
        .then((result) => {
          if(result.error){
            toast.error(result.payload || "An error occurred while processing the category.");
          } else {
            console.log('Updated result:', result);
            toast.success("Criteria updated successfully.");
            setEditModalOpen(false);
            resetNewCriteria();
            dispatch(getAllCriteria({ query: searchTerm, page, size: 10, sortField, sortOrder }));
          }
        })
        .catch((error) => {
          toast.error(error.message || "An unexpected error occurred.");
        });
    }
  };

  const validateForm = (criteria, isEdit = false) => {
    if (!criteria.maximumPoint || !criteria.description) {
      toast.error('Maximum point and Description are required');
      return false;
    }
    // Only validate categoryId and typeId for create
    if (!isEdit) {
      if (!criteria.categoryId || !criteria.typeId) {
        toast.error('Category and Criteria type are required');
        return false;
      }
    }
  
    return true;
  };

  const resetNewCriteria = () => {
    setNewCriteria({
      maximumPoint: '',
      description: '',
      categoryId: '',
      typeId: ''
    });
  };

  const handleEdit = (criteriaId) => {
    const criteria = criteriaList.find(item => item.id === criteriaId);
    if (criteria && criteria.id) {
      setEditCriteriaId(criteriaId);
      setNewCriteria({
        maximumPoint: criteria.maximumPoint,
        description: criteria.description,
      });
      setEditModalOpen(true);
    } else {
      console.log('Criteria', criteria)
      console.log('Criteria ID', criteria.id)
      toast.error('Criteria not found.');
    }
  };

  const handleDeleteConfirmation = (criteriaId) => {
    setCriteriaToDelete(criteriaId);
    setConfirmDeleteModalOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setConfirmDeleteModalOpen(false);
    setCriteriaToDelete(null);
  };
  
  const handleDeleteConfirm = () => {
    if (criteriaToDelete) {
      dispatch(deleteCriteria(criteriaToDelete))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while deleting the detail.");
          } else {
            toast.success(result.payload);
            setConfirmDeleteModalOpen(false);
            setCriteriaToDelete(null);
            dispatch(getAllCriteria({ query: searchTerm, page, size: 10, sortField, sortOrder }));
          }
        })
        .catch((error) => {
          toast.error(error.message || "An unexpected error occurred.");
          setConfirmDeleteModalOpen(false);
          setCriteriaToDelete(null);
        });
    }
  };

  const toggleModal = (categoryName) => {
    if (categoryName) {
      const selectedCategory = categories.find(cat => cat.categoryName === categoryName);

      if (selectedCategory) {
        setNewCriteria(prev => ({
          ...prev,
          categoryId: selectedCategory.id
        }));
      }
    }

    setModalOpen(!modalOpen);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    resetNewCriteria();
  };

  if (status === 'loading') return <Loading />;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-[95%] mx-auto bg-base-100 shadow-xl rounded-xl p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Criteria Management</h1>

          <button
            onClick={() => toggleModal()}
            className="btn bg-green-500 hover:bg-green-600 text-white px-5 py-2 flex items-center gap-2 rounded-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Create Criteria
          </button>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by criteria type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory('All');
              }}
              className="w-full border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleSearch}
              className="btn bg-orange-500 hover:bg-orange-600 text-white w-full py-3 flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Warning message when category has no criteria */}
        {showNoCriteriaWarning && selectedMainCategory !== 'All' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 bg-amber-100 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-amber-800">No criteria found for "{selectedMainCategory}"</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Action Required
                  </span>
                </div>
                <div className="mt-2 text-amber-700">
                  <p className="text-sm leading-relaxed">
                    This category doesn't have any associated criteria yet. Projects in this category cannot be properly evaluated without defined criteria.
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => toggleModal(selectedMainCategory)}
                      className="inline-flex items-center px-3 py-2 border border-amber-300 text-sm leading-4 font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                    >
                      <PlusIcon className="w-4 h-4 mr-1.5" />
                      Create first criteria for this category
                    </button>
                    <span className="text-xs text-amber-600">or</span>
                    <button
                      onClick={() => {
                        setSelectedMainCategory('All');
                        setShowNoCriteriaWarning(false);
                      }}
                      className="text-xs text-amber-700 hover:text-amber-900 underline focus:outline-none"
                    >
                      View all categories
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-amber-300 to-orange-300"></div>
          </motion.div>
        )}

        {/* Criteria Table */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">No</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Description</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Category</th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Max Points</th>
                <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {criteriaList && criteriaList.length > 0 ? (
                criteriaList.map((criteria, index) => (
                  <motion.tr
                    key={criteria.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{criteria.typeName}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {criteria.description && criteria.description.length > 100
                        ? `${criteria.description.substring(0, 100)}...`
                        : criteria.description || "No description"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                        {criteria.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      <span className="px-2 py-1 rounded-md bg-green-50 text-green-700">
                        {criteria.maximumPoint} pts
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/app/criteria-details/${criteria.id}`}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleEdit(criteria.id)}
                          className="p-1.5 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors text-yellow-600"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteConfirmation(criteria.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium mb-1">No criteria found</p>
                      <p className="text-sm">Try adjusting your filters or create a new criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              Showing page {page + 1} of {totalPages}
            </p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className={`px-4 py-2 rounded-md border ${page === 0
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 2) {
                  pageNum = i;
                } else if (page > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                if (pageNum >= 0 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-md ${pageNum === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className={`px-4 py-2 rounded-md border ${page >= totalPages - 1
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Create New Criteria</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmitCreate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Point <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maximumPoint"
                        value={newCriteria.maximumPoint}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                        required
                        placeholder="Enter maximum points (e.g. 10)"
                      />
                      <p className="mt-1 text-xs text-gray-500">Maximum score that can be assigned to this criteria</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        value={newCriteria.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criteria Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="typeId"
                      value={newCriteria.typeId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select Criteria Type</option>
                      {criteriaTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={newCriteria.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                      rows="4"
                      required
                      placeholder="Enter detailed description of this criteria"
                    />
                    <p className="mt-1 text-xs text-gray-500">Explain what this criteria evaluates and how it should be assessed</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Create Criteria
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Edit Criteria</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmitEdit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Point <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maximumPoint"
                      value={newCriteria.maximumPoint}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={newCriteria.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <PencilIcon className="w-5 h-5" />
                      Update Criteria
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <TrashIcon className="h-8 w-8 text-red-600" />
                  </div>

                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Delete Criteria
                  </h3>

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this criteria? This action cannot be undone.
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleDeleteCancel}
                      className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Criteria;
