import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";

export default function PageWrapper({ children, onSearch }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#ffffff] overflow-hidden print:h-auto print:overflow-visible">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onSearch={onSearch} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Global Page Animation */}
        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 p-6 overflow-y-scroll overflow-x-hidden custom-scrollbar print:overflow-visible print:h-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
