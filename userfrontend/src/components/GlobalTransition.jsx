import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function GlobalTransition() {
    const { transitionState } = useTheme();
    const [flash, setFlash] = useState(false);
    const [origin, setOrigin] = useState("92% 6%");

    useEffect(() => {
        if (transitionState.active) {
            // Determine origin based on screen width
            const isDesktop = window.innerWidth >= 768;
            if (isDesktop) {
                // Button is roughly at center + 170px
                setOrigin("calc(50vw + 170px) 80px");
            } else {
                setOrigin("92% 80px"); // Mobile top-right
            }

            // Trigger flash
            setFlash(true);
            const t = setTimeout(() => setFlash(false), 300);
            return () => clearTimeout(t);
        }
    }, [transitionState.active]);

    return (
        <AnimatePresence>
            {transitionState.active && (
                <>
                    {/* 1. Main Overlay (Dark/Light Wave) */}
                    <motion.div
                        initial={{ clipPath: `circle(0% at ${origin})` }}
                        animate={{ clipPath: `circle(150% at ${origin})` }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`fixed inset-0 z-[100] pointer-events-none ${transitionState.mode === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}
                    />

                    {/* 2. Lightning Flash Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0, 0.4, 0] }} // Multiple flicker
                        transition={{ duration: 0.4, times: [0, 0.2, 0.4, 0.6, 1] }}
                        className="fixed inset-0 z-[101] pointer-events-none bg-white mix-blend-overlay"
                    />

                    {/* 3. Lightning Bolt SVG */}
                    <motion.svg
                        viewBox="0 0 100 100"
                        className="fixed top-0 right-0 z-[102] w-64 h-full pointer-events-none opacity-80"
                        style={{ right: window.innerWidth >= 768 ? 'calc(50vw - 215px)' : '0' }} // Align roughly to container right on desktop?? No, keep it cinematic at screen edge or container edge? Container edge logic is better but screen edge is more dramatic. Let's keep screen edge for lightning but wave from button.
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, times: [0, 0.1, 1] }}
                    >
                        <motion.path
                            d="M60 0 L40 40 L60 40 L30 100"
                            fill="none"
                            stroke={transitionState.mode === 'dark' ? "#fbbf24" : "#0f172a"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3, ease: "linear" }}
                        />
                    </motion.svg>
                </>
            )}
        </AnimatePresence>
    );
}
