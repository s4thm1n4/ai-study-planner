// Enhanced JavaScript for Multi-Agent Study Planner with JWT Authentication

const API_BASE_URL = 'http://127.0.0.1:8000';
let currentUser = null;
let authToken = null;
let progressData = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeAuth();
    loadUserAssessment();
    setupEventListeners();
    loadProgressData();
    refreshProgressDisplay();
    // Styles are primarily in the HTML now, this can be minimal or empty
    injectDynamicStyles();
    // Show the default page correctly
    showPage('advancedPlanner');
});

// Load user assessment HTML
async function loadUserAssessment() {
    try {
        const response = await fetch('user-assessment.html');
        if (!response.ok) throw new Error('Failed to load user-assessment.html');
        const html = await response.text();
        const container = document.getElementById('assessment-content-wrapper');
        if (container) {
            container.innerHTML = html;
            if (window.userAssessment && typeof window.userAssessment.initialize === 'function') {
                window.userAssessment.initialize(); console.log('User assessment module initialized.');
            }
        } else { console.warn('assessment-content-wrapper not found.'); }
    } catch (error) { console.error('Error loading user assessment:', error); }
}

// --- Authentication ---
function initializeAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    const loginRequiredView = document.getElementById('loginRequired');
    const mainContentView = document.getElementById('mainContent');
    if (token && userData) {
        authToken = token; currentUser = JSON.parse(userData);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (Date.now() >= payload.exp * 1000) { console.warn("Token expired"); showLoginRequired(); return; }
            console.log('User authenticated:', currentUser.username);
            if (loginRequiredView) loginRequiredView.style.display = 'none';
            if (mainContentView) mainContentView.style.display = 'block'; // Make sure content is visible
            updateUserProfile();
        } catch (error) { console.error("Token parse error:", error); showLoginRequired(); }
    } else { showLoginRequired(); }
}
function showLoginRequired() {
    const loginRequiredView = document.getElementById('loginRequired');
    const mainContentView = document.getElementById('mainContent');
    if (loginRequiredView) loginRequiredView.style.display = 'flex';
    if (mainContentView) mainContentView.style.display = 'none'; // Hide main content
    localStorage.removeItem('authToken'); localStorage.removeItem('currentUser'); localStorage.removeItem('aiStudyPlannerProgress');
    authToken = null; currentUser = null;
}
function updateUserProfile() { if (!currentUser) return; document.getElementById('welcomeTitle').textContent = `Welcome, ${currentUser.username}!`; document.getElementById('userName').textContent = currentUser.username; document.getElementById('userEmail').textContent = currentUser.email; document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase(); }
function logout() { authToken = null; currentUser = null; showLoginRequired(); }

// --- Event Listeners (Original + Summarizer) ---
function setupEventListeners() {
    document.getElementById('logoutButton')?.addEventListener('click', logout);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); const btn=document.getElementById('themeToggle'); if(btn) btn.innerHTML = '<i class="fas fa-sun"></i>'; }
    document.getElementById('findResourcesButton')?.addEventListener('click', handleFindResources);
    document.getElementById('getMotivationButton')?.addEventListener('click', handleGetMotivation);
    document.getElementById('markTodayCompleteButton')?.addEventListener('click', markTodayComplete);
    document.getElementById('resetProgressButton')?.addEventListener('click', resetProgress);
    document.getElementById('helpButton')?.addEventListener('click', () => { const modal = document.getElementById('helpModal'); if(modal) modal.style.display = 'block'; });
    document.getElementById('closeHelpModal')?.addEventListener('click', () => { const modal = document.getElementById('helpModal'); if(modal) modal.style.display = 'none'; });
    document.addEventListener('keydown', handleShortcuts);

    // ⭐ Summarizer Listeners ⭐
    document.getElementById('summarizeButton')?.addEventListener('click', handleSummarizeDocument);
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const nameEl = document.getElementById('fileUploadName');
            if (nameEl) {
               if (fileInput.files.length > 0) nameEl.textContent = fileInput.files[0].name;
               else nameEl.textContent = 'Click to choose file...';
            }
        });
    }
}

