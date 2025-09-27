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

// Toggle custom duration input
function toggleCustomDuration() {
    const totalDaysSelect = document.getElementById('totalDays');
    const customDaysInput = document.getElementById('customDays');
    
    if (totalDaysSelect.value === 'custom') {
        customDaysInput.style.display = 'block';
        customDaysInput.required = true;
    } else {
        customDaysInput.style.display = 'none';
        customDaysInput.required = false;
        customDaysInput.value = '';
    }
}

// Advanced Plan Generation
async function generateAdvancedPlan() {
    const subject = document.getElementById('advancedSubject')?.value?.trim();
    const dailyHours = parseInt(document.getElementById('dailyHours')?.value || '2');
    
    // Handle custom duration
    let totalDays;
    const totalDaysSelect = document.getElementById('totalDays');
    if (totalDaysSelect.value === 'custom') {
        const customDays = parseInt(document.getElementById('customDays')?.value);
        if (!customDays || customDays < 1) {
            showError('advanced-results', 'Please enter a valid number of days (1-365).');
            return;
        }
        totalDays = customDays;
    } else {
        totalDays = parseInt(totalDaysSelect.value || '7');
    }
    
    const knowledgeLevel = document.getElementById('knowledgeLevel')?.value || 'beginner';
    const learningStyle = document.getElementById('learningStyle')?.value || 'mixed';
    
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
        // Show enhanced loading state
        showEnhancedLoading(loadingDiv, resultsDiv, 'Generating your personalized study plan...');
        if (generateBtn) generateBtn.disabled = true;
        
        console.log('Generating advanced plan for:', { subject, dailyHours, totalDays, knowledgeLevel, learningStyle });
        
        const response = await makeAuthenticatedRequest('/api/generate-advanced-plan', {
            method: 'POST',
            body: JSON.stringify({
                subject: subject,
                available_hours_per_day: dailyHours,
                total_days: totalDays,
                knowledge_level: knowledgeLevel,
                learning_style: learningStyle
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Advanced plan generated:', data);
        
        displayAdvancedResults(data, learningStyle);
        
    } catch (error) {
        console.error('Error generating advanced plan:', error);
        showError('advanced-results', `Failed to generate advanced plan: ${error.message}`);
    } finally {
        if (loadingDiv) loadingDiv.classList.remove('show');
        if (generateBtn) generateBtn.disabled = false;
    }
}

function displayAdvancedResults(data, learningStyle = 'mixed') {
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
    
    // Generate schedule cards
    let scheduleHtml = '';
    if (plan.schedule && Array.isArray(plan.schedule)) {
        scheduleHtml = plan.schedule.map(day => {
            const topicsHtml = day.topics && day.topics.length > 0 
                ? day.topics.map(topic => `<span class="topic-tag">${topic.topic} (${topic.hours}h)</span>`).join('')
                : '<span class="topic-tag">Study session</span>';
            
            return `
                <div class="schedule-item">
                    <div class="schedule-day">
                        <div class="day-number">${day.day}</div>
                        <div class="day-info">
                            <h4>${day.date}</h4>
                            <p class="day-date">Day ${day.day}</p>
                        </div>
                    </div>
                    <div class="schedule-topics">
                        ${topicsHtml}
                    </div>
                    <div class="schedule-hours">
                        <i class="fas fa-clock"></i>
                        <span>${day.hours} hours planned</span>
                    </div>
                    ${day.goals && day.goals.length > 0 ? `
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                            <strong style="color: #6b7280; font-size: 0.875rem;">Goals:</strong>
                            <p style="margin: 0.5rem 0 0 0; color: #374151;">${day.goals.join(' • ')}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    // Generate resource cards
    let resourcesHtml = '';
    if (plan.resources && Array.isArray(plan.resources)) {
        resourcesHtml = plan.resources.map(resource => {
            const relevanceScore = resource.similarity_score ? Math.round(resource.similarity_score * 100) : 0;
            const isLearningStyleOptimized = relevanceScore > 85;
            
            return `
                <div class="resource-item">
                    <div class="resource-header">
                        <h4 class="resource-title">${resource.title || resource.topic || 'Educational Resource'}</h4>
                        ${isLearningStyleOptimized ? '<span class="resource-optimized">🎯 Optimized</span>' : ''}
                    </div>
                    <div class="resource-meta">
                        <span class="resource-badge type">
                            <i class="fas ${getResourceTypeIcon(resource.resource_type)}"></i>
                            ${resource.resource_type || 'General'}
                        </span>
                        <span class="resource-badge difficulty">
                            <i class="fas ${getDifficultyIcon(resource.difficulty)}"></i>
                            ${resource.difficulty || 'N/A'}
                        </span>
                    </div>
                    ${resource.description ? `<p class="resource-description">${resource.description}</p>` : ''}
                    <div class="resource-actions">
                        ${resource.url ? `
                            <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
                                <i class="fas fa-external-link-alt"></i>
                                Access Resource
                            </a>
                        ` : '<div></div>'}
                        ${relevanceScore > 0 ? `
                            <div class="resource-relevance">
                                <i class="fas fa-bullseye"></i>
                                ${relevanceScore}% match
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Calculate total study days
    const totalDays = plan.schedule ? plan.schedule.length : 0;
    const learningStyleDisplay = getLearningStyleDisplay(learningStyle);
    
    resultsDiv.innerHTML = `
        <div class="results">
            <div class="results-header">
                <h3>🎯 Your Personalized Study Plan</h3>
            </div>
            <div class="results-content">
                <div class="plan-overview">
                    <div class="plan-stat">
                        <div class="plan-stat-value">${plan.subject}</div>
                        <div class="plan-stat-label">Subject</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${plan.total_hours}h</div>
                        <div class="plan-stat-label">Total Hours</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${plan.daily_hours}h</div>
                        <div class="plan-stat-label">Daily Hours</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${totalDays}</div>
                        <div class="plan-stat-label">Study Days</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${plan.difficulty}</div>
                        <div class="plan-stat-label">Difficulty</div>
                    </div>
                    ${learningStyle && learningStyle !== 'mixed' ? `
                        <div class="plan-stat">
                            <div class="plan-stat-value">🧠</div>
                            <div class="plan-stat-label">${learningStyleDisplay}</div>
                        </div>
                    ` : ''}
                </div>
                
                ${scheduleHtml ? `
                    <div class="section-header">
                        <div class="section-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <h3 class="section-title">Study Schedule</h3>
                    </div>
                    <div class="schedule-grid">
                        ${scheduleHtml}
                    </div>
                ` : ''}
                
                ${resourcesHtml ? `
                    <div class="section-header">
                        <div class="section-icon">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <h3 class="section-title">Recommended Resources</h3>
                    </div>
                    <div class="resources-grid">
                        ${resourcesHtml}
                    </div>
                ` : ''}
                
                ${plan.motivation ? `
                    <div class="motivation-card">
                        <div class="motivation-content">
                            <div class="section-header" style="border-bottom: 2px solid rgba(255,255,255,0.2); color: white;">
                                <div class="section-icon" style="background: rgba(255,255,255,0.2);">
                                    <i class="fas fa-fire"></i>
                                </div>
                                <h3 class="section-title" style="color: white;">Stay Motivated</h3>
                            </div>
                            <div class="motivation-quote">"${plan.motivation.quote.content || plan.motivation.quote.quote || 'Stay motivated on your learning journey!'}"</div>
                            <div class="motivation-author">— ${plan.motivation.quote.author || 'Study Planner AI'}</div>
                            ${plan.motivation.encouragement ? `
                                <div class="motivation-encouragement">
                                    <strong>💪 Encouragement:</strong> ${plan.motivation.encouragement}
                                </div>
                            ` : ''}
                            ${plan.motivation.tip ? `
                                <div class="motivation-tip">
                                    <strong>💡 Pro Tip:</strong> ${plan.motivation.tip.tip || plan.motivation.tip}
                                </div>
                            ` : ''}
                            ${plan.motivation.mood_analysis ? `
                                <div class="mood-insights">
                                    <strong>🧠 Mood Insights:</strong> 
                                    <span class="mood-badge mood-${plan.motivation.mood_analysis.detected_mood}">
                                        ${plan.motivation.mood_analysis.detected_mood}
                                    </span>
                                    <div class="mood-levels">
                                        Energy: ${(plan.motivation.mood_analysis.energy_level * 100).toFixed(0)}% | 
                                        Confidence: ${(plan.motivation.mood_analysis.confidence_level * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
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
        // Show enhanced loading state
        showEnhancedLoading(loadingDiv, resultsDiv, 'Searching for the best resources...');
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
                <div class="results-header">
                    <h3>📚 No Resources Found</h3>
                </div>
                <div class="results-content" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">🔍</div>
                    <p style="color: #6b7280; font-size: 1.125rem; margin-bottom: 1rem;">We couldn't find any resources for your search.</p>
                    <p style="color: #9ca3af;">Try a different subject or resource type.</p>
                </div>
            </div>
        `;
        return;
    }
    
    const resourcesHtml = resources.map(resource => {
        const relevanceScore = resource.similarity_score ? Math.round(resource.similarity_score * 100) : 0;
        const isHighRelevance = relevanceScore > 75;
        
        return `
            <div class="resource-item">
                <div class="resource-header">
                    <h4 class="resource-title">${resource.title || 'Educational Resource'}</h4>
                    ${isHighRelevance ? '<span class="resource-optimized">⭐ Top Match</span>' : ''}
                </div>
                <div class="resource-meta">
                    <span class="resource-badge type">
                        <i class="fas ${getResourceTypeIcon(resource.resource_type)}"></i>
                        ${resource.resource_type || 'General'}
                    </span>
                    <span class="resource-badge difficulty">
                        <i class="fas ${getDifficultyIcon(resource.difficulty)}"></i>
                        ${resource.difficulty || 'N/A'}
                    </span>
                </div>
                ${resource.description ? `<p class="resource-description">${resource.description}</p>` : ''}
                <div class="resource-actions">
                    ${resource.url ? `
                        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
                            <i class="fas fa-external-link-alt"></i>
                            Access Resource
                        </a>
                    ` : '<div></div>'}
                    ${relevanceScore > 0 ? `
                        <div class="resource-relevance">
                            <i class="fas fa-bullseye"></i>
                            ${relevanceScore}% match
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    resultsDiv.innerHTML = `
        <div class="results">
            <div class="results-header">
                <h3>📚 Found ${resources.length} Resource${resources.length !== 1 ? 's' : ''}</h3>
            </div>
            <div class="results-content">
                <div class="resources-grid">
                    ${resourcesHtml}
                </div>
            </div>
        </div>
    `;
}

// Enhanced loading state function
function showEnhancedLoading(loadingDiv, resultsDiv, message = 'Loading...') {
    if (loadingDiv) loadingDiv.classList.add('show');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <div class="results">
                <div class="results-content">
                    <div class="loading-card">
                        <div class="loading-spinner"></div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #1f2937;">${message}</h3>
                        <p style="margin: 0; color: #6b7280;">This may take a few moments...</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Helper functions for UI enhancements
function getResourceTypeIcon(type) {
    const icons = {
        'video': 'fa-play-circle',
        'article': 'fa-newspaper',
        'book': 'fa-book',
        'course': 'fa-graduation-cap',
        'tutorial': 'fa-chalkboard-teacher',
        'documentation': 'fa-file-alt',
        'practice': 'fa-dumbbell',
        'interactive': 'fa-mouse-pointer',
        'podcast': 'fa-podcast',
        'webinar': 'fa-video',
        'general': 'fa-bookmark'
    };
    return icons[type?.toLowerCase()] || icons.general;
}

function getDifficultyIcon(difficulty) {
    const icons = {
        'beginner': 'fa-seedling',
        'intermediate': 'fa-chart-line',
        'advanced': 'fa-mountain',
        'expert': 'fa-crown'
    };
    return icons[difficulty?.toLowerCase()] || 'fa-question-circle';
}

function getLearningStyleDisplay(style) {
    const styles = {
        'visual': 'Visual Learner',
        'auditory': 'Auditory Learner', 
        'kinesthetic': 'Kinesthetic Learner',
        'reading': 'Reading/Writing Learner',
        'mixed': 'Mixed Learning Style'
    };
    return styles[style] || style;
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
        // Show enhanced loading state
        showEnhancedLoading(loadingDiv, resultsDiv, 'Getting your daily motivation boost...');
        if (generateBtn) generateBtn.disabled = true;
        
        console.log('Getting motivation for mood:', mood);
        
        const response = await makeAuthenticatedRequest('/api/enhanced-motivation', {
            method: 'POST',
            body: JSON.stringify({
                user_input: mood
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
    
    console.log('Displaying enhanced motivation results:', data);
    
    // Handle enhanced motivation response structure
    const motivation = data.motivation || data;
    const moodAnalysis = motivation.mood_analysis || {};
    
    resultsDiv.innerHTML = `
        <div class="results">
            <div class="results-header">
                <h3>💪 Your Enhanced Motivation</h3>
            </div>
            <div class="results-content">
                ${moodAnalysis.detected_mood ? `
                    <div class="plan-overview" style="margin-bottom: 2rem;">
                        <div class="plan-stat" style="grid-column: 1 / -1; background: ${getEnhancedMoodColor(moodAnalysis.detected_mood)};">
                            <div class="plan-stat-value">🎭 ${moodAnalysis.detected_mood.charAt(0).toUpperCase() + moodAnalysis.detected_mood.slice(1)}</div>
                            <div class="plan-stat-label" style="color: rgba(255,255,255,0.8);">
                                Detected Mood | Energy: ${(moodAnalysis.energy_level * 100).toFixed(0)}% | Confidence: ${(moodAnalysis.confidence_level * 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${motivation.quote ? `
                    <div class="motivation-card" style="margin-bottom: 2rem;">
                        <div class="motivation-content">
                            <div class="section-header" style="border-bottom: 2px solid rgba(255,255,255,0.2); color: white;">
                                <div class="section-icon" style="background: rgba(255,255,255,0.2);">
                                    <i class="fas fa-quote-left"></i>
                                </div>
                                <h3 class="section-title" style="color: white;">AI-Personalized Quote</h3>
                            </div>
                            <div class="motivation-quote">"${motivation.quote.content || motivation.quote.quote || motivation.quote}"</div>
                            <div class="motivation-author">— ${motivation.quote.author || 'AI Study Coach'}</div>
                        </div>
                    </div>
                ` : ''}
                
                ${motivation.encouragement ? `
                    <div class="resource-item" style="border-left-color: #f59e0b; margin-bottom: 1.5rem;">
                        <div class="resource-header">
                            <h4 class="resource-title">💪 Personalized Encouragement</h4>
                        </div>
                        <p class="resource-description">${motivation.encouragement}</p>
                    </div>
                ` : ''}
                
                ${motivation.tip ? `
                    <div class="resource-item" style="border-left-color: #10b981;">
                        <div class="resource-header">
                            <h4 class="resource-title">💡 Study Tip</h4>
                        </div>
                        <p class="resource-description">${motivation.tip.tip || motivation.tip}</p>
                    </div>
                ` : ''}
                
                ${moodAnalysis.suggestions && moodAnalysis.suggestions.length > 0 ? `
                    <div class="resource-item" style="border-left-color: #8b5cf6; margin-top: 1.5rem;">
                        <div class="resource-header">
                            <h4 class="resource-title">🧠 AI Mood Insights</h4>
                        </div>
                        <ul style="margin: 0; padding-left: 1.5rem;">
                            ${moodAnalysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${data.ethics_validation ? `
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.75rem; border-left: 4px solid #10b981;">
                        <div style="font-size: 0.875rem; color: #065f46;">
                            <strong>🛡️ AI Ethics:</strong> This content has been validated for bias, appropriateness, and cultural sensitivity.
                            ${data.ethics_validation.transparency ? `<br><strong>Confidence:</strong> ${(data.ethics_validation.transparency.confidence * 100).toFixed(0)}%` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
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

function getEnhancedMoodColor(mood) {
    switch (mood?.toLowerCase()) {
        case 'optimistic': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        case 'confident': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        case 'neutral': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        case 'anxious': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        case 'frustrated': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        case 'overwhelmed': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        default: return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
    }
}

function getLearningStyleDisplay(style) {
    switch (style) {
        case 'visual': return 'Visual Learning (Videos, Diagrams)';
        case 'auditory': return 'Auditory Learning (Audio, Lectures)';
        case 'reading': return 'Reading/Writing Learning (Books, Articles)';
        case 'kinesthetic': return 'Hands-on Learning (Interactive)';
        default: return 'Mixed Learning Style';
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