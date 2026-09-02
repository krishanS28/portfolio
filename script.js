// ==========================================
// PORTFOLIO INTERACTIVE LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling with Offset
    const navLinks = document.querySelectorAll('nav ul li a, .logo-badge');
    const navHeight = document.querySelector('nav').offsetHeight;

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetAttr = this.getAttribute('href') || '#home';
            if (targetAttr.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetAttr);
                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - (navHeight + 20);

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile nav if open
                    const navUl = document.querySelector('nav ul');
                    if (navUl && navUl.classList.contains('show')) {
                        navUl.classList.remove('show');
                    }
                }
            }
        });
    });

    // 2. Active Section Tracker on Scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - (navHeight + 80);
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // 3. Mobile Navigation Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navList = document.getElementById('nav-links');
    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', () => {
            navList.classList.toggle('show');
        });
    }

    // 4. Resume Modal Logic
    const resumeModal = document.getElementById('resume-modal');
    const openResumeBtns = document.querySelectorAll('.open-resume-modal');
    const closeResumeBtn = document.getElementById('close-resume-modal');
    const resumeForm = document.getElementById('resume-form');

    window.toggleResumeModal = function(show = true) {
        if (!resumeModal) return;
        if (show) {
            resumeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            resumeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    openResumeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleResumeModal(true);
        });
    });

    if (closeResumeBtn) {
        closeResumeBtn.addEventListener('click', () => toggleResumeModal(false));
    }

    if (resumeModal) {
        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) {
                toggleResumeModal(false);
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('active')) {
            toggleResumeModal(false);
        }
    });

    if (resumeForm) {
        resumeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('visitor-email');
            const userEmail = emailInput ? emailInput.value : '';

            // Trigger download
            const tempLink = document.createElement('a');
            tempLink.href = 'resume.pdf';
            tempLink.download = 'Krishan_Lal_Senior_React_Native_Developer_Resume.pdf';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            alert(`🎉 Success! Krishan Lal's resume download has initiated for ${userEmail}. Thank you for connecting!`);
            toggleResumeModal(false);
            resumeForm.reset();
        });
    }
});
