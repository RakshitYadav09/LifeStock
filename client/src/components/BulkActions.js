import React, { useState } from 'react';

const BulkActions = ({ selectedItems, onBulkComplete, onBulkDelete, onBulkAssign, collaborators }) => {
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleBulkAssign = (assigneeId) => {
    onBulkAssign(assigneeId);
    setShowAssignMenu(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border p-4 flex items-center space-x-3 z-40">
      <span className="text-sm font-medium text-gray-700">
        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
      </span>
      
      <div className="h-4 w-px bg-gray-300" />
      
      <button
        onClick={onBulkComplete}
        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
      >
        Complete All
      </button>
      
      <div className="relative">
        <button
          onClick={() => setShowAssignMenu(!showAssignMenu)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Assign To
        </button>
        
        {showAssignMenu && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg py-1 min-w-48">
            <button
              onClick={() => handleBulkAssign(null)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Unassign
            </button>
            {collaborators.map(collaborator => (
              <button
                key={collaborator._id}
                onClick={() => handleBulkAssign(collaborator._id)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {collaborator.username}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={onBulkDelete}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
      >
        Delete All
      </button>
    </div>
  );
};

export default BulkActions;
