document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Custom cursor
    const cursor = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const cursorHoverElements = document.querySelectorAll('[data-cursor-hover]');

    if (cursor && cursorOutline) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });

            gsap.to(cursorOutline, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // Cursor hover effect
        cursorHoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });

            element.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Hide cursor when it leaves the window
        document.addEventListener('mouseleave', () => {
            gsap.to([cursor, cursorOutline], {
                opacity: 0,
                duration: 0.3
            });
        });

        document.addEventListener('mouseenter', () => {
            gsap.to([cursor, cursorOutline], {
                opacity: 1,
                duration: 0.3
            });
        });

        // Add click animation
        document.addEventListener('mousedown', () => {
            gsap.to(cursorOutline, {
                scale: 0.8,
                duration: 0.2
            });
        });

        document.addEventListener('mouseup', () => {
            gsap.to(cursorOutline, {
                scale: 1,
                duration: 0.2
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const scrollProgress = document.querySelector('.scroll-progress');

    function handleScroll() {
        // Navbar background
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll to top button
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        // Scroll progress
        const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) || 0;
        scrollProgress.style.transform = `scaleX(${scrollPercentage})`;
    }

    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
        if (mobileMenu.classList.contains('open')) {
            mobileMenuIcon.classList.remove('ri-menu-line');
            mobileMenuIcon.classList.add('ri-close-line');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenuIcon.classList.add('ri-menu-line');
            mobileMenuIcon.classList.remove('ri-close-line');
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
            mobileMenuIcon.classList.add('ri-menu-line');
            mobileMenuIcon.classList.remove('ri-close-line');
            document.body.style.overflow = '';
        });
    });

    // Scroll to top button
    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Magnetic button effect
    const magneticButtons = document.querySelectorAll('.magnetic-button');

    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', function (e) {
            const position = button.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;

            gsap.to(button, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.2,
                ease: "power2.out"
            });
        });

        button.addEventListener('mouseleave', function () {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // Horizontal scroll for notes
    const notesContainer = document.querySelector('.notes-container');

    if (notesContainer) {
        // Make notes draggable for horizontal scrolling
        let isDown = false;
        let startX;
        let scrollLeft;

        notesContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            notesContainer.style.cursor = 'grabbing';
            startX = e.pageX - notesContainer.offsetLeft;
            scrollLeft = notesContainer.scrollLeft;
        });

        notesContainer.addEventListener('mouseleave', () => {
            isDown = false;
            notesContainer.style.cursor = 'grab';
        });

        notesContainer.addEventListener('mouseup', () => {
            isDown = false;
            notesContainer.style.cursor = 'grab';
        });

        notesContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - notesContainer.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed
            notesContainer.scrollLeft = scrollLeft - walk;
        });

        // Set initial cursor style
        notesContainer.style.cursor = 'grab';

        // Horizontal scroll animation with ScrollTrigger
        gsap.to(notesContainer, {
            x: () => -(notesContainer.scrollWidth - window.innerWidth + 32),
            ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-scroll-section",
                start: "top top",
                end: () => `+=${notesContainer.scrollWidth - window.innerWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });
    }

    // Text reveal animations
    const revealTextElements = document.querySelectorAll('.reveal-text');

    revealTextElements.forEach(element => {
        // Split text into characters
        const text = element.textContent;
        element.textContent = '';

        // Create spans for each character
        [...text].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char-reveal';
            element.appendChild(span);
        });

        // Create reveal animation
        ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            onEnter: () => {
                element.classList.add('revealed');
                const chars = element.querySelectorAll('.char-reveal');
                gsap.to(chars, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.02,
                    ease: "power4.out"
                });
            },
            once: true
        });
    });

    // Animate elements when they come into view
    function createScrollAnimation(selector, animationProps, options = {}) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            gsap.fromTo(
                element,
                { opacity: 0, y: 50, ...options.from },
                {
                    opacity: 1,
                    y: 0,
                    ...animationProps,
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        toggleActions: "play none none none",
                        ...options.scrollTrigger
                    }
                }
            );
        });
    }

    // Video section animation
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        ScrollTrigger.create({
            trigger: videoContainer,
            start: "top 70%",
            onEnter: () => {
                videoContainer.classList.add('visible');

                // Animate notes inside video after video appears
                setTimeout(() => {
                    const videoNotes = document.querySelectorAll('.video-note');
                    videoNotes.forEach((note, index) => {
                        setTimeout(() => {
                            note.classList.add('visible');
                            note.style.setProperty('--rotation', `${Math.random() * 10 - 5}deg`);
                        }, index * 100);
                    });
                }, 500);
            },
            once: true
        });
    }

    // Feature cards animation
    createScrollAnimation('.feature-card', {
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });

    // Testimonial cards animation
    createScrollAnimation('.testimonial-card', {
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });

    // Pricing cards animation
    createScrollAnimation('.pricing-card', {
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
    });

    // Dashboard section animations
    createScrollAnimation('.dashboard-feature', {
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)"
    }, { from: { scale: 0.8 } });

    // Workflow cards animation
    createScrollAnimation('.workflow-card', {
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)"
    }, { from: { scale: 0.9 } });

    // Gallery items animation
    createScrollAnimation('.gallery-item', {
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out"
    }, { from: { opacity: 0, y: 20 } });

    // Parallax effects for spheres
    gsap.to('.sphere-1', {
        y: -100,
        scrollTrigger: {
            trigger: '.dashboard-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    gsap.to('.sphere-2', {
        y: 100,
        scrollTrigger: {
            trigger: '.dashboard-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    gsap.to('.sphere-gold', {
        y: -50,
        scrollTrigger: {
            trigger: '.workflow-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    // Initialize animations on load
    handleScroll();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
