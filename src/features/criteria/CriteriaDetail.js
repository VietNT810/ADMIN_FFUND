import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../../components/Loading';
import { getCriteriaAllDetail, getCriteriaById, createDetailCriteria, updateDetailCriteria, deleteDetailCriteria } from './criteriaSlice';
import { toast } from 'react-toastify';

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

  // Handle form submission for creating a new criteria detail
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

  // Handle update form submission
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

  // Handle delete confirmation
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

  // Reset form after submission
  const resetNewCriteriaDetail = () => {
    setNewCriteriaDetail({
      basicRequirement: '',
      evaluationCriteria: '',
      maxPoint: '',
    });
  };

  // Validate the form data
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

  // Open modal
  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleUpdateModal = () => setUpdateModalOpen(!updateModalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  // total maxPoint
  const totalMaxPoint = currentCriteriaDetail?.reduce((total, detail) => total + detail.maxPoint, 0) || 0;

  // Check if the total maxPoint is equal to the criteria maximumPoint
  const isMaxPointReached = totalMaxPoint >= currentCriteria?.maximumPoint;
  
  // Check if the total maxPoint is less than the criteria maximumPoint
  const isMaxPointNotMet = totalMaxPoint < currentCriteria?.maximumPoint;

  if (status === 'loading') return <Loading />;
  
  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8 space-y-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn bg-orange-500 hover:bg-orange-600 text-white mb-6"
        >
          Back
        </button>

        {/* Main Criteria Info */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div><p><strong>Type Name:</strong> {currentCriteria?.typeName}</p></div>
            <div><p><strong>Category:</strong> {currentCriteria?.categoryName}</p></div>
            <div><p><strong>Maximum Point:</strong> {currentCriteria?.maximumPoint}</p></div>
            <div><p><strong>Description:</strong> {currentCriteria?.description}</p></div>
          </div>
        </div>

        {/* Button to Open Modal if maxPoint is not reached */}
        {!isMaxPointReached && (
          <button
            onClick={toggleModal}
            className="btn bg-green-500 hover:bg-green-600 text-white"
          >
            Add Detail Criteria
          </button>
        )}

        {/* Show warning message if maxPoint is not met */}
        {isMaxPointNotMet && (
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 mb-4">
            <p><strong>Warning:</strong> You need to add more details to match the total max points with the maximum point of the criteria before using it for the category.</p>
          </div>
        )}

        {/* Criteria Detail List */}
        <div className="mt-6">
          {currentCriteriaDetail?.length > 0 ? (
            <div className="space-y-4">
              {currentCriteriaDetail.map((detail, index) => (
                <div key={index} className="p-6 border rounded-lg shadow-lg bg-white hover:bg-gray-50 transition duration-300 ease-in-out">
                  <h4 className="font-semibold text-lg text-gray-800">{`Detail ${index + 1}`}</h4>
                  <div className="mt-2 text-gray-600">
                    <p><strong>Basic Requirement:</strong> {detail.basicRequirement}</p>
                    <p><strong>Evaluation Criteria:</strong> {detail.evaluationCriteria}</p>
                    <p><strong>Max Point:</strong> {detail.maxPoint}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => {
                        setUpdateCriteriaDetail(detail);
                        toggleUpdateModal();
                      }} className="btn btn-primary text-white">Update</button>
                      <button onClick={() => {
                        setDeleteCriteriaDetail(detail);
                        toggleDeleteModal();
                      }} className="btn btn-error text-white">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-100 rounded-lg">
              <p>No details available for this criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating Detail Criteria */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h3 className="text-2xl font-semibold mb-4">Create New Detail Criteria</h3>
            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block text-gray-700">Basic Requirement</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newCriteriaDetail.basicRequirement}
                  onChange={(e) => setNewCriteriaDetail({ ...newCriteriaDetail, basicRequirement: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Evaluation Criteria</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newCriteriaDetail.evaluationCriteria}
                  onChange={(e) => setNewCriteriaDetail({ ...newCriteriaDetail, evaluationCriteria: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Max Point</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={newCriteriaDetail.maxPoint}
                  onChange={(e) => setNewCriteriaDetail({ ...newCriteriaDetail, maxPoint: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="submit" className="btn bg-blue-500 hover:bg-blue-600 text-white">Create</button>
                <button type="button" className="btn btn-ghost" onClick={toggleModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Updating Detail Criteria */}
      {updateModalOpen && updateCriteriaDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h3 className="text-2xl font-semibold mb-4">Update Detail Criteria</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Basic Requirement</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={updateCriteriaDetail.basicRequirement}
                  onChange={(e) => setUpdateCriteriaDetail({ ...updateCriteriaDetail, basicRequirement: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Evaluation Criteria</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={updateCriteriaDetail.evaluationCriteria}
                  onChange={(e) => setUpdateCriteriaDetail({ ...updateCriteriaDetail, evaluationCriteria: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Max Point</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={updateCriteriaDetail.maxPoint}
                  onChange={(e) => setUpdateCriteriaDetail({ ...updateCriteriaDetail, maxPoint: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="submit" className="btn bg-blue-500 hover:bg-blue-600 text-white">Update</button>
                <button type="button" className="btn btn-ghost" onClick={toggleUpdateModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {deleteModalOpen && deleteCriteriaDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h3 className="text-2xl font-semibold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this detail?</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={handleDeleteConfirm} className="btn bg-red-500 hover:bg-red-600 text-white">Delete</button>
              <button type="button" className="btn btn-ghost" onClick={toggleDeleteModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaDetail;
