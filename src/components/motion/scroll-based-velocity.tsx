"use client";

import React, { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Wrap a value between a min and max
 */
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ScrollVelocityRowProps {
    children: React.ReactNode;
    baseVelocity?: number;
    direction?: 1 | -1;
    className?: string;
}

interface ScrollVelocityContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Container component for scroll velocity rows
 */
export function ScrollVelocityContainer({
    children,
    className,
}: ScrollVelocityContainerProps) {
    return (
        <div className={cn("w-full overflow-hidden", className)}>
            {children}
        </div>
    );
}

/**
 * Individual row that animates based on scroll velocity
 */
export function ScrollVelocityRow({
    children,
    baseVelocity = 20,
    direction = 1,
    className,
}: ScrollVelocityRowProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false,
    });

    /**
     * This is a magic wrapping for the length of the text - you
     * have to replace for wrapping that works for you or dynamically
     * calculate
     */
    const x = useTransform(baseX, (v) => `${wrap(-45, -20, v)}%`);

    const directionFactor = useRef<number>(direction);

    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        /**
         * This is what changes the direction of the scroll once we
         * switch scrolling directions.
         */
        if (velocityFactor.get() < 0) {
            directionFactor.current = -direction;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = direction;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className={cn("flex whitespace-nowrap", className)}>
            <motion.div className="flex whitespace-nowrap gap-4" style={{ x }}>
                <span className="block">{children}</span>
                <span className="block">{children}</span>
                <span className="block">{children}</span>
                <span className="block">{children}</span>
            </motion.div>
        </div>
    );
}
