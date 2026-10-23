import React from 'react';

interface StarBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
  active?: boolean;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'div',
  className = '',
  color = '#ef4444',
  speed = '4s',
  children,
  active = true,
  ...rest
}) => {
  if (!active) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={`relative p-[1px] overflow-hidden rounded-md ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute w-[300%] h-[50%] opacity-70 bottom-[-15px] right-[-250%] rounded-full animate-star-movement"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute w-[300%] h-[50%] opacity-70 top-[-15px] left-[-250%] rounded-full animate-star-movement-reverse"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full bg-inherit rounded-[inherit]">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
