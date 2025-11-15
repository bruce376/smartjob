import React from "react";

const Logo = ({ variant = "default", size = "medium", className = "" }) => {
  const sizes = {
    small: { width: 120, height: 36 },
    medium: { width: 200, height: 60 },
    large: { width: 280, height: 84 },
  };

  const { width, height } = sizes[size] || sizes.medium;

  if (variant === "icon") {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="30" cy="30" r="28" fill="url(#gradient1)" />
        <g transform="translate(15, 15)">
          <rect x="5" y="12" width="20" height="14" rx="2" fill="white" />
          <path
            d="M10 12 L10 8 C10 6.5 11 6 12.5 6 L17.5 6 C19 6 20 6.5 20 8 L20 12"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="13.5" y="16" width="3" height="4" rx="0.5" fill="url(#gradient1)" />
        </g>
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#667eea", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#764ba2", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (variant === "white") {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="30" cy="30" r="28" fill="white" opacity="0.2" />
        <g transform="translate(15, 15)">
          <rect x="5" y="12" width="20" height="14" rx="2" fill="white" />
          <path
            d="M10 12 L10 8 C10 6.5 11 6 12.5 6 L17.5 6 C19 6 20 6.5 20 8 L20 12"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="13.5" y="16" width="3" height="4" rx="0.5" fill="#667eea" />
        </g>
        <text
          x="65"
          y="35"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="white"
        >
          Smart
        </text>
        <text
          x="130"
          y="35"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="white"
        >
          Job
        </text>
        <text
          x="65"
          y="48"
          fontFamily="Arial, sans-serif"
          fontSize="9"
          fill="white"
          opacity="0.8"
          letterSpacing="1"
        >
          CONNECT • APPLY • SUCCEED
        </text>
      </svg>
    );
  }

  // Default variant
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="30" cy="30" r="28" fill="url(#gradient1)" />
      <g transform="translate(15, 15)">
        <rect x="5" y="12" width="20" height="14" rx="2" fill="white" />
        <path
          d="M10 12 L10 8 C10 6.5 11 6 12.5 6 L17.5 6 C19 6 20 6.5 20 8 L20 12"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="13.5" y="16" width="3" height="4" rx="0.5" fill="url(#gradient1)" />
      </g>
      <text
        x="65"
        y="35"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="#1e293b"
      >
        Smart
      </text>
      <text
        x="130"
        y="35"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="url(#gradient2)"
      >
        Job
      </text>
      <text
        x="65"
        y="48"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fill="#64748b"
        letterSpacing="1"
      >
        CONNECT • APPLY • SUCCEED
      </text>
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#667eea", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#764ba2", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#667eea", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#764ba2", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
