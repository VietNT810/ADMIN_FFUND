import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getAllCriteriaType, createCriteriaType } from './criteriaSlice';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';

const CriteriaType = () => {
  const dispatch = useDispatch();
  const { criteriaTypes, status, error } = useSelector(state => state.criteria);
  
  const [newCriteriaType, setNewCriteriaType] = useState({
    name: '',
    description: '',
  });
  const [modalOpen, setModalOpen] = useState(false);

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
            toast.error(result.payload || "An error occurred while processing the category.");
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

  if (status === 'loading') return <Loading />;

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4 text-base-content">
      <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8 space-y-8">
        
        {/* Button to Open Modal */}
        <button
          onClick={toggleModal}
          className="btn bg-green-500 hover:bg-green-600 text-white"
        >
          Create New Type
        </button>

        {/* Main Criteria Type List */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Criteria Types</h2>
          <div className="space-y-4">
            {criteriaTypes?.length > 0 ? (
              criteriaTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  className="p-6 border rounded-lg shadow-lg bg-white hover:bg-gray-50 transition duration-300 ease-in-out"
                >
                  <h4 className="font-semibold text-lg text-gray-800">{`Type ${index + 1}`}</h4>
                  <div className="mt-2 text-gray-600">
                    <p><strong>Name:</strong> {type.name}</p>
                    <p><strong>Description:</strong> {type.description}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p>No criteria types available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Creating Criteria Type */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h3 className="text-2xl font-semibold mb-4">Create New Criteria Type</h3>
            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  value={newCriteriaType.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full"
                  value={newCriteriaType.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="submit" className="btn bg-orange-500 hover:bg-orange-600 text-white">Create</button>
                <button type="button" className="btn btn-ghost" onClick={toggleModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaType;
