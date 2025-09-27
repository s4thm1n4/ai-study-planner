// Enhanced JavaScript for Multi-Agent Study Planner with JWT Authentication

const API_BASE_URL = 'http://127.0.0.1:8000';
let currentUser = null;
let authToken = null;

// Initialize authentication on page load - SINGLE EVENT LISTENER
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced study planner...');
    initializeAuth();
});

// Authentication functions
function initializeAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    console.log('Checking authentication...', { hasToken: !!token, hasUserData: !!userData });
    
    if (token && userData) {
        try {
            authToken = token;
            currentUser = JSON.parse(userData);
            console.log('User authenticated:', currentUser);
            showAuthenticatedContent();
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            redirectToLogin();
        }
    } else {
        console.log('No authentication found, redirecting to login');
        redirectToLogin();
    }
}

function redirectToLogin() {
    const loginRequired = document.getElementById('loginRequired');
    const mainContent = document.getElementById('mainContent');
    
    console.log('Redirecting to login...', { loginRequired: !!loginRequired, mainContent: !!mainContent });
    
    if (loginRequired) {
        loginRequired.style.display = 'block';
    }
    if (mainContent) {
        mainContent.style.display = 'none';
    }
}

function showAuthenticatedContent() {
    console.log('showAuthenticatedContent called');
    debugAuthState();
    
    const loginRequired = document.getElementById('loginRequired');
    const mainContent = document.getElementById('mainContent');
    const userDisplay = document.getElementById('userDisplay');
    
    console.log('Elements found:', { 
        loginRequired: !!loginRequired, 
        mainContent: !!mainContent, 
        userDisplay: !!userDisplay 
    });
    
    // Hide login screen and show main content
    if (loginRequired) {
        loginRequired.style.display = 'none';
        console.log('Hidden login required');
    }
    if (mainContent) {
        mainContent.style.display = 'block';
        console.log('Shown main content');
    }
    
    // Update user display
    if (userDisplay && currentUser) {
        const userName = currentUser.first_name && currentUser.last_name 
            ? `${currentUser.first_name} ${currentUser.last_name}`
            : currentUser.username || 'User';
        
        userDisplay.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>${userName}</span>
        `;
        console.log('Updated user display:', userName);
    }
    
    // Load subjects for dropdowns
    console.log('Loading subjects...');
    loadSubjects();
    
    // Ensure default tab is active
    setTimeout(() => {
        const activeTab = document.querySelector('.tab.active');
        const activeContent = document.querySelector('.tab-content.active');
        
        console.log('Tab state:', { activeTab: !!activeTab, activeContent: !!activeContent });
        
        if (!activeTab || !activeContent) {
            console.log('Setting default tab to advanced...');
            switchTab('advanced');
        }
    }, 100);
}

function logout() {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Helper function to make authenticated API calls
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found');
    }
    
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    const requestOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    const response = await fetch(API_BASE_URL + url, requestOptions);
    
    if (response.status === 401) {
        console.error('Authentication failed, logging out');
        logout();
        throw new Error('Authentication failed. Please log in again.');
    }
    
    return response;
}

// Tab functionality
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`button[onclick="switchTab('${tabName}')"]`);
    const selectedContent = document.getElementById(`${tabName}-tab`);
    
    console.log('Tab elements:', { selectedTab: !!selectedTab, selectedContent: !!selectedContent });
    
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        console.log('Tab switched successfully to:', tabName);
    } else {
        console.error('Tab switching failed for:', tabName);
    }
}

// Load subjects for suggestions
async function loadSubjects() {
    try {
        console.log('Loading subjects from API...');
        const response = await makeAuthenticatedRequest('/api/subjects');
        
        if (response.ok) {
            const subjects = await response.json();
            console.log('Subjects loaded successfully:', subjects.length, subjects);
            
            // Update Advanced Planner datalist for suggestions
            const advancedSubjectList = document.getElementById('advancedSubjectList');
            if (advancedSubjectList) {
                advancedSubjectList.innerHTML = '';
                subjects.forEach(subject => {
                    advancedSubjectList.innerHTML += `<option value="${subject}">`;
                });
                console.log('Advanced subject suggestions updated');
            } else {
                console.error('Advanced subject suggestions list not found');
            }
            
            // Update Resources datalist for suggestions
            const resourceSubjectList = document.getElementById('resourceSubjectList');
            if (resourceSubjectList) {
                resourceSubjectList.innerHTML = '';
                subjects.forEach(subject => {
                    resourceSubjectList.innerHTML += `<option value="${subject}">`;
                });
                console.log('Resource subject dropdown updated');
            } else {
                console.error('Resource subject dropdown not found');
            }
            
        } else {
            console.error('Failed to load subjects, status:', response.status);
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
        // Don't show error to user for subjects loading - it's not critical
    }
}

// Advanced Plan Generation
async function generateAdvancedPlan() {
    const subject = document.getElementById('advancedSubject')?.value?.trim();
    const dailyHours = parseInt(document.getElementById('dailyHours')?.value || '2');
    const totalDays = parseInt(document.getElementById('totalDays')?.value || '7');
    const knowledgeLevel = document.getElementById('knowledgeLevel')?.value || 'beginner';
    
    if (!subject) {
        showError('advanced-results', 'Please enter a subject you want to learn!');
        return;
    }
    
    if (subject.length < 2) {
        showError('advanced-results', 'Please enter a more specific subject (at least 2 characters).');
        return;
    }
    
    const loadingDiv = document.getElementById('advanced-loading');
    const resultsDiv = document.getElementById('advanced-results');
    const generateBtn = document.querySelector('#advanced-tab .generate-btn');
    
    try {
        // Show loading
        if (loadingDiv) loadingDiv.classList.add('show');
        if (resultsDiv) resultsDiv.innerHTML = '';
        if (generateBtn) generateBtn.disabled = true;
        
        console.log('Generating advanced plan for:', { subject, dailyHours, totalDays, knowledgeLevel });
        
        const response = await makeAuthenticatedRequest('/api/generate-advanced-plan', {
            method: 'POST',
            body: JSON.stringify({
                subject: subject,
                available_hours_per_day: dailyHours,
                total_days: totalDays,
                knowledge_level: knowledgeLevel
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Advanced plan generated:', data);
        
        displayAdvancedResults(data);
        
    } catch (error) {
        console.error('Error generating advanced plan:', error);
        showError('advanced-results', `Failed to generate advanced plan: ${error.message}`);
    } finally {
        if (loadingDiv) loadingDiv.classList.remove('show');
        if (generateBtn) generateBtn.disabled = false;
    }
}

function displayAdvancedResults(data) {
    const resultsDiv = document.getElementById('advanced-results');
    if (!resultsDiv) {
        console.error('Advanced results div not found');
        return;
    }
    
    if (!data.study_plan) {
        console.error('No study plan in response data');
        showError('advanced-results', 'No study plan received from server');
        return;
    }
    
    const plan = data.study_plan;
    
    let scheduleHtml = '';
    if (plan.schedule && Array.isArray(plan.schedule)) {
        scheduleHtml = plan.schedule.map(day => {
            const topicsText = day.topics && day.topics.length > 0 
                ? day.topics.map(topic => `${topic.topic} (${topic.hours}h)`).join(', ')
                : 'Study session';
            
            return `
                <div class="schedule-item">
                    <h4>📅 Day ${day.day} - ${day.date}</h4>
                    <p><strong>Topics:</strong> ${topicsText}</p>
                    <p><strong>Total Hours:</strong> ${day.hours}h</p>
                    ${day.goals && day.goals.length > 0 ? `<p><strong>Goals:</strong> ${day.goals.join(', ')}</p>` : ''}
                </div>
            `;
        }).join('');
    }
    
    let resourcesHtml = '';
    if (plan.resources && Array.isArray(plan.resources)) {
        resourcesHtml = plan.resources.map(resource => `
            <div class="resource-item">
                <h4>📚 ${resource.title || resource.topic || 'Resource'}</h4>
                <p><strong>Type:</strong> ${resource.resource_type || 'General'}</p>
                <p><strong>Difficulty:</strong> ${resource.difficulty || 'N/A'}</p>
                ${resource.description ? `<p>${resource.description}</p>` : ''}
                ${resource.url ? `<p><a href="${resource.url}" target="_blank" rel="noopener noreferrer">View Resource →</a></p>` : ''}
            </div>
        `).join('');
    }
    
    resultsDiv.innerHTML = `
        <div class="results">
            <h3>🎯 Your Personalized Study Plan</h3>
            <div style="margin-bottom: 2rem;">
                <p><strong>Subject:</strong> ${plan.subject}</p>
                <p><strong>Total Hours:</strong> ${plan.total_hours}h</p>
                <p><strong>Daily Hours:</strong> ${plan.daily_hours}h</p>
                <p><strong>Difficulty:</strong> ${plan.difficulty}</p>
            </div>
            
            ${scheduleHtml ? `
                <div style="margin-bottom: 2rem;">
                    <h4>📅 Study Schedule</h4>
                    ${scheduleHtml}
                </div>
            ` : ''}
            
            ${resourcesHtml ? `
                <div>
                    <h4>📚 Recommended Resources</h4>
                    ${resourcesHtml}
                </div>
            ` : ''}
            
            ${plan.motivation ? `
                <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(99, 102, 241, 0.1); border-radius: 0.75rem;">
                    <h4>💪 Motivational Message</h4>
                    <p><em>"${plan.motivation.quote.quote}"</em> - ${plan.motivation.quote.author}</p>
                    <p><strong>Tip:</strong> ${plan.motivation.tip.tip}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Find Resources
async function findResources() {
    const subject = document.getElementById('resourceSubject')?.value?.trim();
    const resourceType = document.getElementById('resourceType')?.value;
    
    if (!subject) {
        showError('resources-results', 'Please enter a subject you want to find resources for!');
        return;
    }
    
    if (subject.length < 2) {
        showError('resources-results', 'Please enter a more specific subject (at least 2 characters).');
        return;
    }
    
    const loadingDiv = document.getElementById('resources-loading');
    const resultsDiv = document.getElementById('resources-results');
    const generateBtn = document.querySelector('#resources-tab .generate-btn');
    
    try {
        // Show loading
        if (loadingDiv) loadingDiv.classList.add('show');
        if (resultsDiv) resultsDiv.innerHTML = '';
        if (generateBtn) generateBtn.disabled = true;
        
        console.log('Finding resources for:', { subject, resourceType });
        
        const response = await makeAuthenticatedRequest('/api/find-resources', {
            method: 'POST',
            body: JSON.stringify({
                subject: subject,
                resource_type: resourceType || null,
                limit: 5
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Resources found:', data);
        
        displayResourceResults(data.resources || []);
        
    } catch (error) {
        console.error('Error finding resources:', error);
        showError('resources-results', `Failed to find resources: ${error.message}`);
    } finally {
        if (loadingDiv) loadingDiv.classList.remove('show');
        if (generateBtn) generateBtn.disabled = false;
    }
}

function displayResourceResults(resources) {
    const resultsDiv = document.getElementById('resources-results');
    if (!resultsDiv) return;
    
    if (!resources || resources.length === 0) {
        resultsDiv.innerHTML = `
            <div class="results">
                <h3>📚 No Resources Found</h3>
                <p>We couldn't find any resources for your search. Try a different subject or resource type.</p>
            </div>
        `;
        return;
    }
    
    const resourcesHtml = resources.map(resource => `
        <div class="resource-item">
            <h4>📚 ${resource.title || 'Resource'}</h4>
            <p><strong>Type:</strong> ${resource.resource_type || 'General'}</p>
            <p><strong>Difficulty:</strong> ${resource.difficulty || 'N/A'}</p>
            ${resource.description ? `<p>${resource.description}</p>` : ''}
            ${resource.url ? `<p><a href="${resource.url}" target="_blank" rel="noopener noreferrer">View Resource →</a></p>` : ''}
            ${resource.similarity_score ? `<p><small>Relevance: ${Math.round(resource.similarity_score * 100)}%</small></p>` : ''}
        </div>
    `).join('');
    
    resultsDiv.innerHTML = `
        <div class="results">
            <h3>📚 Found ${resources.length} Resources</h3>
            ${resourcesHtml}
        </div>
    `;
}

// Get Motivation
async function getMotivation() {
    const mood = document.getElementById('currentMood')?.value?.trim();
    
    if (!mood) {
        showError('motivation-results', 'Please share how you\'re feeling about your studies!');
        return;
    }
    
    const loadingDiv = document.getElementById('motivation-loading');
    const resultsDiv = document.getElementById('motivation-results');
    const generateBtn = document.querySelector('#motivation-tab .generate-btn');
    
    try {
        // Show loading
        if (loadingDiv) loadingDiv.classList.add('show');
        if (resultsDiv) resultsDiv.innerHTML = '';
        if (generateBtn) generateBtn.disabled = true;
        
        console.log('Getting motivation for mood:', mood);
        
        const response = await makeAuthenticatedRequest('/api/get-motivation', {
            method: 'POST',
            body: JSON.stringify({
                mood_text: mood
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Motivation received:', data);
        
        displayMotivationResults(data);
        
    } catch (error) {
        console.error('Error getting motivation:', error);
        showError('motivation-results', `Failed to get motivation: ${error.message}`);
    } finally {
        if (loadingDiv) loadingDiv.classList.remove('show');
        if (generateBtn) generateBtn.disabled = false;
    }
}

function displayMotivationResults(data) {
    const resultsDiv = document.getElementById('motivation-results');
    if (!resultsDiv) return;
    
    const sentiment = data.sentiment || {};
    const motivation = data.motivation || {};
    
    resultsDiv.innerHTML = `
        <div class="results">
            <h3>💪 Personalized Motivation</h3>
            
            ${sentiment.mood ? `
                <div style="margin-bottom: 2rem; padding: 1rem; background: ${getSentimentColor(sentiment.mood)}; border-radius: 0.5rem;">
                    <h4>🎭 Your Current Mood: ${sentiment.mood.charAt(0).toUpperCase() + sentiment.mood.slice(1)}</h4>
                </div>
            ` : ''}
            
            ${motivation.quote ? `
                <div class="quote-section">
                    <div class="quote-text">"${motivation.quote.quote}"</div>
                    <div class="quote-author">— ${motivation.quote.author}</div>
                </div>
            ` : ''}
            
            ${motivation.tip ? `
                <div class="tip-section">
                    <h4>💡 Study Tip</h4>
                    <p>${motivation.tip.tip}</p>
                </div>
            ` : ''}
            
            ${motivation.encouragement ? `
                <div style="margin-top: 1.5rem; padding: 1.5rem; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 0.75rem; border-left: 4px solid #0ea5e9;">
                    <h4>🌟 Personal Message</h4>
                    <p>${motivation.encouragement}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function getSentimentColor(mood) {
    switch (mood) {
        case 'positive': return 'rgba(16, 185, 129, 0.2)';
        case 'negative': return 'rgba(239, 68, 68, 0.2)';
        default: return 'rgba(99, 102, 241, 0.2)';
    }
}

// Error display helper
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-message">
                <h4>❌ Error</h4>
                <p>${message}</p>
            </div>
        `;
    } else {
        console.error('Error element not found:', elementId, 'Message:', message);
    }
}

// Add this function at the top of enhanced-app.js for debugging
function debugAuthState() {
    console.log('=== AUTH DEBUG ===');
    console.log('authToken:', localStorage.getItem('authToken'));
    console.log('currentUser:', localStorage.getItem('currentUser'));
    console.log('currentUser var:', currentUser);
    console.log('loginRequired element:', document.getElementById('loginRequired'));
    console.log('mainContent element:', document.getElementById('mainContent'));
    console.log('==================');
}