import React from 'react';

interface Props {
  open: boolean;
  onAcknowledge: () => void;
}

const StorageVersionModal: React.FC<Props> = ({ open, onAcknowledge }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md border border-orange-200">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-pink-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">Data Format Updated</h3>
        </div>
        <div className="px-6 py-5 text-gray-700 space-y-3">
          <p>
            Your saved data was created using an older version of the app format and is not compatible
            with the current version.
          </p>
          <p className="text-sm text-gray-600">
            To continue, we will clear the existing saved data and start fresh with the new format.
          </p>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button
            type="button"
            onClick={onAcknowledge}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageVersionModal;
