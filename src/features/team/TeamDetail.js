import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeamById, getMemberById } from './teamSlice';
import Loading from '../../components/Loading';
import { EyeIcon } from '@heroicons/react/24/outline';

const TeamDetail = () => {
  const { teamId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { teamById, error, status, memberById } = useSelector(state => state.team || { teamById: null, error: null, status: 'idle', memberById: null });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(getTeamById(teamId))
      .finally(() => setLoading(false));
  }, [dispatch, teamId]);

  const handleGoBack = () => navigate('/app/team');

  const handleOpenModal = (memberId) => {
    dispatch(getMemberById(memberId));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading || status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 dark:bg-base-900 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-base-100 dark:bg-base-800 shadow-xl rounded-xl p-8">
        {/* Back Button at top-left */}
        <button onClick={handleGoBack} className="btn btn-ghost text-lg mb-6">
          Back
        </button>

        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{teamById?.teamName}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{teamById?.teamDescription}</p>

        {/* Team Members */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Team Members</h3>
          {teamById?.teamMembers && teamById.teamMembers.length > 0 ? (
            <ul className="space-y-4">
              {teamById.teamMembers.map((member) => (
                <li key={member.memberId} className="flex items-center space-x-4 bg-base-200 dark:bg-base-700 p-4 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                  <img
                    src={member.memberAvatar || 'https://img.pikbest.com/png-images/qianku/default-avatar_2405039.png!w700wp'}
                    alt={member.memberName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{member.memberName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.memberEmail}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.teamRole || 'No Role'}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => handleOpenModal(member.memberId)}  // Open the member detail modal
                      className="text-primary hover:text-primary-focus transition duration-200"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No team members available</p>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {isModalOpen && memberById && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="modal-box bg-base-100 dark:bg-base-800 p-8 rounded-lg shadow-xl w-11/12 sm:w-96 lg:w-1/2 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Member Details</h3>
              <button onClick={handleCloseModal} className="btn btn-ghost text-gray-400 hover:text-gray-600">
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="flex items-center space-x-6 mb-6">
              <img
                src={memberById?.userAvatar || 'https://img.pikbest.com/png-images/qianku/default-avatar_2405039.png!w700wp'}
                alt={memberById?.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
              />
              <div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{memberById?.fullName}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{memberById?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Class:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{memberById?.studentClass || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">EXE Class:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{memberById?.exeClass || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">FPT Facility:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{memberById?.fptFacility || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <a href={`https://${memberById?.studentPortfolio}`} className="btn bg-orange-500 hover:bg-orange-600 dark:text-gray-200 w-full" target="_blank" rel="noopener noreferrer">
                View Student Portfolio
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
