import React, { useMemo } from 'react';

/**
 * StarryBackground - Creates an animated starry night background
 * with twinkling stars, floating particles, and premium glowing orbs
 */
const StarryBackground = () => {
    // Generate random stars with varying properties
    const stars = useMemo(() => {
        const starArray = [];
        const starCount = 80;

        for (let i = 0; i < starCount; i++) {
            starArray.push({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                size: Math.random() < 0.6 ? 'small' : Math.random() < 0.85 ? 'medium' : 'large',
                delay: `${Math.random() * 4}s`,
                duration: `${2 + Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.5
            });
        }
        return starArray;
    }, []);

    // Generate floating particles
    const particles = useMemo(() => {
        const particleArray = [];
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            particleArray.push({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                delay: `${Math.random() * 8}s`,
                duration: `${15 + Math.random() * 20}s`,
                size: 2 + Math.random() * 4
            });
        }
        return particleArray;
    }, []);

    // Generate premium glowing orbs
    const glowOrbs = useMemo(() => {
        return [
            { id: 1, left: '15%', top: '20%', size: 120, color: 'rgba(99, 102, 241, 0.15)', delay: '0s', duration: '8s' },
            { id: 2, left: '80%', top: '15%', size: 80, color: 'rgba(139, 92, 246, 0.12)', delay: '2s', duration: '10s' },
            { id: 3, left: '60%', top: '70%', size: 100, color: 'rgba(6, 182, 212, 0.1)', delay: '4s', duration: '12s' },
            { id: 4, left: '25%', top: '75%', size: 90, color: 'rgba(99, 102, 241, 0.1)', delay: '1s', duration: '9s' },
            { id: 5, left: '90%', top: '50%', size: 70, color: 'rgba(168, 85, 247, 0.12)', delay: '3s', duration: '11s' },
        ];
    }, []);

    // Size classes for stars
    const getSizeClass = (size) => {
        switch (size) {
            case 'small': return 'w-0.5 h-0.5';
            case 'medium': return 'w-1 h-1';
            case 'large': return 'w-1.5 h-1.5';
            default: return 'w-0.5 h-0.5';
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            {/* Aurora wave effect at the top */}
            <div className="aurora-wave" />
            <div className="aurora-wave aurora-wave-2" />

            {/* Premium glowing orbs with pulse animation */}
            {glowOrbs.map((orb) => (
                <div
                    key={`orb-${orb.id}`}
                    className="absolute rounded-full orb-pulse"
                    style={{
                        left: orb.left,
                        top: orb.top,
                        width: `${orb.size}px`,
                        height: `${orb.size}px`,
                        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                        filter: 'blur(20px)',
                        animationDelay: orb.delay,
                        animationDuration: orb.duration
                    }}
                />
            ))}

            {/* Stars layer */}
            {stars.map((star) => (
                <div
                    key={`star-${star.id}`}
                    className={`absolute rounded-full bg-white star-twinkle ${getSizeClass(star.size)}`}
                    style={{
                        left: star.left,
                        top: star.top,
                        animationDelay: star.delay,
                        animationDuration: star.duration,
                        opacity: star.opacity
                    }}
                />
            ))}

            {/* Floating particles layer */}
            {particles.map((particle) => (
                <div
                    key={`particle-${particle.id}`}
                    className="absolute rounded-full particle-float"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                        animationDelay: particle.delay,
                        animationDuration: particle.duration
                    }}
                />
            ))}

            {/* Subtle nebula glow effects */}
            <div
                className="absolute w-96 h-96 rounded-full opacity-[0.03]"
                style={{
                    top: '10%',
                    right: '5%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                    filter: 'blur(40px)'
                }}
            />
            <div
                className="absolute w-80 h-80 rounded-full opacity-[0.03]"
                style={{
                    bottom: '20%',
                    left: '10%',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.8) 0%, transparent 70%)',
                    filter: 'blur(40px)'
                }}
            />
        </div>
    );
};

export default StarryBackground;
