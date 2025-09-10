import React, { useState, useEffect, useRef } from 'react';
import { User } from '../App';
import { LogoutIcon, UserCircleIcon } from './icons';

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const Avatar: React.FC = () => (
    <>
      {user.picture ? (
        <img src={user.picture} alt="User avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-sm">{getInitials(user.name)}</span>
      )}
    </>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-purple-300 hover:ring-2 hover:ring-purple-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-hidden"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
        aria-label="Open user menu"
      >
        <Avatar />
      </button>

      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl origin-top-right transition-all duration-200 ease-out transform opacity-0 scale-95 animate-enter"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-purple-300 flex-shrink-0 overflow-hidden">
                  {user.picture ? <Avatar /> : <UserCircleIcon className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-semibold text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-purple-600 hover:text-white transition-colors"
              role="menuitem"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
          <style>{`
              @keyframes enter {
                  from {
                      opacity: 0;
                      transform: scale(0.95) translateY(-10px);
                  }
                  to {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                  }
              }
              .animate-enter {
                  animation: enter 0.15s forwards ease-out;
              }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default UserProfile;