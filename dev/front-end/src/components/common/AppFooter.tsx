/**
 * App Footer component with contribution call-to-action
 */

import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="mt-6 py-6 sm:py-8 text-center">
      <div className="inline-flex mx-auto px-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200/30 shadow-sm">
          <p className="text-gray-700 text-sm sm:text-base font-medium mb-2">
            Found a bug? Wanna submit a feature?
          </p>
          <a
            href="https://github.com/WheelyWonka/pickup/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Join the repo!
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
