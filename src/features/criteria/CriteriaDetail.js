import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Loading from '../../components/Loading';
import { getCriteriaAllDetail, getCriteriaById, createDetailCriteria, updateDetailCriteria, deleteDetailCriteria } from './criteriaSlice';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CriteriaDetail = () => {
  const { criteriaId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [newCriteriaDetail, setNewCriteriaDetail] = useState({
    basicRequirement: '',
    evaluationCriteria: '',
    maxPoint: '',
  });

  const [updateCriteriaDetail, setUpdateCriteriaDetail] = useState(null);
  const [deleteCriteriaDetail, setDeleteCriteriaDetail] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Retrieve criteria details and main criteria information from Redux state
  const { currentCriteria, currentCriteriaDetail, status, error } = useSelector(state => state.criteria || { currentCriteria: null, currentCriteriaDetail: null, error: null, status: 'idle' });

  useEffect(() => {
    if (criteriaId) {
      dispatch(getCriteriaAllDetail(criteriaId));
      dispatch(getCriteriaById(criteriaId));
    }
  }, [dispatch, criteriaId]);

  // Handler functions - unchanged
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (validateForm(newCriteriaDetail)) {
      dispatch(createDetailCriteria({ ...newCriteriaDetail, id: criteriaId }))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while processing the detail.");
          } else {
            toast.success(result.payload);
            setModalOpen(false);
            resetNewCriteriaDetail();
            dispatch(getCriteriaAllDetail(criteriaId));
          }
        });
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (validateForm(updateCriteriaDetail)) {
      dispatch(updateDetailCriteria({ ...updateCriteriaDetail }))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while updating the detail.");
          } else {
            toast.success(result.payload);
            setUpdateModalOpen(false);
            dispatch(getCriteriaAllDetail(criteriaId));
          }
        });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteCriteriaDetail) {
      dispatch(deleteDetailCriteria(deleteCriteriaDetail.id))
        .then((result) => {
          if (result.error) {
            toast.error(result.payload || "An error occurred while deleting the detail.");
          } else {
            toast.success(result.payload);
            setDeleteModalOpen(false);
            dispatch(getCriteriaAllDetail(criteriaId));
          }
        });
    }
  };

  const resetNewCriteriaDetail = () => {
    setNewCriteriaDetail({
      basicRequirement: '',
      evaluationCriteria: '',
      maxPoint: '',
    });
  };

  const validateForm = (criteria) => {
    if (!criteria.basicRequirement) {
      toast.error('Basic Requirement is required!');
      return false;
    }
    if (!criteria.evaluationCriteria) {
      toast.error('Evaluation Criteria are required!');
      return false;
    }
    if (!criteria.maxPoint) {
      toast.error('Max Point is required!');
      return false;
    }
    return true;
  };

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleUpdateModal = () => setUpdateModalOpen(!updateModalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  const totalMaxPoint = currentCriteriaDetail?.reduce((total, detail) => total + detail.maxPoint, 0) || 0;
  const isMaxPointReached = totalMaxPoint >= currentCriteria?.maximumPoint;
  const isMaxPointNotMet = totalMaxPoint < currentCriteria?.maximumPoint;

  if (status === 'loading') return <Loading />;

  return (
    <div className="min-h-screen bg-base-200 py-4 px-3 text-base-content">
      <div className="max-w-[95%] mx-auto bg-base-100 shadow-lg rounded-lg p-4">
        {/* Header - Compact */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors"
              title="Go back"
            >
              <ChevronLeftIcon className="h-4 w-4 text-orange-500" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Criteria Details</h1>
          </div>

          {!isMaxPointReached && (
            <button
              onClick={toggleModal}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 flex items-center gap-1.5 rounded text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Detail
            </button>
          )}
        </div>

        {/* Criteria Information Card - Compact */}
        <motion.div
          className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-medium text-gray-800">Criteria Information</h2>
            {isMaxPointReached && (
              <span className="inline-flex items-center text-green-600 text-xs px-2 py-0.5 bg-green-50 rounded-full">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Complete
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-gray-700">{currentCriteria?.typeName || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="font-medium">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
                  {currentCriteria?.categoryName || "N/A"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Max Point</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                  {currentCriteria?.maximumPoint || 0} pts
                </span>
                <span className="text-xs text-gray-500">({totalMaxPoint}/{currentCriteria?.maximumPoint} allocated)</span>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-gray-700 text-sm">{currentCriteria?.description || "No description available."}</p>
            </div>
          </div>
        </motion.div>

        {/* Warning message - More compact */}
        {isMaxPointNotMet && (
          <motion.div
            className="p-2 mb-3 bg-amber-50 border border-amber-300 rounded text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-2">
              <ExclamationCircleIcon className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 text-xs">
                  Points allocation incomplete: <span className="font-medium">{totalMaxPoint}/{currentCriteria?.maximumPoint} pts</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Title - Compact */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-gray-800 flex items-center">
            Criteria Details
            {currentCriteriaDetail?.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-700 text-xs py-0.5 px-1.5 rounded-full">
                {currentCriteriaDetail.length}
              </span>
            )}
          </h2>
        </div>

        {/* Criteria Detail List - More compact */}
        {currentCriteriaDetail?.length > 0 ? (
          <div className="space-y-3">
            {currentCriteriaDetail.map((detail, index) => (
              <motion.div
                key={detail.id || index}
                className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="p-1.5 bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="mb-2">
                      <label className="text-xs text-gray-500">Basic Requirement</label>
                      <p className="text-sm text-gray-800">{detail.basicRequirement}</p>
                    </div>

                    <div className="mb-2">
                      <label className="text-xs text-gray-500">Evaluation Criteria</label>
                      <p className="text-sm text-gray-800">{detail.evaluationCriteria}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">Max Point:</label>
                      <span className="px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                        {detail.maxPoint} pts
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setUpdateCriteriaDetail(detail);
                        toggleUpdateModal();
                      }}
                      className="p-1 rounded hover:bg-gray-100 text-gray-600"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setDeleteCriteriaDetail(detail);
                        toggleDeleteModal();
                      }}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="py-6 px-4 text-center bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700 mb-1">No details available</h3>
            <p className="text-xs text-gray-500 mb-3">Add criteria details for evaluation</p>

            {!isMaxPointReached && (
              <button
                onClick={toggleModal}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 flex items-center gap-1 rounded text-xs"
              >
                <PlusIcon className="w-3 h-3" />
                Add First Detail
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Create Modal - Streamlined */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden m-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Add Detail Criteria</h2>
              <button onClick={toggleModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmitCreate}>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Basic Requirement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={newCriteriaDetail.basicRequirement}
                    onChange={(e) => setNewCriteriaDetail({ ...newCriteriaDetail, basicRequirement: e.target.value })}
                    rows="2"
                    placeholder="Enter basic requirements"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Evaluation Criteria <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={newCriteriaDetail.evaluationCriteria}
                    onChange={(e) => setNewCriteriaDetail({ ...newCriteriaDetail, evaluationCriteria: e.target.value })}
                    rows="2"
                    placeholder="Enter evaluation criteria"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Point <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-xs relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm pr-12"
                      placeholder="0"
                      value={newCriteriaDetail.maxPoint}
                      onChange={(e) => setNewCriteriaDetail({ ...newCriteriaDetail, maxPoint: e.target.value })}
                      required
                      min="1"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">points</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Remaining: {(currentCriteria?.maximumPoint || 0) - totalMaxPoint} pts
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Modal - Streamlined */}
      {updateModalOpen && updateCriteriaDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden m-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-800">Update Detail Criteria</h2>
              <button onClick={toggleUpdateModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleUpdateSubmit}>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Basic Requirement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={updateCriteriaDetail.basicRequirement}
                    onChange={(e) => setUpdateCriteriaDetail({ ...updateCriteriaDetail, basicRequirement: e.target.value })}
                    rows="2"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Evaluation Criteria <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    value={updateCriteriaDetail.evaluationCriteria}
                    onChange={(e) => setUpdateCriteriaDetail({ ...updateCriteriaDetail, evaluationCriteria: e.target.value })}
                    rows="2"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Point <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-xs relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm pr-12"
                      value={updateCriteriaDetail.maxPoint}
                      onChange={(e) => setUpdateCriteriaDetail({ ...updateCriteriaDetail, maxPoint: e.target.value })}
                      required
                      min="1"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">points</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={toggleUpdateModal}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal - Streamlined */}
      {deleteModalOpen && deleteCriteriaDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-xs w-full m-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Delete Detail Criteria
              </h3>

              <p className="text-xs text-gray-500 mb-4">
                Are you sure you want to delete this detail criteria? This action cannot be undone.
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={toggleDeleteModal}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CriteriaDetail;