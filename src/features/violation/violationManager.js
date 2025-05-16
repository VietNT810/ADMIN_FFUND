import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    getViolationsByManager,
    createViolation,
    updateViolation,
    deleteViolation,
    postEvidence
} from './components/violationSlice';
import { toast } from 'react-toastify';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    XCircleIcon,
    UploadIcon,
    FileIcon,
    ArrowLeftIcon
} from 'lucide-react';
import PropTypes from 'prop-types';

const violationTypes = [
    { value: "COPYRIGHT_INFRINGEMENT", label: "Copyright Infringement" },
    { value: "REWARD_NON_DELIVERY", label: "Reward Non-Delivery" },
    { value: "REWARD_DELAY", label: "Reward Delay" },
    { value: "MONEY_LAUNDERING", label: "Money Laundering" },
    { value: "OTHER", label: "Other" }
];

const ViolationManager = ({ projectId: propProjectId, onBackToSummary }) => {
    const { projectId: paramProjectId } = useParams();
    const dispatch = useDispatch();

    // Use either the prop or URL parameter
    const projectId = propProjectId || paramProjectId;

    const violationState = useSelector(state => state.violation || {});
    const { violations = [], status = 'idle', error = null } = violationState;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [formData, setFormData] = useState({
        type: 'COPYRIGHT_INFRINGEMENT',
        description: '',
    });
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [existingEvidence, setExistingEvidence] = useState(null);

    // Fetch violations on component mount
    useEffect(() => {
        if (projectId) {
            dispatch(getViolationsByManager(projectId));
        }
    }, [dispatch, projectId]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEvidenceFile(e.target.files[0]);
        }
    };

    // Open modal for creating new violation
    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setFormData({
            type: 'COPYRIGHT_INFRINGEMENT',
            description: '',
        });
        setEvidenceFile(null);
        setIsModalOpen(true);
    };

    // Open modal for editing existing violation
    const handleOpenEditModal = (violation) => {
        setIsEditing(true);
        setSelectedViolation(violation);
        setFormData({
            type: violation.type || 'COPYRIGHT_INFRINGEMENT',
            description: typeof violation.description === 'string'
                ? violation.description
                : (violation.description?.description || '')
        });
        setEvidenceFile(null);
        setExistingEvidence(violation.evidenceFile || null);
        setIsModalOpen(true);
    };

    // Open confirmation modal for deletion
    const handleOpenDeleteModal = (violation) => {
        setSelectedViolation(violation);
        setIsDeleteModalOpen(true);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing && selectedViolation) {
                // First update the violation data
                const updatedViolation = await dispatch(updateViolation({
                    violationId: selectedViolation.id,
                    updatedViolation: formData
                })).unwrap();

                // If there's a new evidence file, upload it after the update
                if (evidenceFile) {
                    await dispatch(postEvidence({
                        violationId: selectedViolation.id,
                        evidence: { file: evidenceFile }
                    })).unwrap();
                }

                toast.success('Violation updated successfully!');
            } else {
                // Create new violation with evidence file
                await dispatch(createViolation({
                    projectId: parseInt(projectId),
                    violationData: formData,
                    evidenceFile: evidenceFile
                })).unwrap();

                toast.success('Violation created successfully!');
            }
            setIsModalOpen(false);
            setFormData({
                type: 'COPYRIGHT_INFRINGEMENT',
                description: '',
            });
            setEvidenceFile(null);
            setExistingEvidence(null);

            dispatch(getViolationsByManager(projectId));
        } catch (err) {
            toast.error(err.toString());
        }
    };

    // Handle violation deletion
    const handleDelete = async () => {
        try {
            if (selectedViolation) {
                await dispatch(deleteViolation(selectedViolation.id)).unwrap();
                toast.success('Violation deleted successfully!');
                setIsDeleteModalOpen(false);
                dispatch(getViolationsByManager(projectId));
            }
        } catch (err) {
            toast.error(err.toString());
        }
    };

    // Get violation type label for display
    const getViolationTypeLabel = (typeValue) => {
        const type = violationTypes.find(t => t.value === typeValue);
        return type ? type.label : typeValue;
    };

    if (status === 'loading' && violations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={onBackToSummary}
                        className="mr-3 bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full"
                        title="Back to violations summary"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Manage Project Violations</h1>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Violation
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{typeof error === 'object' ? JSON.stringify(error) : error}</p>
                </div>
            )}

            {violations.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                    <p className="text-gray-600">No violations recorded for this project.</p>
                    <button
                        onClick={handleOpenCreateModal}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Create First Violation
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Violation Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Occurrence
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Evidence
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {violations.map(violation => (
                                <tr key={violation.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${violation.type === 'COPYRIGHT_INFRINGEMENT' ? 'bg-red-100 text-red-800' :
                                            violation.type === 'REWARD_NON_DELIVERY' ? 'bg-yellow-100 text-yellow-800' :
                                                violation.type === 'REWARD_DELAY' ? 'bg-orange-100 text-orange-800' :
                                                    violation.type === 'MONEY_LAUNDERING' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {getViolationTypeLabel(violation.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs break-words">
                                            {(() => {
                                                let descText = '';

                                                if (typeof violation.description === 'string') {
                                                    descText = violation.description;
                                                } else if (typeof violation.description === 'object' && violation.description?.description) {
                                                    descText = String(violation.description.description);
                                                }

                                                return descText.length > 50 ? `${descText.substring(0, 50)}...` : descText || 'No description';
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">
                                            {violation.violate_time || 1} {violation.violate_time > 1 ? 'times' : 'time'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {violation.evidenceFile ? (
                                            <a
                                                href={violation.evidenceFile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <FileIcon className="h-4 w-4 mr-1" />
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleOpenEditModal(violation)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit violation"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDeleteModal(violation)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete violation"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? 'Edit Violation' : 'Add New Violation'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                                    Violation Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                >
                                    {violationTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                                    required
                                    placeholder="Describe the violation..."
                                ></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="evidence">
                                    Evidence File
                                </label>
                                <div className="mt-1 flex items-center">
                                    <label
                                        htmlFor="evidence-file"
                                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    >
                                        <span className="flex items-center">
                                            <UploadIcon className="h-4 w-4 mr-1" />
                                            {evidenceFile ? 'Change file' : 'Select file'}
                                        </span>
                                        <input
                                            id="evidence-file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    {evidenceFile && (
                                        <span className="ml-2 text-sm text-gray-500">
                                            {evidenceFile.name}
                                        </span>
                                    )}
                                </div>

                                {/* Display existing evidence file when editing */}
                                {isEditing && existingEvidence && (
                                    <div className="mt-2 flex items-center text-sm">
                                        <FileIcon className="h-4 w-4 mr-1 text-blue-500" />
                                        <span className="text-gray-600 mr-2">Current evidence:</span>
                                        <a
                                            href={existingEvidence}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {existingEvidence.split('/').pop() || 'View file'}
                                        </a>
                                    </div>
                                )}

                                <p className="mt-1 text-xs text-gray-500">
                                    {isEditing
                                        ? 'Upload new evidence to replace the current one (optional)'
                                        : 'Upload documents, screenshots, or other evidence (PDF, DOC, JPG, PNG)'}
                                </p>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : isEditing ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedViolation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this violation record? This action cannot be undone.
                        </p>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Processing...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ViolationManager.propTypes = {
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onBackToSummary: PropTypes.func.isRequired
};

export default ViolationManager;