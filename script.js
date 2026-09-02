// ==========================================
// PORTFOLIO INTERACTIVE LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling with Offset
    const navLinks = document.querySelectorAll('nav ul li a, .brand-logo');
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

    // 4. Dynamic Live Apps & Data Hydration from portfolio-data.json
    async function syncDynamicPortfolioData() {
        try {
            const res = await fetch('portfolio-data.json?v=' + Date.now());
            if (!res.ok) return;
            const data = await res.json();

            // A. Sync Live Apps (Buttons shown ONLY if valid URL exists)
            if (data.liveApps && Array.isArray(data.liveApps)) {
                const container = document.querySelector('.live-projects-container');
                if (container) {
                    container.innerHTML = data.liveApps.map(app => {
                        const appStore = (app.appStoreUrl || '').trim();
                        const playStore = (app.playStoreUrl || '').trim();
                        const customerStore = (app.customerAppStoreUrl || '').trim();
                        const customUrl = (app.customUrl || '').trim();

                        let buttons = '';

                        if (appStore) {
                            buttons += `
                                <a href="${escapeHtml(appStore)}" target="_blank" rel="noopener noreferrer" class="live-btn">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.68-1.26z"/></svg>
                                    <span>App Store</span>
                                </a>`;
                        }

                        if (playStore) {
                            buttons += `
                                <a href="${escapeHtml(playStore)}" target="_blank" rel="noopener noreferrer" class="live-btn-outline">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.37-.367-.61-.882-.61-1.455V3.27c0-.573.24-1.088.609-1.456zM15.207 13.414l2.765 2.765-11.758 6.784 8.993-9.549zm0-2.828L6.214 1.037l11.758 6.784-2.765 2.765zm1.414 1.414l3.774 2.18c.953.55 1.605.174 1.605-1.04v-2.28c0-1.214-.652-1.59-1.605-1.04l-3.774 2.18z"/></svg>
                                    <span>Play Store</span>
                                </a>`;
                        }

                        if (customerStore) {
                            buttons += `
                                <a href="${escapeHtml(customerStore)}" target="_blank" rel="noopener noreferrer" class="live-btn-outline">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.68-1.26z"/></svg>
                                    <span>Customer App</span>
                                </a>`;
                        }

                        if (customUrl) {
                            buttons += `
                                <a href="${escapeHtml(customUrl)}" target="_blank" rel="noopener noreferrer" class="live-btn">
                                    <span>${escapeHtml(app.customLabel || 'Explore Product')}</span>
                                </a>`;
                        }

                        const footer = buttons.trim() 
                            ? `<div class="live-content-footer">${buttons}</div>` 
                            : '';

                        return `
                            <div class="live-card">
                                <div class="live-badge"><span class="pulse-dot"></span> ${escapeHtml(app.badge || 'LIVE APP')}</div>
                                <div class="live-content">
                                    <h3>${escapeHtml(app.name || '')}</h3>
                                    <div class="tech-sub">${escapeHtml(app.tech || '')}</div>
                                    <p>${escapeHtml(app.desc || '')}</p>
                                    ${footer}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // B. Sync Personal Details
            if (data.personal) {
                const p = data.personal;
                if (p.experienceYears) {
                    const expEl = document.querySelector('.hero-badge span:last-child');
                    if (expEl) expEl.textContent = `Production Proven • ${p.experienceYears} Years`;
                }
                if (p.bio) {
                    const bioEl = document.querySelector('.hero-bio');
                    if (bioEl) bioEl.textContent = p.bio;
                }
            }
            // C. Sync Testimonials / Recommendations
            if (data.testimonials && Array.isArray(data.testimonials)) {
                const testContainer = document.getElementById('testimonials-grid-container');
                if (testContainer) {
                    testContainer.innerHTML = data.testimonials.map(item => `
                        <div class="testimonial-card">
                            <div class="stars">★★★★★</div>
                            <p class="testimonial-quote">"${escapeHtml(item.text || '')}"</p>
                            <div class="client-info">
                                <strong>${escapeHtml(item.clientName || '')}</strong>
                                <span>${escapeHtml(item.clientRole || '')} • ${escapeHtml(item.project || '')}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (err) {
            console.warn('Portfolio sync notice:', err);
        }
    }

    // 5. Contact Form Lead Interceptor for Admin CMS Inbox
    const contactForm = document.querySelector('form[action*="formsubmit"]') || document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            try {
                const nameInput = contactForm.querySelector('input[name="name"], input[type="text"]');
                const emailInput = contactForm.querySelector('input[name="email"], input[type="email"]');
                const messageInput = contactForm.querySelector('textarea');

                const newLead = {
                    id: 'inq_' + Date.now(),
                    name: nameInput ? nameInput.value : 'Recruiter',
                    email: emailInput ? emailInput.value : '',
                    message: messageInput ? messageInput.value : '',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                };

                const inquiries = JSON.parse(localStorage.getItem('cms_inquiries') || '[]');
                inquiries.unshift(newLead);
                localStorage.setItem('cms_inquiries', JSON.stringify(inquiries.slice(0, 50)));
            } catch (e) {}
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(str).replace(/[&<>"']/g, m => map[m]);
    }

    syncDynamicPortfolioData();
});

// Global Toggle for Floating Quick-Connect
window.toggleQuickConnect = function () {
    const card = document.getElementById('quick-connect-card');
    if (card) {
        card.style.display = card.style.display === 'none' ? 'block' : 'none';
    }
};
