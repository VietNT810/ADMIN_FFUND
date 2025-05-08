import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersContent, banUser, unbanUser, setUsers, addManager } from '../userSlice';
import { MagnifyingGlassIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Loading from '../../../components/Loading';
import { motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';

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
    const [userToConfirm, setUserToConfirm] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Reset form after submission
    const resetNewManager = () => {
        setNewManager({
            fullName: '',
            username: '',
            password: '',
            phone: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewManager(prevState => ({ ...prevState, [name]: value }));
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

    const handleBanUser = (userId) => {
        setUserToConfirm(userId);
        setIsConfirmOpen(true);
        setOpenDropdown(null);
    };

    const handleUnbanUser = (userId) => {
        setUserToConfirm(userId);
        setIsConfirmOpen(true);
        setOpenDropdown(null);
    };

    const confirmBanUnban = () => {
        if (userToConfirm) {
        const user = users.find(u => u.id === userToConfirm);
        const action = user.active ? banUser : unbanUser;

        dispatch(action(userToConfirm)).then((result) => {
            if (!result.error) {
            toast.success(`User ${user.active ? 'banned' : 'unbanned'} successfully!`);
            const updatedUsers = users.map(u =>
                u.id === userToConfirm ? { ...u, active: !user.active } : u
            );
            dispatch(setUsers(updatedUsers));
            setIsConfirmOpen(false);
            }
        });
        }
    };

    const toggleDropdown = (userId) => {
        setOpenDropdown(openDropdown === userId ? null : userId);
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
            <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
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
                        <option value="id">No</option>
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

                {error && <div className="alert alert-error">{error}</div>}
     
                {/* User Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users?.length > 0 ? users.map((user) => (
                        <div key={user.id} className="card bg-base-100 shadow-md">
                        <div className="card-body p-5 relative group">
                            <div className="flex items-center space-x-4">
                            <img
                                src={user.userAvatar || 'https://img.pikbest.com/png-images/qianku/default-avatar_2405039.png!w700wp'}
                                alt={user.fullName}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                            <div>
                                <h4 className="text-lg font-semibold">
                                <Link to={`/app/user-detail/${user.id}`} className="hover:text-orange-300">
                                    {user.fullName}
                                </Link>
                                </h4>
                                <p className="text-sm opacity-80">{user.email}</p>
                                <p className="text-sm opacity-60">{user.telephoneNumber}</p>
                                <span className={`badge mt-2 ${user.active ? 'badge-success' : 'badge-error'}`}>
                                {user.active ? 'Active' : 'Banned'}
                                </span>
                            </div>
                            </div>

                            {/* Dropdown menu */}
                            <div className="absolute top-3 right-3 dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-sm btn-ghost rounded-full" onClick={() => toggleDropdown(user.id)}>
                                <EllipsisHorizontalIcon className="w-5 h-5" />
                            </label>
                            {openDropdown === user.id && (
                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                                <li>
                                {user.active ? (
                                    <button onClick={() => handleBanUser(user.id)} className="text-red-500">
                                    Ban User
                                    </button>
                                ) : (
                                    <button onClick={() => handleUnbanUser(user.id)} className="text-green-500">
                                    Unban User
                                    </button>
                                )}
                                </li>
                            </ul>                  
                            )}
                            </div>
                        </div>
                        </div>
                    )) : (
                        <div className="text-center text-base-content col-span-full">No users available</div>
                    )}
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

            {/* Confirm Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
                <div className="modal-box bg-base-100">
                    <h3 className="font-bold text-lg text-center">
                    Are you sure you want to {users.find(user => user.id === userToConfirm)?.active ? 'ban' : 'unban'} this user?
                    </h3>
                    <div className="modal-action flex justify-center mt-4 gap-4">
                    <button onClick={confirmBanUnban} className="btn btn-error text-white">Yes</button>
                    <button onClick={() => setIsConfirmOpen(false)} className="btn">No</button>
                    </div>
                </div>
                </div>
            )}

            {/* Modal for Adding Manager */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <motion.div 
                        className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border-b border-gray-200 px-6 py-4 bg-base-200 rounded-t-xl flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-base-content">Add New Manager</h2>
                            <button
                            onClick={toggleModal}
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
                                    <label className="block text-sm font-medium text-base-content mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                        value={newManager.fullName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-base-content mb-1">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                        value={newManager.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="0123456789"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-base-content mb-1">
                                        UserName <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                        value={newManager.username}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="nguyenvana@gmail.com"
                                    />
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-base-content mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                                        value={newManager.password}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="******"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-base-content rounded-lg transition-colors"
                                    >
                                    Cancel
                                    </button>
                                    <button
                                    type="submit"
                                    className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Manager
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AccountManagers;