// --- Page Navigation, Theme, Toast, Shortcuts ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); // Use class for active page
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active'); // Show target page
    else console.warn("Page not found:", pageId);
    document.querySelectorAll('.nav-item').forEach(i => { i.classList.remove('active'); if (i.getAttribute('onclick') === `showPage('${pageId}')`) i.classList.add('active'); });
}
function toggleTheme() { document.body.classList.toggle('dark-mode'); const isDark = document.body.classList.contains('dark-mode'); localStorage.setItem('theme', isDark ? 'dark' : 'light'); const btn = document.getElementById('themeToggle'); if(btn) btn.innerHTML = `<i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i>`; }
function showToast(message, type = 'success') { const cont = document.getElementById('toastContainer'); if (!cont) return; const t = document.createElement('div'); t.className = `toast ${type}`; t.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`; cont.appendChild(t); setTimeout(() => { t.style.animation = 'slideOut 0.5s forwards'; setTimeout(() => t.remove(), 500); }, 3000); }
function handleShortcuts(e) { if (e.key === 'Escape') { const modal = document.getElementById('helpModal'); if(modal) modal.style.display = 'none';} if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return; if (e.key === 't' && !e.ctrlKey && !e.metaKey) toggleTheme(); if (e.key === '?' && !e.ctrlKey && !e.metaKey) { const modal = document.getElementById('helpModal'); if(modal) modal.style.display = 'block';} if (!e.ctrlKey && !e.metaKey && !e.altKey) { switch(e.key.toLowerCase()) { case 'p': showPage('advancedPlanner'); break; case 'r': showPage('findResources'); break; case 's': showPage('summarizePage'); break; case 'm': showPage('getMotivated'); break; case 'g': showPage('myProgress'); break; } } }


// --- API Calls ---
async function generateAdvancedPlan() { if (!window.userAssessment) { showToast('Assessment module not loaded.', 'error'); return; } const data = window.userAssessment.getData(); if (!data.subject) { showToast('Please enter a subject.', 'error'); return; } window.userAssessment.setLoading(true); try { const r = await fetch(`${API_BASE_URL}/api/planner/generate-advanced`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }, body: JSON.stringify(data) }); if (!r.ok) { const err = await r.json(); throw new Error(err.detail || 'Failed'); } const plan = await r.json(); updateProgressWithNewPlan(plan.plan); showToast('Plan generated!', 'success'); showPage('myProgress'); } catch (e) { console.error("Plan Gen Error:", e); showToast(e.message, 'error'); } finally { if (window.userAssessment.setLoading) window.userAssessment.setLoading(false); } }
async function handleFindResources() { const topic = document.getElementById('resourceTopic').value; const resultsDiv = document.getElementById('resourceResults'); if (!topic) { showToast('Enter topic.', 'error'); return; } if (!authToken) { showToast('Log in.', 'error'); return; } resultsDiv.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Searching...</div>`; try { const r = await fetch(`${API_BASE_URL}/api/resources/find-advanced?topic=${encodeURIComponent(topic)}`, { method: 'GET', headers: { 'Authorization': `Bearer ${authToken}` } }); if (!r.ok) { const err = await r.json(); throw new Error(err.detail || 'Failed'); } const data = await r.json(); if (data.resources?.length > 0) { let html = '<div class="resource-grid">'; data.resources.forEach(res => { html += `<div class="resource-card"><span>${res.type||'Resource'}</span><h4>${res.title}</h4><p>${res.snippet||''}</p><a href="${res.url}" target="_blank" rel="noopener noreferrer">View <i class="fas fa-external-link-alt"></i></a></div>`; }); html += '</div>'; resultsDiv.innerHTML = html; } else { resultsDiv.innerHTML = '<div class="error-message">No resources found.</div>'; } } catch (e) { console.error("Resource Error:", e); resultsDiv.innerHTML = `<div class="error-message">${e.message}</div>`; showToast(e.message, 'error'); } }
async function handleGetMotivation() { const feeling = document.getElementById('userFeeling').value; const wrap = document.getElementById('motivationResultWrapper'), load = document.getElementById('motivationLoader'), div = document.getElementById('motivationResult'); if (!feeling) { showToast('Enter feeling.', 'error'); return; } if (!authToken) { showToast('Log in.', 'error'); return; } wrap.style.display = 'block'; load.style.display = 'block'; div.innerHTML = ''; try { const r = await fetch(`${API_BASE_URL}/api/motivation/get-advanced`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }, body: JSON.stringify({ user_input: feeling }) }); if (!r.ok) { const err = await r.json(); throw new Error(err.detail || 'Failed'); } const data = await r.json(); load.style.display = 'none'; let html = ''; if (data.personalized_message) html += `<p style="white-space: pre-wrap;">${data.personalized_message}</p>`; if (data.motivational_quote?.content) html += `<div class="quote">"${data.motivational_quote.content}"</div> <div class="author">- ${data.motivational_quote.author || 'Unknown'}</div>`; div.innerHTML = html; } catch (e) { console.error("Motivation Error:", e); load.style.display = 'none'; wrap.style.display = 'none'; showToast(e.message, 'error'); } }

