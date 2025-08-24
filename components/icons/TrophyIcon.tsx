
import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125v3.375m9 0h-9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21.75h4.5m-4.5 0a3 3 0 01-3-3V6.75a3 3 0 013-3h4.5a3 3 0 013 3v12a3 3 0 01-3 3m-4.5 0v-3.375" />
  </svg>
);

export default TrophyIcon;
