const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5050;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.svg': 'image/svg+xml'
};

const { exec, execSync } = require('child_process');

const server = http.createServer((req, res) => {
    // API: Get Full Portfolio Data
    if (req.method === 'GET' && req.url === '/api/portfolio-data') {
        const dataPath = path.join(__dirname, 'portfolio-data.json');
        fs.readFile(dataPath, 'utf8', (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: err.message }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(content);
        });
        return;
    }

    // API: Real-time Event Tracking
    if (req.method === 'POST' && req.url === '/api/track') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { event } = JSON.parse(body);
                const dataPath = path.join(__dirname, 'portfolio-data.json');
                let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                if (!db.analytics) {
                    db.analytics = { visits: 0, resumeDownloads: 0, whatsappClicks: 0, storeClicks: 0, dailyVisits: {} };
                }
                if (!db.analytics.dailyVisits) db.analytics.dailyVisits = {};

                const today = new Date().toISOString().split('T')[0];

                if (event === 'visit') {
                    db.analytics.visits = (db.analytics.visits || 0) + 1;
                    db.analytics.dailyVisits[today] = (db.analytics.dailyVisits[today] || 0) + 1;
                } else if (event === 'resume') {
                    db.analytics.resumeDownloads = (db.analytics.resumeDownloads || 0) + 1;
                } else if (event === 'whatsapp') {
                    db.analytics.whatsappClicks = (db.analytics.whatsappClicks || 0) + 1;
                } else if (event === 'store') {
                    db.analytics.storeClicks = (db.analytics.storeClicks || 0) + 1;
                }

                fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, analytics: db.analytics }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // API: Reset Analytics Counters
    if (req.method === 'POST' && req.url === '/api/reset-analytics') {
        try {
            const dataPath = path.join(__dirname, 'portfolio-data.json');
            let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            db.analytics = { visits: 0, resumeDownloads: 0, whatsappClicks: 0, storeClicks: 0, dailyVisits: {} };
            fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, analytics: db.analytics }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: Save Portfolio CMS Data
    if (req.method === 'POST' && req.url === '/api/save-portfolio') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { data, resumeBase64, photoBase64, pushToGit } = payload;

                // 1. Save portfolio-data.json
                const dataPath = path.join(__dirname, 'portfolio-data.json');
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

                // 2. Save Resume if provided, otherwise auto-compile dynamic 2-page PDF
                if (resumeBase64) {
                    const resumePath = path.join(__dirname, 'resume.pdf');
                    fs.writeFileSync(resumePath, Buffer.from(resumeBase64, 'base64'));
                } else {
                    try {
                        const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
                        const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
                        const bin = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);
                        if (bin) {
                            const targetUrl = 'file:///' + path.join(__dirname, 'resume.html').replace(/\\/g, '/');
                            exec(`"${bin}" --headless --disable-gpu --print-to-pdf="${path.join(__dirname, 'resume.pdf')}" --no-pdf-header-footer "${targetUrl}"`, (pdfErr) => {
                                if (pdfErr) console.warn('PDF auto-compile notice:', pdfErr.message);
                                else console.log('✓ Auto-compiled dynamic 2-page resume.pdf via Chrome');
                            });
                        }
                    } catch (pdfErr) {
                        console.warn('PDF auto-compile notice:', pdfErr.message);
                    }
                }

                // 3. Save Photo if provided
                if (photoBase64) {
                    const photoPath = path.join(__dirname, 'profile.jpg');
                    fs.writeFileSync(photoPath, Buffer.from(photoBase64, 'base64'));
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
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`;
    }
    if (c.includes('pay') || c.includes('gateway')) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
    }
    if (c.includes('api') || c.includes('cloud') || c.includes('service')) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
    }
    if (c.includes('tool') || c.includes('release') || c.includes('store') || c.includes('git')) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
    }
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
}

                // 4. Synchronize index.html
                const indexPath = path.join(__dirname, 'index.html');
                let html = fs.readFileSync(indexPath, 'utf8');

                if (data.personal) {
                    const p = data.personal;
                    if (p.experienceYears) {
                        html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(p.name)} | ${escapeHtml(p.role)} | ${escapeHtml(p.experienceYears)} Years Experience</title>`);
                        html = html.replace(/Production Proven • [0-9.]+\+? Years/, `Production Proven • ${escapeHtml(p.experienceYears)} Years`);
                    }
                    if (p.name) {
                        html = html.replace(/<h1>.*?<\/h1>/, `<h1>${escapeHtml(p.name)}</h1>`);
                    }
                    if (p.bio) {
                        html = html.replace(/<p class="hero-bio">.*?<\/p>/, `<p class="hero-bio">${escapeHtml(p.bio)}</p>`);
                    }
                    if (p.email) {
                        html = html.replace(/href="mailto:[^"]+"/g, `href="mailto:${escapeHtml(p.email)}"`);
                        html = html.replace(/<span>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}<\/span>/g, `<span>${escapeHtml(p.email)}</span>`);
                    }
                    if (p.phone) {
                        html = html.replace(/<span>\+91 [0-9]+<\/span>/g, `<span>${escapeHtml(p.phone)}</span>`);
                    }
                    if (p.whatsapp) {
                        html = html.replace(/href="https:\/\/wa\.me\/[0-9]+"/g, `href="https://wa.me/${escapeHtml(p.whatsapp)}"`);
                    }
                    if (p.linkedin) {
                        html = html.replace(/href="https:\/\/www\.linkedin\.com\/in\/[^"]+"/g, `href="${escapeHtml(p.linkedin)}"`);
                    }
                    if (p.github) {
                        html = html.replace(/href="https:\/\/github\.com\/[^"]+"/g, `href="${escapeHtml(p.github)}"`);
                    }
                }

                // Synchronize Career Experience Timeline
                if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
                    const newExpHtml = data.experience.map(exp => {
                        const words = (exp.company || '').trim().split(/\s+/);
                        const logoText = words.length > 1 
                            ? `${escapeHtml(words[0].slice(0, 2))}<br>${escapeHtml(words[1].slice(0, 3))}` 
                            : escapeHtml((exp.company || 'CO').slice(0, 4));
                        const periodStr = exp.period || (exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : '');
                        const pointsHtml = (exp.points || []).map(pt => `<li style="margin-bottom: 6px;">${escapeHtml(pt)}</li>`).join('\n                                        ');
                        return `            <div class="timeline-item">
                <div class="company-logo">${logoText}</div>
                <div class="exp-details">
                    <h3>${escapeHtml(exp.company || '')}</h3>
                    <h4>${escapeHtml(exp.role || '')}</h4>
                    <span class="meta">${escapeHtml(periodStr)} · ${escapeHtml(exp.location || '')}</span>
                    
                    <div class="inner-role">
                        <h5>Key Engineering Contributions & Production Impact</h5>
                        <ul style="margin: 10px 0 0 18px; padding: 0; color: #cbd5e1; font-size: 0.94em; line-height: 1.75;">
                            ${pointsHtml}
                        </ul>
                    </div>
                </div>
            </div>`;
                    }).join('\n\n');

                    html = html.replace(/<div class="timeline-container glass-card" id="experience-timeline-container">[\s\S]*?<\/div>\s*<\/section>/, `<div class="timeline-container glass-card" id="experience-timeline-container">\n${newExpHtml}\n        </div>\n    </section>`);
                }

                // Synchronize Skills Matrix
                if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
                    const newSkillsHtml = data.skills.map(group => {
                        const iconSvg = getSkillCategorySvg(group.category);
                        const pills = (group.items || []).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('\n                    ');
                        return `            <div class="skill-category-card">
                <h3>
                    ${iconSvg}
                    ${escapeHtml(group.category || 'Specialization')}
                </h3>
                <div class="skill-pills">
                    ${pills}
                </div>
            </div>`;
                    }).join('\n\n');

                    html = html.replace(/<div class="skills-matrix-container">[\s\S]*?<\/div>\s*<\/section>/, `<div class="skills-matrix-container">\n${newSkillsHtml}\n        </div>\n    </section>`);
                }

                // Synchronize Live Apps
                if (data.liveApps && Array.isArray(data.liveApps)) {
                    const newCardsHtml = data.liveApps.map(app => {
                        const appStore = (app.appStoreUrl || '').trim();
                        const playStore = (app.playStoreUrl || '').trim();
                        const customerStore = (app.customerAppStoreUrl || '').trim();
                        const customUrl = (app.customUrl || '').trim();

                        let buttons = '';
                        if (appStore) {
                            buttons += `\n                        <a href="${escapeHtml(appStore)}" target="_blank" rel="noopener noreferrer" class="live-btn">\n                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.68-1.26z"/></svg>\n                            <span>App Store</span>\n                        </a>`;
                        }
                        if (playStore) {
                            buttons += `\n                        <a href="${escapeHtml(playStore)}" target="_blank" rel="noopener noreferrer" class="live-btn-outline">\n                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.37-.367-.61-.882-.61-1.455V3.27c0-.573.24-1.088.609-1.456zM15.207 13.414l2.765 2.765-11.758 6.784 8.993-9.549zm0-2.828L6.214 1.037l11.758 6.784-2.765 2.765zm1.414 1.414l3.774 2.18c.953.55 1.605.174 1.605-1.04v-2.28c0-1.214-.652-1.59-1.605-1.04l-3.774 2.18z"/></svg>\n                            <span>Play Store</span>\n                        </a>`;
                        }
                        if (customerStore) {
                            buttons += `\n                        <a href="${escapeHtml(customerStore)}" target="_blank" rel="noopener noreferrer" class="live-btn-outline">\n                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.68-1.26z"/></svg>\n                            <span>Customer App</span>\n                        </a>`;
                        }
                        if (customUrl) {
                            buttons += `\n                        <a href="${escapeHtml(customUrl)}" target="_blank" rel="noopener noreferrer" class="live-btn">\n                            <span>${escapeHtml(app.customLabel || 'Explore Product')}</span>\n                        </a>`;
                        }

                        const footer = buttons.trim() ? `\n                    <div class="live-content-footer">${buttons}\n                    </div>` : '';

                        return `            <!-- App: ${escapeHtml(app.name)} -->\n            <div class="live-card">\n                <div class="live-badge"><span class="pulse-dot"></span> ${escapeHtml(app.badge || 'LIVE APP')}</div>\n                <div class="live-content">\n                    <h3>${escapeHtml(app.name || '')}</h3>\n                    <div class="tech-sub">${escapeHtml(app.tech || '')}</div>\n                    <p>${escapeHtml(app.desc || '')}</p>${footer}\n                </div>\n            </div>`;
                    }).join('\n\n');

                    html = html.replace(/<div class="live-projects-container">[\s\S]*?<\/div>\s*<\/section>/, `<div class="live-projects-container">\n${newCardsHtml}\n        </div>\n    </section>`);
                }

                fs.writeFileSync(indexPath, html, 'utf8');

                // 5. Git Commit & Push if requested
                if (pushToGit) {
                    exec('git add index.html profile.jpg resume.pdf portfolio-data.json .gitignore && git commit -m "Update portfolio data via Admin Panel" && git push origin main', (gitErr) => {
                        if (gitErr) {
                            console.error('Git push error:', gitErr);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ success: true, message: 'Saved locally, but Git push notice: ' + gitErr.message }));
                        }
                        console.log('✓ Git push successful!');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Portfolio updated and deployed to GitHub Pages successfully!' }));
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Portfolio updated locally on localhost!' }));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    const cleanUrl = (req.url || '/').split('?')[0];
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
    let ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
