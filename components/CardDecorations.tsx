export function CornerPattern({ className = "", position = "tl" }: { className?: string; position?: "tl" | "tr" | "bl" | "br" }) {
  const rotate = {
    tl: "rotate-0",
    tr: "rotate-90",
    br: "rotate-180",
    bl: "-rotate-90",
  }[position];

  return (
    <svg
      className={`w-16 h-16 md:w-24 md:h-24 absolute pointer-events-none opacity-80 ${rotate} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 5 H40 M5 5 V40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 10 H35 M10 10 V35"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="5" cy="5" r="2" fill="currentColor" />
      <path
        d="M50 5 Q30 5 20 20 Q5 30 5 50"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 2"
      />
      <circle cx="20" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CloudPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute w-full h-full pointer-events-none opacity-5 ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern id="cloud" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path
          d="M10 10 Q15 5 20 10 T30 10"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      </pattern>
      <rect width="100" height="100" fill="url(#cloud)" />
    </svg>
  );
}

export function Seal({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        width="60"
        height="60"
        viewBox="0 0 100 100"
        className="text-red-800 opacity-90 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5" y="5" width="90" height="90" rx="10" stroke="currentColor" strokeWidth="3" fill="none" />
        <rect x="12" y="12" width="76" height="76" rx="5" fill="currentColor" opacity="0.1" />
        <text
          x="50"
          y="65"
          fontFamily="serif"
          fontSize="40"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
        >
          马到
          成功
        </text>
      </svg>
      {/* Fallback text if SVG text is tricky to center perfectly across browsers, but SVG text is usually fine */}
      <div className="absolute inset-0 flex items-center justify-center text-red-900 font-serif font-bold text-xs leading-tight tracking-widest" style={{ writingMode: 'vertical-rl' }}>
        <span className="border-2 border-red-800 p-1 rounded bg-red-100/50">丙午<br/>大吉</span>
      </div>
    </div>
  );
}

export function HorseSilhouette({ className = "" }: { className?: string }) {
    return (
        <svg 
            className={`absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none ${className}`}
            viewBox="0 0 100 100" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Simple abstract horse shape or calligraphy stroke */}
            <path d="M20 80 Q40 60 60 70 T90 50 Q80 30 60 40 T30 50 Q20 70 20 80 Z" />
        </svg>
    )
}
