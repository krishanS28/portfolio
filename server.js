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

const { exec } = require('child_process');

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

                // 2. Save Resume if provided
                if (resumeBase64) {
                    const resumePath = path.join(__dirname, 'resume.pdf');
                    fs.writeFileSync(resumePath, Buffer.from(resumeBase64, 'base64'));
                }

                // 3. Save Photo if provided
                if (photoBase64) {
                    const photoPath = path.join(__dirname, 'profile.jpg');
                    fs.writeFileSync(photoPath, Buffer.from(photoBase64, 'base64'));
                }

                // 4. Synchronize index.html
                const indexPath = path.join(__dirname, 'index.html');
                let html = fs.readFileSync(indexPath, 'utf8');

                if (data.personal) {
                    const p = data.personal;
                    if (p.experienceYears) {
                        html = html.replace(/<title>.*?<\/title>/, `<title>${p.name} | ${p.role} | ${p.experienceYears} Years Experience</title>`);
                        html = html.replace(/Production Proven • [0-9.]+\+? Years/, `Production Proven • ${p.experienceYears} Years`);
                    }
                    if (p.name) {
                        html = html.replace(/<h1>.*?<\/h1>/, `<h1>${p.name}</h1>`);
                    }
                    if (p.bio) {
                        html = html.replace(/<p class="hero-bio">.*?<\/p>/, `<p class="hero-bio">${p.bio}</p>`);
                    }
                    if (p.email) {
                        html = html.replace(/href="mailto:[^"]+"/g, `href="mailto:${p.email}"`);
                        html = html.replace(/<span>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}<\/span>/g, `<span>${p.email}</span>`);
                    }
                    if (p.phone) {
                        html = html.replace(/<span>\+91 [0-9]+<\/span>/g, `<span>${p.phone}</span>`);
                    }
                    if (p.whatsapp) {
                        html = html.replace(/href="https:\/\/wa\.me\/[0-9]+"/g, `href="https://wa.me/${p.whatsapp}"`);
                    }
                    if (p.linkedin) {
                        html = html.replace(/href="https:\/\/www\.linkedin\.com\/in\/[^"]+"/g, `href="${p.linkedin}"`);
                    }
                    if (p.github) {
                        html = html.replace(/href="https:\/\/github\.com\/[^"]+"/g, `href="${p.github}"`);
                    }
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

    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
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
