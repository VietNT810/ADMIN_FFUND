import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProfile } from './profileSlice';

function ProfileSettings() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getAdminProfile());
  }, [dispatch]);

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Admin Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            <div>
              <p className="text-gray-500 mb-1">Full Name</p>
              <p className="font-semibold">{user.fullName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-semibold">{user.email || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone Number</p>
              <p className="font-semibold">{user.telephoneNumber || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 mb-1">User Information</p>
              <p className="font-semibold">No additional info provided</p>
            </div>
          </div>

          <div className="divider">System</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            <div>
              <p className="text-gray-500 mb-1">Role</p>
              <div className="badge bg-orange-400 dark:text-base-200">{user.roles}</div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Active</p>
              <div className={`badge ${user.active ? 'badge-success' : 'badge-error'}`}>
                {user.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
