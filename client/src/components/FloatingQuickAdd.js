import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { createTask } from '../services/api';

const FloatingQuickAdd = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();

  const handleQuickTask = async () => {
    if (!quickTaskTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createTask({
        title: quickTaskTitle,
        description: '',
        priority: 'medium',
        dueDate: null
      });
      setQuickTaskTitle('');
      setIsExpanded(false);
      setIsOpen(false);
      showSuccess('Task created successfully!');
    } catch (error) {
      console.error('Error creating quick task:', error);
      showError('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickTask();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity"
          onClick={() => {
            setIsOpen(false);
            setIsExpanded(false);
            setQuickTaskTitle('');
          }}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        {/* Quick task input - appears when expanded */}
        {isExpanded && (
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 w-80 max-w-[calc(100vw-3rem)] transform transition-all duration-300 ease-out animate-slideUp">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-800">Quick Add Task</h3>
            </div>
            <input
              type="text"
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setQuickTaskTitle('');
                }}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors text-sm font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleQuickTask}
                disabled={!quickTaskTitle.trim() || isSubmitting}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        )}

        {/* Menu options - appears when open but not expanded */}
        {isOpen && !isExpanded && (
          <div className="flex flex-col space-y-2 transform transition-all duration-300 ease-out animate-slideUp">
            <button
              onClick={() => setIsExpanded(true)}
              className="bg-white rounded-full shadow-lg border border-neutral-200 p-4 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center group"
              title="Quick Add Task"
            >
              <svg className="w-6 h-6 text-primary-600 group-hover:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>
            
            <button
              onClick={() => navigate('/calendar')}
              className="bg-white rounded-full shadow-lg border border-neutral-200 p-4 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center group"
              title="Add Calendar Event"
            >
              <svg className="w-6 h-6 text-success-600 group-hover:text-success-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            
            <button
              onClick={() => navigate('/shared-lists')}
              className="bg-white rounded-full shadow-lg border border-neutral-200 p-4 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center group"
              title="Create Shared List"
            >
              <svg className="w-6 h-6 text-warning-600 group-hover:text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-2xl p-4 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          } flex items-center justify-center group`}
          title="Quick Actions"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default FloatingQuickAdd;
