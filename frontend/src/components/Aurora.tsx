import { motion } from 'framer-motion';

interface AuroraProps {
  colorStops: string[];
  amplitude?: number;
  blend?: number;
}

export default function Aurora({ colorStops, amplitude = 1.1, blend = 0.2 }: AuroraProps) {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: blend > 0 ? 0.8 + blend : 0.8, filter: 'blur(60px)' }}
    >
      {/* Primary Color Orb */}
      <motion.div
        animate={{
          scale: [1, amplitude * 1.5, 1],
          opacity: [0.6, 1, 0.6],
          x: ['0%', '20%', '-20%', '0%'],
          y: ['0%', '-30%', '30%', '0%'],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen"
        style={{ backgroundColor: colorStops[0] }}
      />
      
      {/* Secondary Color Orb */}
      <motion.div
        animate={{
          scale: [1, amplitude * 1.8, 1],
          opacity: [0.5, 0.9, 0.5],
          x: ['0%', '-30%', '20%', '0%'],
          y: ['0%', '40%', '-20%', '0%'],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full mix-blend-screen"
        style={{ backgroundColor: colorStops[1] || colorStops[0] }}
      />

      {/* Tertiary Color Orb */}
      <motion.div
        animate={{
          scale: [1, amplitude * 1.6, 1],
          opacity: [0.4, 0.8, 0.4],
          x: ['-20%', '30%', '-10%', '-20%'],
          y: ['20%', '-20%', '30%', '20%'],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[30%] left-[30%] w-[50%] h-[50%] rounded-full mix-blend-screen"
        style={{ backgroundColor: colorStops[2] || colorStops[0] }}
      />
    </div>
  );
}
