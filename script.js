document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Preloader Animation ---
    function initPreloader() {
        const preloader = document.querySelector('.preloader');
        const loaderText = document.querySelector('.loader-text');
        
        gsap.to(loaderText, {
            opacity: 0,
            duration: 1,
            delay: 1,
            onComplete: () => {
                gsap.to(preloader, {
                    y: '-100%',
                    duration: 1,
                    ease: 'power2.inOut',
                    onComplete: () => preloader.style.display = 'none'
                });
            }
        });
    }

    // --- 2. Custom Cursor ---
    function initCursor() {
        const cursor = document.querySelector('.custom-cursor');
        window.addEventListener('mousemove', e => {
            gsap.to(cursor, {
                x: e.clientX - (cursor.offsetWidth / 2),
                y: e.clientY - (cursor.offsetHeight / 2),
                duration: 0.5,
                ease: 'power3.out'
            });
        });

        document.querySelectorAll('a, button, .soda-can').forEach(el => {
            el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 2.5 }));
            el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1 }));
        });
    }

    // --- 3. Dynamic Header ---
    function initHeader() {
        let lastScroll = 0;
        const header = document.querySelector('.main-header');
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
            lastScroll = currentScroll;
        });
    }
    
    // --- 4. Hero Section Animations ---
    function initHero() {
        // Parallax background
        gsap.to('.hero-background', {
            y: '20%',
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Mouse-move effect on content
        const heroContent = document.querySelector('.hero-content');
        document.getElementById('hero').addEventListener('mousemove', e => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 40; // Multiplier for sensitivity
            const y = (clientY / window.innerHeight - 0.5) * 40;
            gsap.to(heroContent, {
                x: -x,
                y: -y,
                rotationY: x * 0.1,
                rotationX: -y * 0.1,
                ease: 'power2.out',
                duration: 1
            });
        });
        
        // Text reveal
        gsap.from('.reveal-text > *', {
            y: '100%',
            opacity: 0,
            stagger: 0.2,
            duration: 1.5,
            ease: 'power4.out',
            delay: 1.5 // After preloader
        });
    }

    // --- 5. Sugar Reveal (Now with Interaction) ---
    function initSugarReveal() {
        const sugarAmount = 39;
        const sugarCounter = { value: 0 };
        const sodaCan = document.querySelector('.soda-can');
        const prompt = document.querySelector('.interaction-prompt');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#sugar-reveal",
                start: "top top",
                end: "+=2500", // Extends scroll duration
                scrub: 1.5,
                pin: ".animation-canvas"
            }
        });

        tl.to(sodaCan, { rotation: -15, duration: 1 })
          .to(prompt, { opacity: 1, duration: 0.5 })
          .to(prompt, { opacity: 0, duration: 0.5, delay: 2 }); // Prompt fades out

        let pouringInterval;
        let cubeCount = 0;

        function pourSugar() {
            if (cubeCount >= sugarAmount) {
                sodaCan.removeEventListener('mousedown', startPour);
                gsap.to(sodaCan, { rotation: 0, ease: 'power2.out' });
                return;
            }

            pouringInterval = setInterval(() => {
                if (cubeCount >= sugarAmount) {
                    clearInterval(pouringInterval);
                    gsap.to(sodaCan, { rotation: 0, ease: 'power2.out' });
                    return;
                }
                cubeCount++;
                document.getElementById('sugar-counter').textContent = `${cubeCount}g`;
                createCube(cubeCount);
            }, 80); // Speed of pouring
        }
        
        function createCube(i) {
            const pile = document.querySelector('.sugar-pile');
            const cube = document.createElement('div');
            cube.classList.add('sugar-cube');
            pile.appendChild(cube);
            gsap.fromTo(cube, {
                x: window.innerWidth / 2 + 100,
                y: window.innerHeight / 2 - 150,
                opacity: 0
            }, {
                opacity: 1,
                x: (i % 20) * 25 + (Math.random() * 200 - 100) + (window.innerWidth / 2 - 250),
                y: pile.offsetHeight - (Math.floor(i / 20) + 1) * 25,
                rotation: (Math.random() - 0.5) * 360,
                duration: 1,
                ease: "bounce.out"
            });
        }
        
        const startPour = () => {
            gsap.to(sodaCan, { rotation: -65, ease: 'power1.in' });
            pourSugar();
        };
        const stopPour = () => {
            clearInterval(pouringInterval);
            if (cubeCount < sugarAmount) {
                gsap.to(sodaCan, { rotation: -15, ease: 'power1.out' });
            }
        };

        sodaCan.addEventListener('mousedown', startPour);
        sodaCan.addEventListener('touchstart', startPour);
        window.addEventListener('mouseup', stopPour);
        window.addEventListener('touchend', stopPour);
    }

    // --- 6. Staggered Animation for Sections ---
    function initScrollAnimations() {
        const sections = ['.fact-card', '.alt-card', '#pledge h2', '#pledge p', '.pledge-form'];
        sections.forEach(selector => {
            gsap.utils.toArray(selector).forEach(elem => {
                gsap.from(elem, {
                    opacity: 0,
                    y: 50,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: elem,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        });
    }
    
    // --- 7. Pledge Form Interaction ---
    function initPledgeForm() {
        const form = document.querySelector('.pledge-form');
        const successMessage = document.querySelector('.form-success-message');
        form.addEventListener('submit', e => {
            e.preventDefault();
            form.style.display = 'none';
            successMessage.style.display = 'block';
            gsap.from(successMessage, { opacity: 0, y: 20, duration: 0.5 });
        });
    }

    // --- Initialize All Functions ---
    initPreloader();
    initCursor();
    initHeader();
    initHero();
    initSugarReveal();
    initScrollAnimations();
    initPledgeForm();
});