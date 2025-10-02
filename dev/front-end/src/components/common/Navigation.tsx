import React from 'react';

type ViewType = 'dashboard' | 'how-to-use';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="mb-6 sm:mb-8">
      <div className="flex justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-md border border-orange-200/30">
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('how-to-use')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                currentView === 'how-to-use'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              How to use
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
