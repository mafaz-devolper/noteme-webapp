// Constants
const ANIMATION_DEFAULTS = {
    duration: 0.3,
    ease: "power2.out"
};

// Utility functions
const createAnimation = (element, props) => {
    return gsap.to(element, {
        ...props,
        duration: ANIMATION_DEFAULTS.duration,
        ease: ANIMATION_DEFAULTS.ease,
        overwrite: "auto"
    });
};

// Magnetic hover effect
const initMagneticHover = () => {
    const magneticHoverElements = document.querySelectorAll('.magnetic-hover');

    const handleMagneticMove = (e) => {
        const element = e.currentTarget;
        const strength = 0.3;
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;

        createAnimation(element, { x, y });
    };

    const handleMagneticReset = (element) => {
        createAnimation(element, { x: 0, y: 0 });
    };

    magneticHoverElements.forEach(element => {
        element.addEventListener('mousemove', handleMagneticMove);
        element.addEventListener('mouseleave', () => handleMagneticReset(element));
    });
};

// Magnetic button effect
const handleMagneticMove = (e, button) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 150;
    const strength = 0.8;

    const moveX = x * strength * (1 - Math.min(distance, maxDistance) / maxDistance);
    const moveY = y * strength * (1 - Math.min(distance, maxDistance) / maxDistance);
    const rotateX = -y * 0.1;
    const rotateY = x * 0.1;

    button.style.transform = `
        translate(${moveX}px, ${moveY}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.05, 1.05, 1.05)
    `;
};

const handleMagneticLeave = (button) => {
    button.style.transform = 'translate(0, 0) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
};

// Shery.js animations
const initSheryAnimations = () => {
    if (!window.Shery) return;

    const sheryConfig = {
        smoothScroll: true,
        mouseParallax: true,
        transform3D: true,
        smoothAnimations: true,
        perspective: 1000,
        gyro: true
    };

    Shery.init(sheryConfig);

    // Hero animations
    const heroAnimations = {
        ".hero": {
            initial: { scale: 1.1, opacity: 0, rotateY: 10 },
            final: { scale: 1, opacity: 1, rotateY: 0 },
            duration: 1.2
        },
        ".logo-hider": {
            initial: { y: 100, opacity: 0, rotateX: 15 },
            final: { y: 0, opacity: 1, rotateX: 0 },
            duration: 1,
            delay: 0.3
        },
        ".hero-subtitle": {
            initial: { y: 50, opacity: 0, scale: 0.95 },
            final: { y: 0, opacity: 1, scale: 1 },
            duration: 0.8,
            delay: 0.5
        },
        ".hero-subtitle-2": {
            initial: { y: 30, opacity: 0, rotateX: 10 },
            final: { y: 0, opacity: 1, rotateX: 0 },
            duration: 0.7,
            delay: 0.7
        }
    };

    Object.entries(heroAnimations).forEach(([selector, config]) => {
        Shery.animate(selector, config);
    });

    // Enhanced hover effects
    const hoverEffects = {
        ".magnetic-hover": {
            scale: 1.1,
            rotateY: 5,
            rotateX: -2,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            textShadow: "0 0 20px rgba(255,255,255,0.3)"
        },
        ".magnetic-button": {
            scale: 1.05,
            rotateY: 3,
            rotateX: -2,
            boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            textShadow: "0 0 15px rgba(255,255,255,0.4)"
        }
    };

    Object.entries(hoverEffects).forEach(([selector, config]) => {
        Shery.hover(selector, {
            hover: config,
            duration: 0.4
        });
    });

    // Additional effects
    Shery.tilt(".hero", { perspective: 1000, max: 10, scale: 1.05 });
    Shery.parallax(".hero-subtitle", { speed: 0.5, direction: "vertical" });
    Shery.scroll({ smooth: true, duration: 1.2 });
    Shery.mouseParallax({ elements: [".hero", ".logo-hider"], speed: 0.5 });
};

// Enhanced navbar animation
function initNavbarAnimation() {
    const tl = gsap.timeline({
        defaults: {
            ease: "power3.out",
            duration: 0.8
        }
    });

    // Navbar sequence
    tl.from("nav", {
        y: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
    })
    .from("nav h2", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.8")
    .from(".links a", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6
    }, "-=0.6")
    
    // Hero section sequence - simple opacity animations
    .from(".hero", {
        opacity: 0,
        duration: 1
    }, "-=0.4")
    .from(".hero-subtitle", {
        opacity: 0,
        duration: 0.8
    }, "-=0.4")
    .from(".hero-subtitle-2", {
        opacity: 0,
        duration: 0.8
    }, "-=0.4");

    // Add hover animations for nav links
    const navLinks = document.querySelectorAll(".links a");
    navLinks.forEach(link => {
        link.addEventListener("mouseenter", () => {
            gsap.to(link, {
                scale: 1.1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        link.addEventListener("mouseleave", () => {
            gsap.to(link, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    // Add hover animation for the Get Started button
    const button = document.querySelector("nav a.button");
    if (button) {
        button.addEventListener("mouseenter", () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        button.addEventListener("mouseleave", () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMagneticHover();
    initNavbarAnimation();
    initSheryAnimations();
});