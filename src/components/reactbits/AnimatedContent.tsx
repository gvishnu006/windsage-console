import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface AnimatedContentProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  animateOpacity?: boolean;
  scale?: number;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 16,
  direction = 'vertical',
  reverse = false,
  delay = 0,
  duration = 0.35,
  className = '',
  animateOpacity = true,
  scale = 1,
  ...rest
}) => {
  let prefersReducedMotion = false;
  try {
    prefersReducedMotion = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);
  } catch {
    // ignore
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const axis = direction === 'horizontal' ? 'x' : 'y';
  const offset = reverse ? -distance : distance;

  return (
    <motion.div
      initial={{
        [axis]: offset,
        opacity: animateOpacity ? 0 : 1,
        scale: scale !== 1 ? scale : 1,
      }}
      animate={{
        [axis]: 0,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContent;
