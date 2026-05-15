import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(8px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)' },
  out: { opacity: 0, y: -15, filter: 'blur(8px)' }
};

const pageTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1]
};

export default function PageTransition({ children, currentKey }) {
  return (
    <motion.div
      key={currentKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full min-h-screen flex flex-col relative z-10"
    >
      {children}
    </motion.div>
  );
}
