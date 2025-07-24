import React, { useEffect, useRef, useState } from 'react';

interface RunningTextProps {
  text: string;
  className?: string;
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
}

const RunningText: React.FC<RunningTextProps> = ({ 
  text, 
  className = '', 
  speed = 50, 
  pauseOnHover = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        setShouldAnimate(textWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const animationDuration = shouldAnimate && textRef.current 
    ? (textRef.current.scrollWidth + (containerRef.current?.offsetWidth || 0)) / speed
    : 0;

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={textRef}
        className={`inline-block ${
          shouldAnimate 
            ? 'animate-running-text' 
            : ''
        } ${isPaused ? 'animation-paused' : ''}`}
        style={{
          animationDuration: shouldAnimate ? `${animationDuration}s` : undefined,
        }}
      >
        {text}
        {shouldAnimate && (
          <span className="ml-8">{text}</span>
        )}
      </div>
    </div>
  );
};

export default RunningText;