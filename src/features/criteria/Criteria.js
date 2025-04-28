import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getAllCriteria, createCriteria, getAllCriteriaType, updateCriteria, deleteCriteria } from './criteriaSlice';
import { MagnifyingGlassIcon, EyeIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCategoriesContent } from '../category/categorySlice'

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


  useEffect(() => {
    dispatch(getCategoriesContent());
    dispatch(getAllCriteria({ page: page, sortField, sortOrder }));
    dispatch(getAllCriteriaType());
  }, [dispatch, page, sortField, sortOrder]);

  // Optimized search function to use dispatch directly
  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`categoryName:eq:${searchTerm}`);
    if (selectedMainCategory !== "All") queryParts.push(`category.name:eq:${selectedMainCategory}`);
    if (selectedSubCategory !== "All") queryParts.push(`subCategories.subCategory.name:eq:${selectedSubCategory}`);
    const query = queryParts.join(",");
    dispatch(getAllCriteria({ query, page: page, size: 10, sortField, sortOrder }));
  };

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
          if(result.error){
            toast.error(result.payload || "An error occurred while processing the category.");
          } else { 
            toast.success(result.payload);
            setModalOpen(false);
            resetNewCriteria();
            dispatch(getAllCriteria({ query: searchTerm, page, size: 10, sortField, sortOrder }));
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

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    resetNewCriteria();
  };

  if (status === 'loading') return <Loading />;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search TypeName Criteria"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full md:w-1/3"
          />
          <select
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubCategory('All');
            }}
            className="select select-bordered w-full md:w-1/4"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
          <button
            onClick={toggleModal}
            className="btn bg-green-500 hover:bg-green-600 text-white"
          >
            <PlusIcon className="w-5 h-5 mr-1" />
            Create Criteria
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="btn bg-orange-500 hover:bg-orange-600 text-white w-full"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-1" />
            Search
          </button>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="table w-full bg-base-100 shadow-md rounded-lg border">
            <thead className="bg-base-200 text-sm font-semibold text-base-content border-b">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Cetegory</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {criteriaList.map((criteria, index) => (
                <motion.tr key={criteria.id} className="hover:bg-base-100 transition">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium">{criteria.typeName}</td>
                  <td className="px-4 py-2 text-sm">{criteria.description}</td>
                  <td className="px-4 py-2 text-sm">{criteria.categoryName}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-3">
                      <Link to={`/app/criteria-details/${criteria.id}`} className="tooltip" data-tip="View">
                        <EyeIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </Link>

                      {/* Edit Icon */}
                      <button onClick={() => handleEdit(criteria.id)} className="tooltip" data-tip="Edit">
                        <PencilIcon className="w-5 h-5 text-yellow-600 hover:text-yellow-800" />
                      </button>

                      {/* Delete Icon */}
                      <button onClick={() => handleDeleteConfirmation(criteria.id)} className="tooltip" data-tip="Delete">
                        <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="btn btn-outline">
            Previous
          </button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="btn btn-outline">
            Next
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300">
            <h3 className="text-xl font-bold mb-4">Create New Criteria</h3>
            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block mb-2">Maximum Point</label>
                <input
                  type="number"
                  name="maximumPoint"
                  value={newCriteria.maximumPoint}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={newCriteria.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Category</label>
                <select
                  name="categoryId"
                  value={newCriteria.categoryId}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
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
              <div className="mb-4">
                <label className="block mb-2">Criteria Type</label>
                <select
                  name="typeId"
                  value={newCriteria.typeId}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
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
              <div className="flex justify-end gap-3">
                <button type="submit" className="btn btn-success">Create</button>
                <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300">
            <h3 className="text-xl font-bold mb-4">Edit Criteria</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label className="block mb-2">Maximum Point</label>
                <input
                  type="number"
                  name="maximumPoint"
                  value={newCriteria.maximumPoint}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={newCriteria.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="submit" className="btn btn-success">Save</button>
                <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      {confirmDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl w-96 border border-base-300">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this criteria?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-error"
              >
                Yes
              </button>
              <button
                onClick={handleDeleteCancel}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Criteria;
