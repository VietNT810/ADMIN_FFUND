import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersContent, banUser, unbanUser, setUsers } from './userSlice';
import { MagnifyingGlassIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';

const UserManager = () => {

  const dispatch = useDispatch();
  const { users, error, status, totalPages } = useSelector(state => state.user || { users: [], error: null, status: 'idle' });
 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [userToConfirm, setUserToConfirm] = useState(null);

  useEffect(() => {
    dispatch(getUsersContent({page: currentPage, sortField, sortOrder }));
  }, [dispatch, currentPage, sortField, sortOrder]);

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

  const handleSearch = () => {
    const queryParts = [];
    if (searchTerm) queryParts.push(`fullName:eq:${searchTerm}`);
    if (queryParts.length === 0) return;
    const query = queryParts.join(",");
    dispatch(getUsersContent({ query, page: currentPage, sortField, sortOrder }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (newPage) => {
    newPage >= 0 && newPage < totalPages && setCurrentPage(newPage);
  }

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

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
    </div>
  );
};

export default UserManager;
