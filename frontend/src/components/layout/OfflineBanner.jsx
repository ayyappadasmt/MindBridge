import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOffline } from "../../context/OfflineContext";
export default function OfflineBanner() {
  const { isOffline } = useOffline();
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div initial={{y:-48,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-48,opacity:0}} transition={{type:"spring",stiffness:400,damping:35}}
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 h-10 bg-warning-500 text-white text-sm font-medium">
          <WifiOff size={14} />You are offline. Changes are saved locally.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
