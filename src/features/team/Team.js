import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeamContent } from './teamSlice';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';

const Team = () => {
  const dispatch = useDispatch();
  const { teams, status, error, totalPages } = useSelector((state) => state.team);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    dispatch(getTeamContent({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen bg-base-200 dark:bg-base-900 py-6 px-4">
      <div className="max-w-7xl mx-auto bg-base-100 dark:bg-base-800 shadow-xl rounded-xl p-8">
        {/* List of Teams */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.length > 0 ? (
            teams.map((team) => (
              <div key={team.teamId} className="card bg-base-100 dark:bg-base-800 shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 p-4 rounded-lg">
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{team.teamName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{team.teamDescription}</p>

                  {/* Display team members */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Team Members:</h4>
                    <ul className="list-disc ml-4">
                      {team.teamMembers?.map((member) => (
                        <li key={member.memberId} className="text-sm text-gray-600 dark:text-gray-400">
                          {member.memberName} ({member.teamRole || 'No Role'})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* View Details Button */}
                  <div className="text-center mt-4">
                    <Link to={`/app/team-detail/${team.teamId}`} className="btn btn-primary btn-sm w-full">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-base-content col-span-full">No teams available</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="btn btn-sm btn-outline"
          >
            Prev
          </button>
          <span className="text-sm">{currentPage + 1} / {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="btn btn-sm btn-outline"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Team;
