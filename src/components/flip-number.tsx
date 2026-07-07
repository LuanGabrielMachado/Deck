'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipNumberProps {
  value: number;
  className?: string;
}

/**
 * Exibe um número com animação de flip vertical quando o valor muda.
 * Sobe se aumentou, desce se diminuiu.
 */
export function FlipNumber({ value, className }: FlipNumberProps) {
  const prevRef = useRef(value);
  const [display, setDisplay] = useState(value);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (value !== prevRef.current) {
      setDirection(value > prevRef.current ? 1 : -1);
      setDisplay(value);
      prevRef.current = value;
    }
  }, [value]);

  return (
    <span className="relative inline-block overflow-hidden" style={{ lineHeight: 1 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          className={className}
          initial={{ y: direction * -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction * 6, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'block' }}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
