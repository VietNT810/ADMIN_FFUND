import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersContent, addManager } from '../userSlice';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Loading from '../../../components/Loading';

const AccountManagers = () => {
    const dispatch = useDispatch();
    const { users, error, status, totalPages } = useSelector(state => state.user || { users: [], error: null, status: 'idle' });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [newManager, setNewManager] = useState({
        fullName: '',
        username: '',
        password: '',
        phone: ''
    });

    // Reset form after submission
    const resetNewManager = () => {
        setNewManager({
            fullName: '',
            username: '',
            password: '',
            phone: ''
        });
    };

    // Validate the form data
    const validateForm = (user) => {
        if (!user.fullName) {
            toast.error('Full Name is required!');
            return false;
        }
        if (!user.username) {
            toast.error('Username is required!');
            return false;
        }
        if (!user.password) {
            toast.error('Password is required!');
            return false;
        }
        if (!user.phone) {
            toast.error('Phone is required!');
            return false;
        }
        return true;
    };

    // Fetch managers on component mount or whenever dependencies change
    useEffect(() => {
        const defaultQuery = `roles:eq:MANAGER`;
        dispatch(getUsersContent({ query: defaultQuery, page: currentPage, size: 10, sortField, sortOrder }));
    }, [dispatch, currentPage, sortField, sortOrder]);

    const handleSearch = () => {
        const queryParts = [];
        queryParts.push('roles:eq:MANAGER');
        if (searchTerm) queryParts.push(`fullName:eq:${searchTerm}`);
        if (queryParts.length === 0) return;
        const query = queryParts.join(",");
        dispatch(getUsersContent({ query, page: currentPage, size: 10, sortField, sortOrder }));
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        if (validateForm(newManager)) {
            dispatch(addManager(newManager))
                .then((result) => {
                    if (result.error) {
                        toast.error(result.payload || "An error occurred while processing the category.");
                    } else {
                        toast.success(result.payload);
                        setModalOpen(false);
                        resetNewManager();
                        dispatch(getUsersContent({ query: 'roles:eq:MANAGER', page: currentPage, size: 10, sortField, sortOrder }));
                    }
                })
                .catch((error) => {
                    toast.error(error.message || "An unexpected error occurred.");
                });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage);
    };

    const toggleModal = () => setModalOpen(!modalOpen);

    if (status === 'loading') return <Loading />;

    return (
        <div className="min-h-screen bg-base-200 text-base-content py-6 px-4">
            <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8 space-y-8">
                {/* Search & Sort */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search by name"
                        className="input input-bordered w-64"
                    />
                    <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="select select-bordered">
                        <option value="id">ID</option>
                        <option value="fullName">Full Name</option>
                    </select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="select select-bordered">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                    <button onClick={handleSearch} className="btn bg-orange-500 hover:bg-orange-600 dark:text-gray-200">
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>
                    {/* Button to Add Manager */}
                    <button onClick={toggleModal} className="btn bg-green-500 hover:bg-green-600 text-white">
                        Add Manager
                    </button>
                </div>

                {/* Table to Display Users */}
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-100 shadow-md rounded-lg border">
                        <thead className="bg-base-200 text-sm font-semibold text-base-content border-b">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Full Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.length > 0 ? users.map((user, index) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                        <Link to={`/app/user-detail/${user.id}`} className="hover:text-orange-300">
                                            {user.fullName}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 text-sm">{user.email}</td>
                                    <td className="px-4 py-2 text-sm">{user.telephoneNumber}</td>
                                    <td>
                                        <span className={`badge ${user.active ? 'badge-success' : 'badge-error'}`}>
                                            {user.active ? 'Active' : 'Banned'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-base-content">No managers available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="btn btn-sm btn-outline">
                        Prev
                    </button>
                    <span className="text-sm">{currentPage + 1} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="btn btn-sm btn-outline">
                        Next
                    </button>
                </div>
            </div>

            {/* Modal for Adding Manager */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
                    <div className="bg-white p-8 rounded-xl shadow-xl w-96">
                        <h3 className="text-2xl font-semibold mb-4">Add New Manager</h3>
                        <form onSubmit={handleSubmitCreate}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={newManager.fullName}
                                    onChange={(e) => setNewManager({ ...newManager, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Username</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={newManager.username}
                                    onChange={(e) => setNewManager({ ...newManager, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Password</label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full"
                                    value={newManager.password}
                                    onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={newManager.phone}
                                    onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
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
        </div>
    );
};

export default AccountManagers;
