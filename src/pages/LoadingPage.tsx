import React from "react";

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-medium ">Loading...</p>
    </div>
  );
};

export default LoadingPage;
