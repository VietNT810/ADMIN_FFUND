import React, { useEffect } from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="flex flex-col items-center space-y-4">
        <span className="loading loading-spinner loading-lg text-orange-500"></span>
        <p className="text-lg text-orange-500 font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
