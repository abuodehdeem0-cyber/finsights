import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          borderRadius: '40px',
          border: '2px solid #6b1515',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6b1515 0%, #a91d1d 100%)',
            borderRadius: '30px',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
          }}
        >
          <svg
            width="90"
            height="90"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid lines - subtle */}
            <path
              d="M4 8 L28 8 M4 16 L28 16 M4 24 L28 24"
              stroke="#8a1c1c"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            
            {/* Main trend line - rising */}
            <path
              d="M6 22 L12 18 L18 20 L26 10"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            
            {/* Data points */}
            <circle cx="6" cy="22" r="2.5" fill="#6b1515" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="12" cy="18" r="2.5" fill="#8a1c1c" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="18" cy="20" r="2.5" fill="#a91d1d" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="26" cy="10" r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            
            {/* Upward arrow at the end */}
            <path
              d="M24 6 L28 6 L28 10"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M28 6 L22 12"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
