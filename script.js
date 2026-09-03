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

            // C. Sync Work Experience Timeline (Multiple Companies)
            if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
                const expContainer = document.getElementById('experience-timeline-container');
                if (expContainer) {
                    expContainer.innerHTML = data.experience.map(exp => {
                        const words = (exp.company || '').trim().split(/\s+/);
                        const logoText = words.length > 1 
                            ? `${escapeHtml(words[0].slice(0, 2))}<br>${escapeHtml(words[1].slice(0, 3))}` 
                            : escapeHtml((exp.company || 'CO').slice(0, 4));
                        const periodStr = exp.period || (exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : '');
                        return `
                        <div class="timeline-item">
                            <div class="company-logo">${logoText}</div>
                            <div class="exp-details">
                                <h3>${escapeHtml(exp.company || '')}</h3>
                                <h4>${escapeHtml(exp.role || '')}</h4>
                                <span class="meta">${escapeHtml(periodStr)} · ${escapeHtml(exp.location || '')}</span>
                                
                                <div class="inner-role">
                                    <h5>Key Engineering Contributions & Production Impact</h5>
                                    <ul style="margin: 10px 0 0 18px; padding: 0; color: #cbd5e1; font-size: 0.94em; line-height: 1.75;">
                                        ${(exp.points || []).map(pt => `<li style="margin-bottom: 6px;">${escapeHtml(pt)}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('');
                }
            }

            // D. Sync Technical Skills Matrix from CMS
            if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
                const skillsContainer = document.querySelector('.skills-matrix-container');
                if (skillsContainer) {
                    skillsContainer.innerHTML = data.skills.map(group => {
                        const iconSvg = getSkillCategorySvg(group.category);
                        const pills = (group.items || []).map(skill => {
                            return `<span class="skill-tag">${escapeHtml(skill)}</span>`;
                        }).join('');

                        return `
                            <div class="skill-category-card">
                                <h3>
                                    ${iconSvg}
                                    ${escapeHtml(group.category || 'Specialization')}
                                </h3>
                                <div class="skill-pills">
                                    ${pills}
                                </div>
                            </div>
                        `;
                    }).join('');
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

    function getSkillCategorySvg(cat) {
        const c = (cat || '').toLowerCase();
        if (c.includes('mobile')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
        }
        if (c.includes('state') || c.includes('arch')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`;
        }
        if (c.includes('real-time') || c.includes('media') || c.includes('stream')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
        }
        if (c.includes('ai') || c.includes('ar') || c.includes('3d')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`;
        }
        if (c.includes('pay') || c.includes('gate') || c.includes('stripe')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
        }
        if (c.includes('api') || c.includes('cloud') || c.includes('service')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg>`;
        }
        if (c.includes('tool') || c.includes('store') || c.includes('release') || c.includes('git')) {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
        }
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
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

// ==========================================
// THEME ACCENT SWITCHER
// ==========================================
function switchTheme(theme) {
    if (theme === 'cyan') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('portfolio_theme_accent', theme);

    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.classList.toggle('active', dot.classList.contains(theme));
    });
}
window.switchTheme = switchTheme;

// ==========================================
// THEME COLOR MODE (DARK vs WHITE / LIGHT)
// ==========================================
function toggleColorMode() {
    const current = document.documentElement.getAttribute('data-theme-mode') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    setColorMode(next);
}

function setColorMode(mode) {
    if (mode === 'light') {
        document.documentElement.setAttribute('data-theme-mode', 'light');
    } else {
        document.documentElement.setAttribute('data-theme-mode', 'dark');
    }
    localStorage.setItem('krishan_theme_mode', mode);
    updateThemeToggleUI(mode);
}

function updateThemeToggleUI(mode) {
    document.querySelectorAll('.theme-mode-toggle').forEach(btn => {
        const icon = btn.querySelector('.theme-mode-icon');
        const text = btn.querySelector('.theme-mode-text');
        if (mode === 'light') {
            if (icon) icon.textContent = '☀️';
            if (text) text.textContent = 'White';
            btn.setAttribute('title', 'Switch to Dark Mode');
        } else {
            if (icon) icon.textContent = '🌙';
            if (text) text.textContent = 'Dark';
            btn.setAttribute('title', 'Switch to White (Light) Mode');
        }
    });
}
window.toggleColorMode = toggleColorMode;

// Auto-restore saved color mode
const initialColorMode = localStorage.getItem('krishan_theme_mode') || 'dark';
setColorMode(initialColorMode);

// Auto-restore saved theme
const savedTheme = localStorage.getItem('portfolio_theme_accent') || 'cyan';
if (savedTheme !== 'cyan') {
    document.documentElement.setAttribute('data-theme', savedTheme);
}
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('portfolio_theme_accent') || 'cyan';
    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.classList.toggle('active', dot.classList.contains(saved));
    });
    updateThemeToggleUI(localStorage.getItem('krishan_theme_mode') || 'dark');
});

// ==========================================
// SYSTEM ARCHITECTURES MODAL DATA & LOGIC
// ==========================================
const ARCH_DATA = {
    webrtc: {
        title: 'WebRTC, LiveKit & Telnyx Real-Time Media Engine',
        desc: 'Production media streaming architecture powering live tournament broadcasting with ultra-low latency (<150ms). Handles SDP negotiations, ICE candidates, SFU publication trees, and dynamic bitrate adaptation.',
        nodes: [
            { title: 'Publisher Device', desc: 'React Native + LiveKit Client (H.264/Opus)' },
            { title: 'Signaling Server', desc: 'WebSocket SDP / ICE Candidate Exchange' },
            { title: 'LiveKit SFU Node', desc: 'Selective Forwarding Unit & Track Router' },
            { title: 'Subscriber Mesh', desc: 'Ultra-low latency audio/video playback' }
        ],
        specs: [
            { label: 'End-to-End Latency', value: '< 150ms Glass-to-Glass' },
            { label: 'Media Codec', value: 'H.264 Video / Opus Audio' },
            { label: 'Network Traversal', value: 'STUN / TURN Fallback' },
            { label: 'Concurrency Tested', value: '5,000+ Concurrent Viewers' }
        ]
    },
    slm_ai: {
        title: 'On-Device SLM Offline AI Chat Architecture',
        desc: 'Fully standalone conversational intelligence running directly on the mobile CPU/NPU without cloud dependencies, eliminating recurring cloud API costs and providing 100% offline private execution.',
        nodes: [
            { title: 'User Input', desc: 'Native Chat UI + Tokenizer' },
            { title: 'C++ Native Bridge', desc: 'React Native JSI Memory Bridge' },
            { title: 'Quantized SLM', desc: '4-bit GGUF Model on Device Memory' },
            { title: 'Streaming Engine', desc: 'Token-by-token real-time generator' }
        ],
        specs: [
            { label: 'Cloud Dependency', value: '0% (100% Offline)' },
            { label: 'Inference Speed', value: '25-35 Tokens / Sec' },
            { label: 'Quantization', value: '4-bit Weight Quantization' },
            { label: 'Privacy & Security', value: 'Zero Data Leaves Device' }
        ]
    },
    ar_3d: {
        title: 'Native iOS/Android 3D & AR Try-On Bridge',
        desc: 'High-performance bridge connecting React Native components to native graphics engines (ARKit/SceneKit on iOS, ARCore/Sceneform on Android) for face/wrist tracking and photorealistic 3D model visualization.',
        nodes: [
            { title: 'Camera Stream', desc: '60 FPS Native Sensor Frame' },
            { title: 'Anchor Detection', desc: 'ARKit / ARCore Face Mesh Anchor' },
            { title: 'SceneKit / Sceneform', desc: '3D glTF Model Transformation' },
            { title: 'React Native Host', desc: 'Interactive Gestures & Customization' }
        ],
        specs: [
            { label: 'Frame Rate', value: 'Rock-solid 60 FPS' },
            { label: 'Supported Formats', value: 'glTF, USDZ, OBJ' },
            { label: 'Tracking Tech', value: 'Facial Landmark Mesh & Wrist Plane' },
            { label: 'Bridge Type', value: 'Turbomodule / JSI Architecture' }
        ]
    },
    messaging: {
        title: 'WhatsApp-Style Real-Time Messaging Architecture',
        desc: 'Enterprise-scale chat pipeline with local-first SQLite offline caching, bidirectional WebSocket sync, optimistic UI message delivery, sent/delivered/read double ticks, and FCM/APNs background push wakeups.',
        nodes: [
            { title: 'Local SQLite Store', desc: 'Instant Optimistic UI Write' },
            { title: 'WebSocket Gateway', desc: 'Socket.IO Secure Multiplexing' },
            { title: 'Message Broker', desc: 'Redis Pub/Sub & Delivery State Machine' },
            { title: 'Push Notification', desc: 'APNs & FCM Background Wakeup' }
        ],
        specs: [
            { label: 'Sync Model', value: 'Offline-First Local SQLite' },
            { label: 'Delivery States', value: 'Pending ➔ Sent ➔ Delivered ➔ Read' },
            { label: 'Network Fallback', value: 'Auto-Reconnecting Exponential Backoff' },
            { label: 'Encryption', value: 'AES-256 Transport Encryption' }
        ]
    },
    payments: {
        title: 'Secure Multi-Gateway Payment Abstraction Layer',
        desc: 'Unified payment lifecycle architecture powering in-app purchases and checkout across 20+ production apps, supporting Apple Pay, Stripe 3D Secure, PayPal, Paydunya, and Pay Stack with automated webhook reconciliation.',
        nodes: [
            { title: 'Client Checkout', desc: 'Native Apple Pay / Card Sheet' },
            { title: 'Payment Router', desc: 'Dynamic Gateway Routing Engine' },
            { title: '3D Secure 2.0', desc: 'Biometric SCA Frictionless Flow' },
            { title: 'Webhook Worker', desc: 'Idempotent Ledger Reconciliation' }
        ],
        specs: [
            { label: 'Gateways Supported', value: 'Stripe, Apple Pay, PayPal, Pay Stack' },
            { label: 'Compliance', value: 'PCI-DSS Level 1 Compliant' },
            { label: 'Auth Protocols', value: '3D Secure 2.0 & Biometrics' },
            { label: 'Success Rate', value: '99.4% Across Multi-Currency' }
        ]
    },
    gps_tracking: {
        title: 'GPS Background Fleet Tracking & Geofencing',
        desc: 'Battery-optimized real-time logistics tracking engine featuring native foreground background services, adaptive distance filtering, geofence enter/exit triggers, and live Socket.IO driver dispatch updates.',
        nodes: [
            { title: 'Foreground Service', desc: 'High-Accuracy Hardware GPS Polling' },
            { title: 'Adaptive Filter', desc: 'Kalman Distance & Velocity Filter' },
            { title: 'Socket Streamer', desc: 'Live Telemetry Socket Transmission' },
            { title: 'Dispatcher Map', desc: 'Live Driver Interpolation & ETAs' }
        ],
        specs: [
            { label: 'Battery Impact', value: '< 3% Drain Per 8-Hour Shift' },
            { label: 'Update Frequency', value: 'Sub-second Position Interpolation' },
            { label: 'Smoothing Filter', value: 'Kalman Filter for GPS Noise Reduction' },
            { label: 'Offline Resiliency', value: 'Store & Forward Local Queue' }
        ]
    }
};

window.openArchModal = function (archKey) {
    const data = ARCH_DATA[archKey];
    if (!data) return;

    document.getElementById('arch-modal-title').textContent = data.title;
    document.getElementById('arch-modal-desc').textContent = data.desc;

    // Render flow diagram nodes
    const diagramEl = document.getElementById('arch-flow-diagram');
    diagramEl.innerHTML = data.nodes.map((node, i) => `
        <div class="flow-node">
            <h5>${node.title}</h5>
            <p>${node.desc}</p>
        </div>
        ${i < data.nodes.length - 1 ? '<div class="flow-arrow">➔</div>' : ''}
    `).join('');

    // Render specs
    const specsEl = document.getElementById('arch-specs');
    specsEl.innerHTML = data.specs.map(spec => `
        <div class="spec-box">
            <span>${spec.label}</span>
            <strong>${spec.value}</strong>
        </div>
    `).join('');

    const overlay = document.getElementById('arch-modal-overlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeArchModal = function () {
    const overlay = document.getElementById('arch-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
};

// Close architecture modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeArchModal();
    }
});

// ==========================================
// VISITOR & INTERACTION ANALYTICS TRACKER
// ==========================================
(function trackPortfolioInteractions() {
    function sendRealEvent(eventName) {
        try {
            fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: eventName })
            }).catch(() => {});
        } catch (e) {}
    }

    try {
        const stats = JSON.parse(localStorage.getItem('cms_analytics') || JSON.stringify({
            visits: 0,
            resumeDownloads: 0,
            whatsappClicks: 0,
            storeClicks: 0,
            lastVisit: null
        }));

        // Increment visit once per session
        if (!sessionStorage.getItem('visited_session')) {
            sessionStorage.setItem('visited_session', '1');
            stats.visits = (stats.visits || 0) + 1;
            stats.lastVisit = new Date().toISOString();
            const today = new Date().toISOString().split('T')[0];
            if (!stats.dailyVisits) stats.dailyVisits = {};
            stats.dailyVisits[today] = (stats.dailyVisits[today] || 0) + 1;
            localStorage.setItem('cms_analytics', JSON.stringify(stats));
            sendRealEvent('visit');
        }

        // Track resume downloads
        document.querySelectorAll('a[href*="resume.pdf"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = JSON.parse(localStorage.getItem('cms_analytics') || '{}');
                s.resumeDownloads = (s.resumeDownloads || 0) + 1;
                localStorage.setItem('cms_analytics', JSON.stringify(s));
                sendRealEvent('resume');
            });
        });

        // Track WhatsApp clicks
        document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = JSON.parse(localStorage.getItem('cms_analytics') || '{}');
                s.whatsappClicks = (s.whatsappClicks || 0) + 1;
                localStorage.setItem('cms_analytics', JSON.stringify(s));
                sendRealEvent('whatsapp');
            });
        });

        // Track App Store / Play Store clicks
        document.querySelectorAll('.live-btn, .live-btn-outline').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = JSON.parse(localStorage.getItem('cms_analytics') || '{}');
                s.storeClicks = (s.storeClicks || 0) + 1;
                localStorage.setItem('cms_analytics', JSON.stringify(s));
                sendRealEvent('store');
            });
        });
    } catch (e) {}
})();

// ==========================================
// INTELLECTUAL PROPERTY & COPYRIGHT GUARD
// ==========================================
(function initCopyrightProtection() {
    // 1. DevTools Console Warning Banner
    console.log(
        '%c⚠️ COPYRIGHT & INTELLECTUAL PROPERTY NOTICE',
        'color: #00f0ff; background: #0b111e; font-size: 15px; font-weight: 800; padding: 8px 14px; border-radius: 6px; border: 1px solid #00f0ff;'
    );
    console.log(
        '%cAll source code, UI architectures, and designs in this portfolio are the exclusive proprietary property of Krishan Lal (© 2026). Unauthorized cloning, scraping, reproduction, or redistribution is strictly prohibited under international copyright law.',
        'color: #94a3b8; font-size: 12px; line-height: 1.5;'
    );

    // 2. Disable Right-Click Context Menu with subtle Toast Notification
    document.addEventListener('contextmenu', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
        showCopyrightToast('🛡️ Copyright Protected © 2026 Krishan Lal. Content & code copying is disabled.');
    });

    // 3. Disable Keyboard Shortcuts for View Source / Devtools / Save
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12') {
            e.preventDefault();
            showCopyrightToast('🛡️ Developer inspection is restricted. Proprietary work of Krishan Lal.');
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            const key = (e.key || '').toLowerCase();
            if (key === 'u' || key === 's' || (e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))) {
                e.preventDefault();
                showCopyrightToast('🛡️ Source code copying is prohibited by Copyright Law (© 2026 Krishan Lal).');
            }
        }
    });

    function showCopyrightToast(msg) {
        let toast = document.getElementById('copyright-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'copyright-toast';
            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:rgba(11,17,30,0.95);border:1px solid #00f0ff;box-shadow:0 10px 30px rgba(0,0,0,0.8),0 0 20px rgba(0,240,255,0.35);color:#ffffff;font-family:\'Poppins\',sans-serif;font-size:0.85em;font-weight:600;padding:12px 22px;border-radius:30px;z-index:999999;pointer-events:none;transition:transform 0.3s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease;opacity:0;display:flex;align-items:center;gap:10px;white-space:nowrap;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
        }, 2600);
    }
})();



