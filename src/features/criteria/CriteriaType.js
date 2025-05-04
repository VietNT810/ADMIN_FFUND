import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getAllCriteriaType, createCriteriaType } from './criteriaSlice';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CriteriaType = () => {
  const dispatch = useDispatch();
  const { criteriaTypes, status, error } = useSelector(state => state.criteria);

  const [newCriteriaType, setNewCriteriaType] = useState({
    name: '',
    description: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getAllCriteriaType());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCriteriaType(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (validateForm(newCriteriaType)) {
      dispatch(createCriteriaType(newCriteriaType))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while processing the criteria type.");
          } else {
            toast.success(result.payload);
            setModalOpen(false);
            resetNewCriteriaType();
            dispatch(getAllCriteriaType());
          }
        })
        .catch((error) => {
          toast.error(error.message || "An unexpected error occurred.");
        });
    }
  };

  // Reset form after submission
  const resetNewCriteriaType = () => {
    setNewCriteriaType({
      name: '',
      description: '',
    });
  };

  // Validate the form data
  const validateForm = (criteria) => {
    if (!criteria.name) {
      toast.error('Name is required!');
      return false;
    }
    if (!criteria.description) {
      toast.error('Description is required!');
      return false;
    }
    return true;
  };

  // Open modal
  const toggleModal = () => setModalOpen(!modalOpen);

  // Handle close modal
  const handleCloseModal = () => setModalOpen(false);

  // Filter criteria types by search term
  const filteredTypes = searchTerm
    ? criteriaTypes?.filter(type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : criteriaTypes;

  if (status === 'loading') return <Loading />;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-[95%] mx-auto bg-base-100 shadow-xl rounded-xl p-6 md:p-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Criteria Types Management</h1>

          <button
            onClick={toggleModal}
            className="btn bg-green-500 hover:bg-green-600 text-white px-5 py-2 flex items-center gap-2 rounded-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Type
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Criteria Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTypes && filteredTypes.length > 0 ? (
            filteredTypes.map((type, index) => (
              <motion.div
                key={type.id}
                className="overflow-hidden bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">
                      {index + 1}
                    </span>
                    {type.name}
                  </h3>
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 font-medium mb-1">Description</p>
                    <p className="text-gray-700">{type.description}</p>
                  </div>

                  {/* Action buttons can be uncommented when edit and delete functionality are implemented */}
                  {/* <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button 
                      className="p-1.5 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors text-yellow-600"
                      onClick={() => handleEdit(type.id)}
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>

                    <button 
                      className="p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-red-600"
                      onClick={() => handleDeleteConfirmation(type.id)}
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div> */}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Criteria Types Found</h3>
              <p className="text-gray-500">
                {searchTerm ? "No types match your search. Try different keywords." : "Start by creating a new criteria type."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal for Creating Criteria Type */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Create New Criteria Type</h2>
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
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newCriteriaType.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                      required
                      placeholder="Enter criteria type name"
                    />
                    <p className="mt-1 text-xs text-gray-500">Unique name for this criteria type</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={newCriteriaType.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                      rows="4"
                      required
                      placeholder="Describe this criteria type"
                    />
                    <p className="mt-1 text-xs text-gray-500">Explain what this criteria type represents</p>
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
                      Create Type
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CriteriaType;