import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion stagger animation variants used across PWA pages.
 *
 * Usage:
 *   <motion.div variants={staggerContainer} initial="hidden" animate="show">
 *     <motion.div variants={staggerItem}>...</motion.div>
 *   </motion.div>
 */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
