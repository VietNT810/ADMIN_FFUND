import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchAllPhaseRules,
    createPhaseRule,
    updatePhaseRule
} from './components/phaseRuleSlice';
import { Edit, Save, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info, AlertCircle } from 'lucide-react';

function PhaseRuleManagement() {
    const dispatch = useDispatch();
    const { rules, status, error } = useSelector((state) => state.phaseRules);

    const [newRule, setNewRule] = useState({
        minTotal: "",
        totalPhaseCount: ""
    });

    const [editingRule, setEditingRule] = useState(null);
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [filter, setFilter] = useState({ min: 0, max: Infinity });
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        // Fetch all phase rules when component mounts
        setIsTableLoading(true);
        dispatch(fetchAllPhaseRules())
            .finally(() => {
                setIsTableLoading(false);
            });
    }, [dispatch]);

    // Sort rules by minTotal for better display
    const sortedRules = [...rules].sort((a, b) => a.minTotal - b.minTotal);

    const validateNewRule = () => {
        if (!newRule.minTotal || newRule.minTotal < 1000) {
            setValidationError('Minimum total cannot be less than $1,000');
            setTimeout(() => setValidationError(''), 5000);
            return false;
        }

        if (!newRule.totalPhaseCount || newRule.totalPhaseCount < 1) {
            setValidationError('Total phase count must be at least 1');
            setTimeout(() => setValidationError(''), 5000);
            return false;
        }

        if (sortedRules.length > 0) {
            const isDuplicate = sortedRules.some(rule => rule.minTotal === newRule.minTotal);
            if (isDuplicate) {
                setValidationError('Minimum total cannot be the same as an existing rule');
                setTimeout(() => setValidationError(''), 5000);
                return false;
            }
        }

        setValidationError('');
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRule({
            ...newRule,
            [name]: value === "" ? "" : parseInt(value, 10) || 0
        });
    };

    const handleEditingChange = (e) => {
        const { name, value } = e.target;
        setEditingRule({
            ...editingRule,
            [name]: name === 'totalPhaseCount' ? parseInt(value, 10) || 0 : value
        });
    };

    const handleCreateRule = () => {
        if (validateNewRule()) {
            setIsSubmitting(true);
            dispatch(createPhaseRule({
                minTotal: newRule.minTotal,
                maxTotal: null,
                totalPhaseCount: newRule.totalPhaseCount
            })).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    setNewRule({
                        minTotal: "",
                        totalPhaseCount: ""
                    });
                    setTimeout(() => setShowSuccessMessage(false), 3000);

                    // Quietly refresh the table data
                    setIsTableLoading(true);
                    dispatch(fetchAllPhaseRules())
                        .finally(() => setIsTableLoading(false));
                } else {
                    console.error('Failed to create rule:', result.payload || result.error);
                }
            }).finally(() => {
                setIsSubmitting(false);
            });
        }
    };

    const handleUpdateRule = () => {
        if (editingRule) {
            setIsSubmitting(true);
            const ruleId = editingRule.id;

            dispatch(updatePhaseRule({
                id: ruleId,
                updatedRule: {
                    minTotal: editingRule.minTotal,
                    maxTotal: null,
                    totalPhaseCount: editingRule.totalPhaseCount
                }
            })).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    setEditingRule(null);

                    setTimeout(() => setShowSuccessMessage(false), 3000);

                    // Quietly refresh the table data
                    setIsTableLoading(true);
                    dispatch(fetchAllPhaseRules())
                        .finally(() => setIsTableLoading(false));
                }
            }).finally(() => {
                setIsSubmitting(false);
            });
        }
    };

    const startEditing = (rule) => {
        setEditingRule({
            ...rule,
            totalPhaseCount: rule.totalPhaseCount || ""
        });
    };

    const cancelEditing = () => {
        setEditingRule(null);
    };

    // Tooltip component
    const Tooltip = ({ children, text }) => {
        const [show, setShow] = useState(false);

        return (
            <div className="relative inline-block">
                <div
                    onMouseEnter={() => setShow(true)}
                    onMouseLeave={() => setShow(false)}
                >
                    {children}
                </div>
                {show && (
                    <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
                        {text}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
                    </div>
                )}
            </div>
        );
    };

    const filteredRules = rules.filter(rule =>
        rule.minTotal >= filter.min && rule.minTotal <= filter.max
    );

    const paginatedRules = filteredRules.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const totalPages = Math.ceil(filteredRules.length / itemsPerPage);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value === "" ? (name === "min" ? 0 : Infinity) : parseInt(value, 10)
        });
        setCurrentPage(0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(0);
            let startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
            let endPage = Math.min(startPage + maxPagesToShow - 3, totalPages - 2);

            if (endPage === totalPages - 2) {
                startPage = Math.max(endPage - maxPagesToShow + 3, 1);
            }

            if (startPage > 1) {
                pageNumbers.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            pageNumbers.push(totalPages - 1);
        }

        return pageNumbers;
    };

    return (
        <div className="container mx-auto p-4 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Phase Rule Management</h1>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {/* Create New Rule Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-t-4 border-blue-500">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    Create New Phase Rule
                </h2>

                {validationError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{validationError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Minimum Total Amount ($)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <input
                                type="number"
                                name="minTotal"
                                value={newRule.minTotal || ""}
                                onChange={handleInputChange}
                                className="w-full pl-8 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                min="1000"
                                placeholder="Enter minimum amount (e.g., 3000)"
                            />
                        </div>
                        <p className="text-xs text-gray-500 flex items-center">
                            <Info className="w-4 h-4 mr-1" />
                            Minimum value: $1,000
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Total Phase Count
                        </label>
                        <input
                            type="number"
                            name="totalPhaseCount"
                            value={newRule.totalPhaseCount || ""}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            min="1"
                            placeholder="Enter phase count (e.g., 2)"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreateRule}
                    disabled={isSubmitting}
                    className={`mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition duration-150 ease-in-out flex items-center justify-center ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Creating...
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                            </svg>
                            Create Rule
                        </>
                    )}
                </button>
            </div>

            {/* Filter Form */}
            <div className="bg-white p-5 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    Filter Rules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Min Amount ($)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <input
                                type="number"
                                name="min"
                                value={filter.min === 0 ? "" : filter.min}
                                onChange={handleFilterChange}
                                className="w-full pl-8 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="Enter minimum amount"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Max Amount ($)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <input
                                type="number"
                                name="max"
                                value={filter.max === Infinity ? "" : filter.max}
                                onChange={handleFilterChange}
                                className="w-full pl-8 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="Enter maximum amount"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase Rules Table */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <span className="bg-blue-500 text-white rounded-full p-1 mr-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </span>
                        Existing Phase Rules
                    </h2>

                    {isTableLoading && (
                        <div className="flex items-center text-blue-600">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span className="text-sm font-medium">Refreshing data...</span>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="py-4 px-6 border-b text-left font-semibold text-sm">#</th>
                                <th className="py-4 px-6 border-b text-left font-semibold text-sm">Min Amount ($)</th>
                                <th className="py-4 px-6 border-b text-left font-semibold text-sm">Total Phase Count</th>
                                <th className="py-4 px-6 border-b text-center font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={isTableLoading ? "opacity-60" : ""}>
                            {paginatedRules.length > 0 ? (
                                paginatedRules.map((rule, index) => (
                                    <tr
                                        key={rule.id}
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                                    >
                                        <td className="py-4 px-6 border-b text-gray-700 font-medium">
                                            {currentPage * itemsPerPage + index + 1}
                                        </td>
                                        <td className="py-4 px-6 border-b text-gray-800">
                                            {editingRule && editingRule.id === rule.id ? (
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                                    <input
                                                        type="number"
                                                        name="minTotal"
                                                        value={editingRule.minTotal || ""}
                                                        onChange={handleEditingChange}
                                                        className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        min="1000"
                                                    />
                                                </div>
                                            ) : (
                                                rule.minTotal !== null && rule.minTotal !== undefined
                                                    ? `$${rule.minTotal.toLocaleString()}`
                                                    : "N/A"
                                            )}
                                        </td>
                                        <td className="py-4 px-6 border-b text-gray-800">
                                            {editingRule && editingRule.id === rule.id ? (
                                                <input
                                                    type="number"
                                                    name="totalPhaseCount"
                                                    value={editingRule.totalPhaseCount || ""}
                                                    onChange={handleEditingChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    min="1"
                                                />
                                            ) : (
                                                rule.totalPhaseCount || "N/A"
                                            )}
                                        </td>
                                        <td className="py-4 px-6 border-b text-center">
                                            {editingRule && editingRule.id === rule.id ? (
                                                <div className="flex space-x-3 justify-center">
                                                    <Tooltip text="Save changes">
                                                        <button
                                                            onClick={handleUpdateRule}
                                                            disabled={isSubmitting}
                                                            className="text-white bg-green-500 hover:bg-green-600 p-2 rounded-full transition duration-150 shadow-md"
                                                        >
                                                            <Save className="h-5 w-5" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Cancel editing">
                                                        <button
                                                            onClick={cancelEditing}
                                                            disabled={isSubmitting}
                                                            className="text-white bg-gray-500 hover:bg-gray-600 p-2 rounded-full transition duration-150 shadow-md"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <Tooltip text="Edit rule">
                                                    <button
                                                        onClick={() => startEditing(rule)}
                                                        disabled={isSubmitting || Boolean(editingRule)}
                                                        className={`text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition duration-150 shadow-md ${isSubmitting || Boolean(editingRule) ? "opacity-50 cursor-not-allowed" : ""
                                                            }`}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !isTableLoading && (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <p className="mt-2 text-sm">No phase rules found. Create your first rule above.</p>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Pagination */}
                {filteredRules.length > itemsPerPage && (
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
                        <button
                            onClick={() => handlePageChange(0)}
                            disabled={currentPage === 0}
                            className="px-2 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors duration-150 border border-gray-200"
                            aria-label="First page"
                        >
                            <ChevronsLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-2 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors duration-150 border border-gray-200"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="flex space-x-1">
                            {getPageNumbers().map((pageNum, index) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
                                ) : (
                                    <button
                                        key={`page-${pageNum}`}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 rounded-md ${currentPage === pageNum
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                                            } transition-colors duration-150`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-2 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors duration-150 border border-gray-200"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages - 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-2 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors duration-150 border border-gray-200"
                            aria-label="Last page"
                        >
                            <ChevronsRight className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="text-sm text-gray-500 ml-2">
                            Page {currentPage + 1} of {totalPages}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhaseRuleManagement;