import React from "react";

const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-green-700">
      <div className="w-10 h-10 border-4 border-green-300 border-t-green-700 rounded-full animate-spin mb-2"></div>
    </div>
  );
};

export default Spinner;
