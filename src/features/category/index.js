import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategoriesContent, deleteCategory, updateCategory, createCategory } from './categorySlice';
import { PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'; 
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function Categories() {
  const dispatch = useDispatch();
  const { categories, status, error } = useSelector(state => state.category);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    subCategories: [{ name: '', description: '' }]
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(getCategoriesContent());
  }, [dispatch]);

  const deleteCategoryHandler = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete.id))
        .then(() => {
          toast.success('Category deleted successfully!');
          setIsDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        })
        .catch((error) => {
          toast.error('Error deleting category');
        });
    }
  };

  const handleCreateCategory = () => {
    const action = isEdit ? updateCategory : createCategory;

    if (!isEdit) {
      const categoryExists = categories.some(category => category.name.toLowerCase() === categoryForm.name.toLowerCase());

      if (categoryExists) {
        toast.error("Category already exists.");
        return;
      }
    }

    dispatch(action(categoryForm))
      .then(() => {
        toast.success(isEdit ? 'Category updated successfully!' : 'Category created successfully!');
        resetForm();
      })
      .catch((error) => {
        if (error?.response?.data?.error === "Category already exists.") {
          toast.error("Category already exists.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      });
  };

  const resetForm = () => {
    setCategoryForm({
      id: '',
      name: '',
      description: '',
      subCategories: [{ name: '', description: '' }]
    });
    setIsEdit(false);
    setIsCreateModalOpen(false);
  };

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

  const handleAddSubCategory = () => {
    setCategoryForm({
      ...categoryForm,
      subCategories: [...categoryForm.subCategories, { name: '', description: '' }]
    });
  };

  const handleRemoveSubCategory = (index) => {
    const newSubCategories = categoryForm.subCategories.filter((_, i) => i !== index);
    setCategoryForm({
      ...categoryForm,
      subCategories: newSubCategories
    });
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description,
      subCategories: category.subCategories || [{ name: '', description: '' }]
    });
    setIsEdit(true);
    setIsCreateModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
    setOpenDropdown(null); 
  };

  const toggleDropdown = (categoryId) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-lg rounded-lg p-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="relative group"> 
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-700 transition duration-200"
            >
              <PlusIcon className="w-5 h-5 inline-block" />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 top-12 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Add new Category
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <motion.table 
            className="table-auto w-full bg-base-100 shadow-md rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <thead>
              <tr className="bg-base-200 dark:text-orange-400 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Category Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Sub Categories</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map((category, index) => (
                <tr key={category.id} className="border-t">
                  <td className="px-4 py-2 text-sm dark:text-gray-200">{index + 1}</td>
                  <td className="px-4 py-2 text-sm dark:text-gray-200">{category.name}</td>
                  <td className="px-4 py-2 text-sm dark:text-gray-200">{category.description}</td>
                  <td className="px-4 py-2 text-sm dark:text-gray-200">
                    <ul>
                      {category.subCategories.length > 0 ? category.subCategories.map((subCategory, subIndex) => (
                        <li key={subCategory.id} className="text-sm dark:text-gray-200">
                          {subIndex + 1}. {subCategory.name}
                        </li>
                      )) : (
                        <li className="text-sm dark:text-gray-200">No subcategories</li>
                      )}
                    </ul>
                  </td>
                  <td className="px-4 py-2 text-sm text-center">
                    <button
                      onClick={() => toggleDropdown(category.id)} 
                      className="bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition duration-200"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5 inline-block" />
                    </button>

                    {openDropdown === category.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                        <ul className="py-1">
                          <li>
                            <button
                              onClick={() => handleEditCategory(category)} 
                              className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                            >
                              Edit Category
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleDeleteCategory(category)} 
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete Category
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-600 py-4">No categories available</td>
                </tr>
              )}
            </tbody>
          </motion.table>
        </div>
      </div>

      {/* Modal Create or Edit Category */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-8 w-full sm:w-96 lg:w-1/2 shadow-lg transition-all ease-in-out transform duration-300 overflow-y-auto max-h-[80vh]">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">{isEdit ? 'Edit Category' : 'Create New Category'}</h3>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm text-gray-700">Category Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
                placeholder="Enter Category Name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm text-gray-700">Category Description</label>
              <textarea
                id="description"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
                placeholder="Enter Category Description"
              />
            </div>

            {/* Sub Categories */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Sub Categories</label>
              {categoryForm.subCategories.map((subCategory, index) => (
                <div key={index} className="flex space-x-4 mt-4">
                  <input
                    type="text"
                    name="name"
                    value={subCategory.name}
                    onChange={(e) => handleSubCategoryChange(index, e)}
                    placeholder="Sub Category Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
                  />
                  <textarea
                    name="description"
                    value={subCategory.description}
                    onChange={(e) => handleSubCategoryChange(index, e)}
                    placeholder="Sub Category Description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
                  />
                  <button
                    onClick={() => handleRemoveSubCategory(index)}
                    className="text-red-500 hover:text-red-700 mt-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddSubCategory}
                className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-700 transition duration-200"
              >
                Add Sub Category
              </button>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleCreateCategory}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-200 w-full sm:w-auto"
              >
                {isEdit ? 'Update Category' : 'Create Category'}
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-200 w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full sm:w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Are you sure you want to delete this category?</h3>

            <div className="flex justify-around mt-4">
              <button
                onClick={deleteCategoryHandler}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200 w-24"
              >
                Yes
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 w-24"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
