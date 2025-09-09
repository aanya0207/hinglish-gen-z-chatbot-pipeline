import * as React from 'react';

export const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-5 h-5"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 9v6h4l5 5V4l-5 5H9z"
    />
  </svg>
);
