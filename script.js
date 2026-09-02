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

// ==========================================
// VISITOR & INTERACTION ANALYTICS TRACKER
// ==========================================
(function trackPortfolioInteractions() {
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
            localStorage.setItem('cms_analytics', JSON.stringify(stats));
        }

        // Track resume downloads
        document.querySelectorAll('a[href*="resume.pdf"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = JSON.parse(localStorage.getItem('cms_analytics') || '{}');
                s.resumeDownloads = (s.resumeDownloads || 0) + 1;
                localStorage.setItem('cms_analytics', JSON.stringify(s));
            });
        });

        // Track WhatsApp clicks
        document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = JSON.parse(localStorage.getItem('cms_analytics') || '{}');
                s.whatsappClicks = (s.whatsappClicks || 0) + 1;
                localStorage.setItem('cms_analytics', JSON.stringify(s));
            });
        });

        // Track App Store / Play Store clicks
        document.querySelectorAll('.live-btn, .live-btn-outline').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = JSON.parse(localStorage.getItem('cms_analytics') || '{}');
                s.storeClicks = (s.storeClicks || 0) + 1;
                localStorage.setItem('cms_analytics', JSON.stringify(s));
            });
        });
    } catch (e) {}
})();
