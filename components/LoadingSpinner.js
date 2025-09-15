export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 mx-auto"></div>
      </div>
      <p className="text-xl font-semibold text-gray-700">{message}</p>
      <p className="text-gray-500 mt-2">Fetching your analytics data...</p>
    </div>
  </div>
);