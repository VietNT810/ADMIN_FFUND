import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, banUser, unbanUser } from './userSlice';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';

const UserDetail = () => {

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, error, status } = useSelector(state => state.user || { user: null, error: null, status: 'idle' });

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    dispatch(getUserById(id));
  }, [dispatch, id]);

  const handleBanUnban = async () => {
    setLoading(true);
    try {
      if (actionType === 'ban') {
        await dispatch(banUser(user.id));
        toast.success('User banned successfully!');
      } else {
        await dispatch(unbanUser(user.id));
        toast.success('User unbanned successfully!');
      }
    } catch (err) {
      toast.error(`Failed to ${actionType} user.`);
    }
    setLoading(false);
    setShowConfirm(false);
  };

  const handleGoBack = () => navigate('/app/user-management');
  const handleOpenConfirm = (action) => {
    setActionType(action);
    setShowConfirm(true);
  };

  if (status === 'loading' || loading) return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 text-base-content py-6 px-4">
      <div className="max-w-3xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">

        {user ? (
          <div className="space-y-6">
            {/* Nút quay lại */}
            <button onClick={handleGoBack} className="btn btn-ghost">
              Back
            </button>

            {/* Thông tin người dùng */}
            <div className="flex items-center gap-6">
              <img
                src={user.userAvatar || 'https://img.pikbest.com/png-images/qianku/default-avatar_2405039.png!w700wp'}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover ring ring-primary ring-offset-base-100 ring-offset-2"
              />
              <div>
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-sm opacity-80">{user.email}</p>
                <p className="text-sm opacity-60">{user.telephoneNumber}</p>
                <span className={`badge mt-2 ${user.active ? 'badge-error' : 'badge-success'}`}>
                  {user.active ? 'Banned' : 'Active'}
                </span>
              </div>
            </div>

            {/* Link FFUND nếu có */}
            {user.userFfundLink && (
              <div>
                <h5 className="font-semibold">Profile Link</h5>
                <a href={user.userFfundLink} className="link link-primary text-sm" target="_blank" rel="noreferrer">
                  {user.userFfundLink}
                </a>
              </div>
            )}

            {/* Roles */}
            <div>
              <h5 className="font-semibold">Roles</h5>
              <p className="text-sm opacity-70">{user.roles}</p>
            </div>

            {/* Nút Ban/Unban */}
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenConfirm(user.active ? 'ban' : 'unban')}
                className={`btn ${user.active ? 'btn-success' : 'btn-error'} text-white`}
                disabled={loading}
              >
                {user.active ? 'Ban User' : 'Unban User'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">No user found.</div>
        )}
      </div>

      {/* Modal xác nhận */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="modal-box bg-base-100">
            <h3 className="font-bold text-lg text-center">
              Are you sure you want to {actionType} this user?
            </h3>
            <div className="modal-action flex justify-center gap-4">
              <button onClick={handleBanUnban} className="btn btn-error text-white">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="btn">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