// --- ⭐ NEW API CALL: Summarize Document ⭐ ---
async function handleSummarizeDocument() {
    const fileInput = document.getElementById('fileUpload');
    const questionInput = document.getElementById('fileQuestion');
    const wrap = document.getElementById('summarizeResultWrapper'), load = document.getElementById('summarizeLoader'), div = document.getElementById('summarizeContent');
    const file = fileInput.files[0];
    const question = questionInput.value.trim();

    if (!authToken) { showToast('Log in to summarize.', 'error'); return; }
    if (!file) { showToast('Upload a file.', 'error'); return; }

    wrap.style.display = 'block'; load.style.display = 'block'; div.innerHTML = '';

    const formData = new FormData();
    formData.append('file', file);
    if (question) { formData.append('question', question); }
    console.log('FormData sending:', { file: file.name, question: question || null });

    try {
        const response = await fetch(`${API_BASE_URL}/api/summarize-document`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        load.style.display = 'none';

        if (!response.ok) {
            let errorDetail = `HTTP error ${response.status}`;
            try { const errData = await response.json(); errorDetail = errData.detail || JSON.stringify(errData); }
            catch (jsonError) { errorDetail = response.statusText || errorDetail; }
            if (response.status === 405) errorDetail += " (Method Not Allowed - Check CORS)";
            throw new Error(errorDetail);
        }

        const data = await response.json();
        console.log('Summarize response data:', data);

        if (data.status === 'success') {
            if (data.type === 'summary') {
                div.innerHTML = `<h4>Summary: ${escapeHtml(data.filename)}</h4><p class="response-text"></p>`;
                div.querySelector('.response-text').textContent = data.summary;
            } else if (data.type === 'qa') {
                div.innerHTML = `<h4>Question:</h4><p><em>${escapeHtml(data.question)}</em></p><hr><h4>Answer:</h4><p class="response-text"></p>`;
                div.querySelector('.response-text').textContent = data.answer;
            }
        } else {
            throw new Error(data.message || 'Summarization failed on server.');
        }

    } catch (error) {
        console.error('Summarization failed:', error);
        load.style.display = 'none';
        div.innerHTML = `<div class="error-message">Error: ${escapeHtml(error.message)}</div>`;
        showToast(`Summarization failed: ${error.message}`, 'error');
    }
}
function escapeHtml(unsafe) { if (!unsafe) return ''; return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }

// --- Progress Tracking (Keep Original) ---
function loadProgressData() { const d = localStorage.getItem('aiStudyPlannerProgress'); progressData = d ? JSON.parse(d) : { currentPlan: null, dailyProgress: {}, streak: 0, achievements: [], startDate: null }; }
function saveProgressData() { localStorage.setItem('aiStudyPlannerProgress', JSON.stringify(progressData)); }
function refreshProgressDisplay() { const sc = document.getElementById('streakCount'); if (sc) { updateStreak(); sc.textContent = `${progressData.streak} Day${progressData.streak === 1 ? '' : 's'}`; } const cal = document.getElementById('streakCalendar'); if (cal) { cal.innerHTML = ''; if (progressData.startDate) { const s = new Date(progressData.startDate), t = new Date(); let ds = Math.ceil((t - s) / 864e5) + 1; ds = Math.max(ds, 30); for (let i = 0; i < ds; i++) { let day = new Date(s); day.setDate(s.getDate() + i); let dayStr = day.toISOString().split('T')[0]; const el = document.createElement('div'); el.className = 'calendar-day'; el.title = dayStr; if (progressData.dailyProgress[dayStr]) el.classList.add('complete'); cal.appendChild(el); } } else { cal.innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem;">Generate plan.</p>'; } } const al = document.getElementById('achievementList'); if (al) { const ach = { 'first_step': 'First plan.', '3_day_streak': '3-day streak.', '7_day_streak': '7-day streak.', 'first_day': 'First day complete.' }; al.innerHTML = ''; for (const [k, d] of Object.entries(ach)) { const li = document.createElement('li'); const iconClass = progressData.achievements.includes(k) ? 'fa-check-circle' : 'fa-times-circle'; const iconColor = progressData.achievements.includes(k) ? 'var(--success)' : 'var(--border-color)'; li.innerHTML = `<i class="fas ${iconClass}" style="color: ${iconColor};"></i> ${d}`; li.className = progressData.achievements.includes(k) ? 'unlocked' : ''; al.appendChild(li); } } }
function updateStreak() { let cs = 0, checkDate = new Date(); while (true) { let dayString = checkDate.toISOString().split('T')[0]; if (progressData.dailyProgress[dayString]) { cs++; checkDate.setDate(checkDate.getDate() - 1); } else { if (cs === 0 && dayString === new Date().toISOString().split('T')[0]) { let y = new Date(); y.setDate(y.getDate() - 1); let ys = y.toISOString().split('T')[0]; if (!progressData.dailyProgress[ys]) { break; } else { checkDate.setDate(checkDate.getDate() - 1); continue; } } else { break; } } } progressData.streak = cs; }
function checkAchievements() { let c = false; if (progressData.currentPlan && !progressData.achievements.includes('first_step')) { progressData.achievements.push('first_step'); showToast('Ach: First Step!', 'success'); c = true; } if (Object.keys(progressData.dailyProgress).length > 0 && !progressData.achievements.includes('first_day')) { progressData.achievements.push('first_day'); showToast('Ach: Day One!', 'success'); c = true; } if (progressData.streak >= 3 && !progressData.achievements.includes('3_day_streak')) { progressData.achievements.push('3_day_streak'); showToast('Ach: On Fire!', 'success'); c = true; } if (progressData.streak >= 7 && !progressData.achievements.includes('7_day_streak')) { progressData.achievements.push('7_day_streak'); showToast('Ach: Consistent!', 'success'); c = true; } if (c) saveProgressData(); }
function injectDynamicStyles() {
     // Since most styles are in the HTML now, this can be empty or removed
     // unless specific dynamic styles are needed later.
     console.log("injectDynamicStyles placeholder.");
}
function markTodayComplete() { const t = new Date().toISOString().split('T')[0]; if (progressData.dailyProgress[t]) { showToast("Already done!", 'error'); return; } progressData.dailyProgress[t] = true; updateStreak(); checkAchievements(); saveProgressData(); refreshProgressDisplay(); showToast('Day Complete!', 'success'); }
function resetProgress() { if (confirm('Reset progress?')) { progressData = { currentPlan: null, dailyProgress: {}, streak: 0, achievements: [], startDate: null }; saveProgressData(); refreshProgressDisplay(); showToast('Progress reset.', 'success'); } }
function updateProgressWithNewPlan(plan) { progressData.currentPlan = plan; if (!progressData.startDate) progressData.startDate = new Date().toISOString().split('T')[0]; checkAchievements(); saveProgressData(); refreshProgressDisplay(); }
function debugAuthState() { console.log('=== AUTH DEBUG ===', { authToken: localStorage.getItem('authToken'), currentUser: localStorage.getItem('currentUser'), currentUserVar: currentUser }); }

// Make generateAdvancedPlan globally accessible (Original)
window.generateAdvancedPlan = generateAdvancedPlan;