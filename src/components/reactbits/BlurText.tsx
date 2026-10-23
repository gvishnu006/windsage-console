import React, { useEffect, useState } from 'react';
import { motion, type Transition } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 0.05,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  const yOffset = direction === 'top' ? -18 : 18;

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{ filter: 'blur(8px)', opacity: 0, y: yOffset }}
          animate={hasAnimated ? { filter: 'blur(0px)', opacity: 1, y: 0 } : { filter: 'blur(8px)', opacity: 0, y: yOffset }}
          transition={
            {
              duration: 0.45,
              delay: index * delay,
              ease: [0.25, 0.1, 0.25, 1],
            } as Transition
          }
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          className="inline-block whitespace-pre"
        >
          {element}
          {animateBy === 'words' && index < elements.length - 1 && ' '}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
