import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategoriesContent,
  deleteCategory,
  updateCategory,
  createCategory,
  setCategories,
  enableCategory,
  createSubCategory,
  updateSubCategory
} from './categorySlice';
import { PlusIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

function Categories() {
  const dispatch = useDispatch();
  const { categories, status, error } = useSelector(state => state.category || { categories: [], error: null, status: 'idle' });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isCreateSubModalOpen, setIsCreateSubModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);

  // Form states
  const [isEdit, setIsEdit] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    categoryName: '',
    categoryDescription: '',
    subCategories: [{ subCategoryName: '', subCategoryDescription: '' }]
  });
  const [subCategoryForm, setSubCategoryForm] = useState({
    id: '',
    categoryId: '',
    subCategoryName: '',
    subCategoryDescription: ''
  });

  // UI control states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToConfirm, setCategoryToConfirm] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const role = localStorage.getItem('role');

  const tooltipId = "category-actions-tooltip";

  useEffect(() => {
    dispatch(getCategoriesContent());
  }, [dispatch]);

  // Category Actions
  const handleEnableCategory = (categoryId) => {
    setCategoryToConfirm(categoryId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDisableCategory = (categoryId) => {
    setCategoryToConfirm(categoryId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmActiveCategory = () => {
    if (categoryToConfirm) {
      const category = categories.find(cate => cate.id === categoryToConfirm);
      const action = category.active ? deleteCategory : enableCategory;

      dispatch(action(categoryToConfirm)).then((result) => {
        if (result.error) {
          toast.error(result.payload || "An error occurred while processing the category.");
        } else {
          toast.success(`Category ${category.active ? 'disabled' : 'enabled'} successfully!`);
          const updateCategories = categories.map(cate =>
            cate.id === categoryToConfirm ? { ...cate, active: !category.active } : cate
          );
          dispatch(setCategories(updateCategories));
          setIsDeleteConfirmOpen(false);
        }
      }).catch((error) => {
        toast.error(error.message || "An unexpected error occurred.");
      });
    }
  };

  const handleCreateCategory = () => {
    if (!categoryForm.categoryName || !categoryForm.categoryDescription) {
      toast.error('Category Name and Category Description are required.');
      return;
    }

    const validSubCategories = categoryForm.subCategories.filter(sub =>
      sub.subCategoryName && sub.subCategoryName.trim() !== ''
    );

    if (validSubCategories.length === 0) {
      toast.error('At least one subcategory with a name is required.');
      return;
    }

    const formToSubmit = {
      ...categoryForm,
      subCategories: validSubCategories
    };

    if (!isEdit) {
      const categoryExists = categories.some(category =>
        category.categoryName.toLowerCase() === categoryForm.categoryName.toLowerCase()
      );

      if (categoryExists) {
        toast.error("Category already exists.");
        return;
      }
    }

    dispatch(createCategory(formToSubmit))
      .then((result) => {
        if (result.error) {
          toast.error(result.payload || "An error occurred while creating the category.");
        } else {
          toast.success('Category created successfully!');
          resetCategoryForm();
          dispatch(getCategoriesContent());
        }
      })
      .catch((error) => {
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  const handleUpdateCategory = () => {
    if (!categoryForm.categoryName || !categoryForm.categoryDescription) {
      toast.error('Category Name and Category Description are required.');
      return;
    }

    const formToSubmit = {
      id: categoryForm.id,
      categoryName: categoryForm.categoryName,
      categoryDescription: categoryForm.categoryDescription
    };

    dispatch(updateCategory(formToSubmit))
      .then((result) => {
        if (result.error) {
          toast.error(result.payload || "An error occurred while updating the category.");
        } else {
          toast.success('Category updated successfully!');
          setIsEditCategoryModalOpen(false);
          dispatch(getCategoriesContent());
        }
      })
      .catch((error) => {
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  const handleCreateSubCategory = () => {
    if (!subCategoryForm.subCategoryName) {
      toast.error('Subcategory Name is required.');
      return;
    }

    const formToSubmit = {
      categoryId: subCategoryForm.categoryId,
      subCategoryName: subCategoryForm.subCategoryName,
      subCategoryDescription: subCategoryForm.subCategoryDescription || ''
    };

    dispatch(createSubCategory(formToSubmit))
      .then((result) => {
        if (result.error) {
          toast.error(result.payload || "An error occurred while creating the subcategory.");
        } else {
          toast.success('Subcategory created successfully!');
          setIsCreateSubModalOpen(false);
          dispatch(getCategoriesContent());
        }
      })
      .catch((error) => {
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  const handleUpdateSubCategory = () => {
    if (!subCategoryForm.subCategoryName) {
      toast.error('Subcategory Name is required.');
      return;
    }

    const formToSubmit = {
      id: subCategoryForm.id,
      categoryId: subCategoryForm.categoryId,
      subCategoryName: subCategoryForm.subCategoryName,
      subCategoryDescription: subCategoryForm.subCategoryDescription || ''
    };

    dispatch(updateSubCategory(formToSubmit))
      .then((result) => {
        if (result.error) {
          toast.error(result.payload || "An error occurred while updating the subcategory.");
        } else {
          toast.success('Subcategory updated successfully!');
          setIsEditSubModalOpen(false);
          dispatch(getCategoriesContent());
        }
      })
      .catch((error) => {
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  // Reset Forms
  const resetCategoryForm = () => {
    setCategoryForm({
      id: '',
      categoryName: '',
      categoryDescription: '',
      subCategories: [{ subCategoryName: '', subCategoryDescription: '' }]
    });
    setIsEdit(false);
    setIsCreateModalOpen(false);
    setIsEditCategoryModalOpen(false);
  };

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      id: '',
      categoryId: '',
      subCategoryName: '',
      subCategoryDescription: ''
    });
    setIsCreateSubModalOpen(false);
    setIsEditSubModalOpen(false);
  };

  // Form handlers
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
  };

  const handleSubCategoryChange = (index, e) => {
    const { name, value } = e.target;
    const newSubCategories = [...categoryForm.subCategories];
    newSubCategories[index] = { ...newSubCategories[index], [name]: value };
    setCategoryForm({
      ...categoryForm,
      subCategories: newSubCategories
    });
  };

  const handleSubCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryForm({
      ...subCategoryForm,
      [name]: value
    });
  };

  const handleAddSubCategory = () => {
    setCategoryForm({
      ...categoryForm,
      subCategories: [...categoryForm.subCategories, { subCategoryName: '', subCategoryDescription: '' }]
    });
  };

  const handleRemoveSubCategory = (index) => {
    if (categoryForm.subCategories.length <= 1) {
      toast.warning("At least one subcategory is required.");
      return;
    }

    const newSubCategories = categoryForm.subCategories.filter((_, i) => i !== index);
    setCategoryForm({
      ...categoryForm,
      subCategories: newSubCategories
    });
  };

  // Edit handlers
  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription
    });
    setIsEditCategoryModalOpen(true);
  };

  const handleAddNewSubToCategory = (categoryId, categoryName) => {
    setSubCategoryForm({
      ...subCategoryForm,
      categoryId: categoryId
    });
    setSelectedCategoryName(categoryName);
    setIsCreateSubModalOpen(true);
  };

  const handleEditSubCategory = (categoryId, subCategory, categoryName) => {
    setSubCategoryForm({
      id: subCategory.id,
      categoryId: categoryId,
      subCategoryName: subCategory.subCategoryName,
      subCategoryDescription: subCategory.subCategoryDescription || ''
    });
    setSelectedCategoryName(categoryName);
    setIsEditSubModalOpen(true);
  };

  // UI Controls
  const handleCloseModal = () => {
    resetCategoryForm();
    resetSubCategoryForm();
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filteredCategories = categories.filter((category) =>
    category.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Motion variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <Tooltip
        id={tooltipId}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          fontSize: "0.75rem",
          padding: "4px 8px",
          borderRadius: "4px",
          zIndex: 9999
        }}
      />
      <div className="max-w-[95%] mx-auto bg-base-100 shadow-xl rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Category Management</h1>

        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 items-center">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Add Category Button */}
          {role === 'ADMIN' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Category Cards */}
        <motion.div
          className="grid grid-cols-1 gap-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCategories.length > 0 ? filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              className={`rounded-lg border ${category.active ? 'border-gray-200' : 'border-gray-300'} overflow-hidden shadow-md transition-all duration-300`}
              variants={cardVariants}
            >
              <div
                className={`px-5 py-4 ${category.active ? 'bg-white' : 'bg-gray-50'} flex justify-between items-center cursor-pointer`}
                onClick={() => toggleCategoryExpansion(category.id)}
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{category.categoryName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.categoryDescription}</p>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-200 text-gray-600'}`}
                  >
                    {category.active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Actions directly visible */}
                  {role === 'ADMIN' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Edit Category"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>

                      {category.active ? (
                        <button
                          onClick={() => handleDisableCategory(category.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-red-600"
                          data-tooltip-id={tooltipId}
                          data-tooltip-content="Disable Category"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnableCategory(category.id)}
                          className="p-2 bg-green-50 hover:bg-green-100 rounded-md transition-colors text-green-600"
                          data-tooltip-id={tooltipId}
                          data-tooltip-content="Enable Category"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleAddNewSubToCategory(category.id, category.categoryName)}
                        className="p-2 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors text-purple-600"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="Add Subcategory"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </button>

                      <Link
                        to={`/app/criteria?category=${encodeURIComponent(category.categoryName)}`}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors text-indigo-600"
                        data-tooltip-id={tooltipId}
                        data-tooltip-content="View Criteria"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                      </Link>
                    </div>
                  )}

                  {/* Visual indicator for expansion */}
                  <div className="p-1 rounded-md bg-gray-100">
                    {expandedCategory === category.id ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Subcategories Expansion */}
              <AnimatePresence>
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          Subcategories ({category.subCategories?.length || 0})
                        </h4>

                        {role === 'ADMIN' && (
                          <button
                            onClick={() => handleAddNewSubToCategory(category.id, category.categoryName)}
                            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add Subcategory
                          </button>
                        )}
                      </div>

                      {category.subCategories?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.subCategories.map((subCategory, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors relative"
                            >
                              {role === 'ADMIN' && (
                                <button
                                  onClick={() => handleEditSubCategory(category.id, subCategory, category.categoryName)}
                                  className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
                                  data-tooltip-id={tooltipId}
                                  data-tooltip-content="Edit Subcategory"
                                  data-tooltip-place="top"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                  </svg>
                                </button>
                              )}
                              <h5 className="font-medium text-gray-800 pr-6">{subCategory.subCategoryName}</h5>
                              <p className="text-sm text-gray-600 mt-1">{subCategory.subCategoryDescription}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No subcategories available</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )) : (
            <div className="py-10 text-center">
              <svg className="mx-auto h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? `No categories matching "${searchQuery}"` : "Start by creating a new category."}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-200 px-6 py-4 bg-blue-50 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-800">
                Create New Category
              </h2>
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
              {/* Main Category Fields */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">
                  Main Category Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="categoryName"
                      type="text"
                      name="categoryName"
                      value={categoryForm.categoryName || ''}
                      onChange={handleCategoryChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Enter Category Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="categoryDescription"
                      name="categoryDescription"
                      value={categoryForm.categoryDescription}
                      onChange={handleCategoryChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Enter Category Description"
                    />
                  </div>
                </div>
              </div>

              {/* Sub Categories Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-700">
                    Subcategories
                  </h3>
                  <button
                    onClick={handleAddSubCategory}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Subcategory
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryForm.subCategories.map((subCategory, index) => (
                    <motion.div
                      key={index}
                      className="p-4 border border-blue-100 rounded-lg bg-blue-50/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-blue-700">Subcategory #{index + 1}</h4>
                        <button
                          onClick={() => handleRemoveSubCategory(index)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="subCategoryName"
                            value={subCategory.subCategoryName || ''}
                            onChange={(e) => handleSubCategoryChange(index, e)}
                            placeholder="Subcategory Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="subCategoryDescription"
                            value={subCategory.subCategoryDescription}
                            onChange={(e) => handleSubCategoryChange(index, e)}
                            placeholder="Subcategory Description"
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Create Category
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Category Modal (mới) */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-200 px-6 py-4 bg-blue-50 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-800">
                Edit Category
              </h2>
              <button
                onClick={() => setIsEditCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Category Fields */}
              <div className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="editCategoryName"
                      type="text"
                      name="categoryName"
                      value={categoryForm.categoryName || ''}
                      onChange={handleCategoryChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Enter Category Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="editCategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="editCategoryDescription"
                      name="categoryDescription"
                      value={categoryForm.categoryDescription}
                      onChange={handleCategoryChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Enter Category Description"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditCategoryModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Update Category
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Subcategory Modal (mới) */}
      {isCreateSubModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-200 px-6 py-4 bg-purple-50 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-purple-800">
                Add Subcategory to <span className="italic">{selectedCategoryName}</span>
              </h2>
              <button
                onClick={() => setIsCreateSubModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Subcategory Fields */}
              <div className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subCategoryName"
                      type="text"
                      name="subCategoryName"
                      value={subCategoryForm.subCategoryName || ''}
                      onChange={handleSubCategoryFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Enter Subcategory Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="subCategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory Description
                    </label>
                    <textarea
                      id="subCategoryDescription"
                      name="subCategoryDescription"
                      value={subCategoryForm.subCategoryDescription || ''}
                      onChange={handleSubCategoryFormChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Enter Subcategory Description"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsCreateSubModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubCategory}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Subcategory
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Subcategory Modal (mới) */}
      {isEditSubModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-200 px-6 py-4 bg-purple-50 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-purple-800">
                Edit Subcategory in <span className="italic">{selectedCategoryName}</span>
              </h2>
              <button
                onClick={() => setIsEditSubModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Subcategory Fields */}
              <div className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editSubCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="editSubCategoryName"
                      type="text"
                      name="subCategoryName"
                      value={subCategoryForm.subCategoryName || ''}
                      onChange={handleSubCategoryFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Enter Subcategory Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="editSubCategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory Description
                    </label>
                    <textarea
                      id="editSubCategoryDescription"
                      name="subCategoryDescription"
                      value={subCategoryForm.subCategoryDescription || ''}
                      onChange={handleSubCategoryFormChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Enter Subcategory Description"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditSubModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubCategory}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Update Subcategory
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              {/* Icon: warning or check based on action */}
              {categories.find(category => category.id === categoryToConfirm)?.active ? (
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
              ) : (
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              )}

              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Confirm Action
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {categories.find(category => category.id === categoryToConfirm)?.active ? 'disable' : 'enable'} this category?
                {categories.find(category => category.id === categoryToConfirm)?.active && (
                  <span className="block mt-2 text-sm text-gray-500">
                    This category will no longer be available for selection.
                  </span>
                )}
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActiveCategory}
                  className={`px-5 py-2 ${categories.find(category => category.id === categoryToConfirm)?.active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors`}
                >
                  {categories.find(category => category.id === categoryToConfirm)?.active ? 'Yes, Disable' : 'Yes, Enable'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Categories;