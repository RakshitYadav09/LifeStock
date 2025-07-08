import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Zap, Calendar, FileText, Users } from 'lucide-react';

const FloatingQuickAddButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const actions = [
    {
      label: 'Quick Task',
      icon: Zap,
      action: () => navigate('/?quick-task=true'),
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      shadow: 'shadow-blue-500/30',
    },
    {
      label: 'Schedule Meeting',
      icon: Calendar,
      action: () => navigate('/calendar?create=true'),
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
      shadow: 'shadow-purple-500/30',
    },
    {
      label: 'New List',
      icon: FileText,
      action: () => navigate('/shared-lists?create=true'),
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      shadow: 'shadow-green-500/30',
    },
    {
      label: 'Find Friends',
      icon: Users,
      action: () => navigate('/friends?tab=search'),
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      shadow: 'shadow-orange-500/30',
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleActionClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300" />
      )}
      
      <div ref={wrapperRef} className="fixed bottom-8 right-8 z-50">
        <div className="relative flex flex-col items-end space-y-4">
          {/* Action buttons - visible when open */}
          {isOpen && (
            <div className="flex flex-col items-end space-y-3">
              {actions.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 group"
                  style={{
                    animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Label */}
                  <div className="bg-white/95 backdrop-blur-sm text-sm font-medium text-neutral-700 px-4 py-2 rounded-xl shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                    {item.label}
                  </div>
                  
                  {/* Action button */}
                  <button
                    onClick={() => handleActionClick(item.action)}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} ${item.hoverGradient} text-white flex items-center justify-center shadow-xl ${item.shadow} transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30`}
                    aria-label={item.label}
                  >
                    <item.icon className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-2xl hover:shadow-primary-500/40 focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ${isOpen ? 'rotate-45 scale-110 shadow-primary-500/50' : ''}`}
            aria-label="Toggle quick actions"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
            <Plus className={`h-8 w-8 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
            <X className={`h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingQuickAddButton;
