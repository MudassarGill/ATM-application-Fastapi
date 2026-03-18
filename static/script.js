/**
 * ATM Simulation System — Client Logic
 * ======================================
 * Handles section navigation, API calls, toast notifications,
 * and the particle background animation.
 */

const API = '';  // Same origin

// ── State ────────────────────────────────────
let currentUser = null;  // { name, email, balance }

// ── DOM refs ─────────────────────────────────
const sections = {
    login:     document.getElementById('login-section'),
    signup:    document.getElementById('signup-section'),
    dashboard: document.getElementById('dashboard-section'),
};
const loginForm      = document.getElementById('login-form');
const signupForm     = document.getElementById('signup-form');
const depositForm    = document.getElementById('deposit-form');
const withdrawForm   = document.getElementById('withdraw-form');
const balanceDisplay = document.getElementById('balance-display');
const welcomeText    = document.getElementById('welcome-text');
const userGreeting   = document.getElementById('user-greeting');
const logoutBtn      = document.getElementById('logout-btn');

// ══════════════════════════════════════════════
// Section Navigation
// ══════════════════════════════════════════════

function showSection(name) {
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[name].classList.add('active');

    // Re-trigger fade-in on children
    sections[name].querySelectorAll('.fade-in').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight;  // reflow
        el.style.animation = '';
    });
}

document.getElementById('goto-signup').addEventListener('click', e => {
    e.preventDefault();
    showSection('signup');
});
document.getElementById('goto-login').addEventListener('click', e => {
    e.preventDefault();
    showSection('login');
});
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    showSection('login');
    showToast('Logged out successfully', 'info');
});

// ══════════════════════════════════════════════
// Toast Notifications
// ══════════════════════════════════════════════

function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(60px)';
        toast.style.transition = '0.35s ease';
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

// ══════════════════════════════════════════════
// API Helpers
// ══════════════════════════════════════════════

async function apiCall(endpoint, body, btn) {
    if (btn) btn.classList.add('loading');
    try {
        const res = await fetch(`${API}/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Something went wrong');
        }
        return data;
    } catch (err) {
        throw err;
    } finally {
        if (btn) btn.classList.remove('loading');
    }
}

// ══════════════════════════════════════════════
// Update Dashboard
// ══════════════════════════════════════════════

function updateDashboard() {
    if (!currentUser) return;
    balanceDisplay.textContent = `$${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    userGreeting.textContent = `Hello, ${currentUser.name}`;

    // Bump animation
    balanceDisplay.classList.remove('bump');
    void balanceDisplay.offsetHeight;
    balanceDisplay.classList.add('bump');
}

function enterDashboard(userData) {
    currentUser = {
        name: userData.name,
        email: userData.email,
        balance: userData.balance ?? 0,
    };
    welcomeText.textContent = `Welcome, ${currentUser.name}!`;
    updateDashboard();
    showSection('dashboard');
}

// ══════════════════════════════════════════════
// Form Handlers
// ══════════════════════════════════════════════

// Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const btn      = document.getElementById('signup-btn');
    try {
        await apiCall('signup', { name, email, password }, btn);
        showToast('Account created! Please sign in.', 'success');
        signupForm.reset();
        showSection('login');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');
    try {
        const res = await apiCall('login', { email, password }, btn);
        showToast(res.message, 'success');
        loginForm.reset();
        enterDashboard(res.data);
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// Deposit
depositForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    try {
        const res = await apiCall('deposit', { email: currentUser.email, amount });
        currentUser.balance = res.data.balance;
        updateDashboard();
        showToast(res.message, 'success');
        depositForm.reset();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// Withdraw
withdrawForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    try {
        const res = await apiCall('withdraw', { email: currentUser.email, amount });
        currentUser.balance = res.data.balance;
        updateDashboard();
        showToast(res.message, 'success');
        withdrawForm.reset();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ══════════════════════════════════════════════
// Particle Background
// ══════════════════════════════════════════════

(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECT_DIST = 120;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.r = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });

        // Connection lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 * (1 - dist / CONNECT_DIST)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();
