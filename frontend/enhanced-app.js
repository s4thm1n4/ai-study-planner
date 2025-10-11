// Enhanced JavaScript for Multi-Agent Study Planner with JWT Authentication

const API_BASE_URL = 'http://127.0.0.1:8000';
let currentUser = null;
let authToken = null;

// Initialize authentication on page load - SINGLE EVENT LISTENER
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing enhanced study planner...');
    initializeAuth();
    loadUserAssessment();
});

// Load user assessment HTML into the container
async function loadUserAssessment() {
    try {
        const response = await fetch('user-assessment.html');
        const html = await response.text();
        document.getElementById('user-assessment-container').innerHTML = html;
        
        // Initialize user assessment after loading
        if (window.userAssessment && typeof window.userAssessment.initialize === 'function') {
            window.userAssessment.initialize();
        }
    } catch (error) {
        console.error('Error loading user assessment:', error);
        // Fallback: Hide the container if loading fails
        document.getElementById('user-assessment-container').style.display = 'none';
    }
}

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
    // Ensure assessment data is saved (especially step 4)
    if (window.userAssessment && typeof window.userAssessment.saveCurrentStep === 'function') {
        window.userAssessment.saveCurrentStep();
    }
    
    // Get user assessment data
    let userAssessmentData = {};
    if (window.userAssessment && typeof window.userAssessment.getData === 'function') {
        userAssessmentData = window.userAssessment.getData();
    } else {
        showError('advanced-results', 'Please complete the user assessment first!');
        return;
    }
    
    // Extract data from assessment
    const subject = userAssessmentData.subjectOfInterest;
    const dailyHours = parseInt(userAssessmentData.dailyStudyHours || '2');
    const totalDays = parseInt(userAssessmentData.studyDuration || '7');
    const knowledgeLevel = userAssessmentData.knowledgeLevel || 'beginner';
    const learningStyle = userAssessmentData.learningStyle || 'mixed';
    const selectedMood = userAssessmentData.currentMood || 'neutral';
    
    if (!subject) {
        showError('advanced-results', 'Please specify a subject you want to learn in the assessment!');
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
        
        console.log('Generating advanced plan for:', { subject, dailyHours, totalDays, knowledgeLevel, learningStyle, selectedMood, userAssessmentData });
        
        const response = await makeAuthenticatedRequest('/api/generate-advanced-plan', {
            method: 'POST',
            body: JSON.stringify({
                subject: subject,
                available_hours_per_day: dailyHours,
                total_days: totalDays,
                knowledge_level: knowledgeLevel,
                user_mood: selectedMood,
                learning_style: learningStyle,
                
                // Include user assessment data
                user_profile: {
                    education_level: userAssessmentData.educationLevel,
                    grade: userAssessmentData.grade,
                    study_purpose: userAssessmentData.studyPurpose,
                    exam_details: userAssessmentData.examDetails,
                    previous_experience: userAssessmentData.previousExperience,
                    struggling_areas: userAssessmentData.strugglingAreas,
                    specific_goals: userAssessmentData.specificGoals,
                    expected_outcome: userAssessmentData.expectedOutcome,
                    learning_challenges: userAssessmentData.learningChallenges,
                    preferred_difficulty: userAssessmentData.preferredDifficulty
                }
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
                        <div class="plan-stat-label">Subject${plan.nlp_feedback ? ' <span style="font-size: 0.8em; color: #666;">(' + plan.nlp_feedback + ')</span>' : ''}</div>
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
    
    // Update progress tracker with new plan
    updateProgressWithNewPlan(plan);
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
        
        displayResourceResults(data.resources || [], data.search_feedback);
        
    } catch (error) {
        console.error('Error finding resources:', error);
        showError('resources-results', `Failed to find resources: ${error.message}`);
    } finally {
        if (loadingDiv) loadingDiv.classList.remove('show');
        if (generateBtn) generateBtn.disabled = false;
    }
}

function displayResourceResults(resources, searchFeedback) {
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
                ${searchFeedback ? `<p style="font-size: 0.9em; color: #666; margin-top: 0.5rem; font-style: italic;">${searchFeedback}</p>` : ''}
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

// Mood Selection Functionality
function initializeMoodSelector() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const selectedMoodInput = document.getElementById('selectedMood');
    
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Update hidden input value
            const mood = this.getAttribute('data-mood');
            selectedMoodInput.value = mood;
            
            console.log('Mood selected:', mood);
            
            // Add celebratory animation
            const emoji = this.querySelector('.mood-emoji');
            emoji.style.animation = 'none';
            setTimeout(() => {
                emoji.style.animation = 'celebrate 0.8s ease-out';
            }, 10);
        });
    });
}

// Initialize mood selector when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the content to load
    setTimeout(initializeMoodSelector, 500);
    setTimeout(initializeProgressTracker, 600);
});

// ============================================
// PROGRESS TRACKER SYSTEM
// ============================================

let progressData = {
    currentPlan: null,
    dailyProgress: {},
    streak: 0,
    achievements: [],
    startDate: null
};

function initializeProgressTracker() {
    console.log('Initializing Progress Tracker...');
    
    // Load saved progress data
    loadProgressData();
    
    // Update displays
    updateStreakDisplay();
    updateAchievements();
    
    // Set up tab switching listener
    setupProgressTabListener();
}

function setupProgressTabListener() {
    const progressTabButton = document.querySelector('[onclick="switchTab(\'progress\')"]');
    if (progressTabButton) {
        progressTabButton.addEventListener('click', function() {
            setTimeout(() => {
                refreshProgressDisplay();
            }, 100);
        });
    }
}

function loadProgressData() {
    const saved = localStorage.getItem('studyProgressData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            progressData = { ...progressData, ...parsed };
        } catch (e) {
            console.error('Error loading progress data:', e);
        }
    }
}

function saveProgressData() {
    try {
        localStorage.setItem('studyProgressData', JSON.stringify(progressData));
    } catch (e) {
        console.error('Error saving progress data:', e);
    }
}

function updateCurrentPlan(studyPlan) {
    if (!studyPlan) return;
    
    progressData.currentPlan = {
        subject: studyPlan.subject,
        dailyHours: studyPlan.daily_hours,
        totalHours: studyPlan.total_hours,
        difficulty: studyPlan.difficulty,
        startDate: new Date().toISOString().split('T')[0]
    };
    
    // Initialize daily progress if starting new plan
    if (!progressData.startDate) {
        progressData.startDate = progressData.currentPlan.startDate;
        progressData.dailyProgress = {};
    }
    
    saveProgressData();
    refreshProgressDisplay();
    
    console.log('Updated current plan:', progressData.currentPlan);
}

function refreshProgressDisplay() {
    updateCurrentPlanInfo();
    updateOverallProgress();
    generateDailyGrid();
    updateStreakDisplay();
    updateAchievements();
}

function updateCurrentPlanInfo() {
    const currentPlanInfo = document.getElementById('currentPlanInfo');
    const overallProgressContainer = document.getElementById('overallProgressContainer');
    const dailyTrackingSection = document.getElementById('dailyTrackingSection');
    
    if (!currentPlanInfo) return;
    
    if (progressData.currentPlan) {
        currentPlanInfo.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h4 style="margin: 0; color: #1f2937;">${progressData.currentPlan.subject}</h4>
                    <p style="margin: 0.25rem 0 0 0; color: #6b7280;">
                        ${progressData.currentPlan.dailyHours}h/day • ${progressData.currentPlan.totalHours}h total • ${progressData.currentPlan.difficulty}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #10b981;">${calculateCompletionPercentage()}%</div>
                    <div style="font-size: 0.8rem; color: #6b7280;">Complete</div>
                </div>
            </div>
        `;
        
        if (overallProgressContainer) overallProgressContainer.style.display = 'block';
        if (dailyTrackingSection) dailyTrackingSection.style.display = 'block';
    } else {
        currentPlanInfo.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                <p style="color: #6b7280; margin: 0;">Create a study plan in the Advanced Planner tab to start tracking your progress!</p>
            </div>
        `;
        
        if (overallProgressContainer) overallProgressContainer.style.display = 'none';
        if (dailyTrackingSection) dailyTrackingSection.style.display = 'none';
    }
}

function updateOverallProgress() {
    const percentage = calculateCompletionPercentage();
    const progressBar = document.getElementById('overallProgressBar');
    const progressPercentage = document.getElementById('overallPercentage');
    const progressSpark = document.getElementById('overallSpark');
    
    if (progressBar) {
        // Animate progress bar
        progressBar.style.width = '0%';
        progressBar.classList.add('animating');
        
        setTimeout(() => {
            progressBar.style.width = percentage + '%';
        }, 100);
        
        setTimeout(() => {
            progressBar.classList.remove('animating');
        }, 900);
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = percentage + '%';
    }
}

function generateDailyGrid() {
    const dailyGrid = document.getElementById('dailyGrid');
    if (!dailyGrid || !progressData.currentPlan) return;
    
    const startDate = new Date(progressData.startDate);
    const totalDays = Math.ceil(progressData.currentPlan.totalHours / progressData.currentPlan.dailyHours);
    const today = new Date();
    
    let gridHTML = '';
    
    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayNum = i + 1;
        
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isCompleted = progressData.dailyProgress[dateStr] === true;
        const isPast = currentDate < today && !isToday;
        
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        gridHTML += `
            <div class="day-box ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                 onclick="toggleDayCompletion('${dateStr}')" 
                 title="${dayName}, ${currentDate.toLocaleDateString()}">
                <div class="day-number">Day ${dayNum}</div>
                <div class="day-label">${dayName}</div>
                ${isCompleted ? '<div class="completion-indicator">✅</div>' : ''}
            </div>
        `;
    }
    
    dailyGrid.innerHTML = gridHTML;
}

function toggleDayCompletion(dateStr) {
    const wasCompleted = progressData.dailyProgress[dateStr];
    progressData.dailyProgress[dateStr] = !wasCompleted;
    
    saveProgressData();
    
    // Update displays
    generateDailyGrid();
    updateOverallProgress();
    updateStreakDisplay();
    
    // Check for achievements and celebrations
    if (!wasCompleted) {
        checkAchievements();
        
        // Celebrate if day was just completed
        setTimeout(() => {
            const percentage = calculateCompletionPercentage();
            if (percentage === 100) {
                showCelebration('🎉 Plan Complete!', 'Congratulations! You finished your study plan!');
            } else if (percentage > 0 && percentage % 25 === 0) {
                showCelebration('🚀 Milestone Reached!', `${percentage}% complete! Keep going!`);
            }
        }, 500);
    }
    
    updateAchievements();
}

function calculateCompletionPercentage() {
    if (!progressData.currentPlan) return 0;
    
    const totalDays = Math.ceil(progressData.currentPlan.totalHours / progressData.currentPlan.dailyHours);
    const completedDays = Object.values(progressData.dailyProgress).filter(Boolean).length;
    
    return Math.round((completedDays / totalDays) * 100);
}

function calculateStreak() {
    if (!progressData.startDate) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Count backward from today
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (progressData.dailyProgress[dateStr] === true) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

function updateStreakDisplay() {
    const streak = calculateStreak();
    progressData.streak = streak;
    
    const streakNumber = document.getElementById('streakNumber');
    const streakMessage = document.getElementById('streakMessage');
    
    if (streakNumber) {
        streakNumber.textContent = streak;
    }
    
    if (streakMessage) {
        if (streak === 0) {
            streakMessage.textContent = 'Start your journey!';
        } else if (streak === 1) {
            streakMessage.textContent = 'Great start! Keep it up!';
        } else if (streak < 7) {
            streakMessage.textContent = `${streak} days strong! 🔥`;
        } else if (streak < 30) {
            streakMessage.textContent = `Amazing ${streak}-day streak! 🌟`;
        } else {
            streakMessage.textContent = `Legendary ${streak}-day streak! 👑`;
        }
    }
    
    saveProgressData();
}

function checkAchievements() {
    const newAchievements = [];
    const completedDays = Object.values(progressData.dailyProgress).filter(Boolean).length;
    const streak = calculateStreak();
    
    // First Day achievement
    if (completedDays >= 1 && !progressData.achievements.includes('first-day')) {
        newAchievements.push('first-day');
    }
    
    // Hot Streak achievement  
    if (streak >= 3 && !progressData.achievements.includes('three-streak')) {
        newAchievements.push('three-streak');
    }
    
    // Week Warrior achievement
    if (completedDays >= 7 && !progressData.achievements.includes('week-warrior')) {
        newAchievements.push('week-warrior');
    }
    
    // Perfect Week achievement
    if (calculateCompletionPercentage() === 100 && !progressData.achievements.includes('perfect-week')) {
        newAchievements.push('perfect-week');
    }
    
    // Add new achievements
    newAchievements.forEach(achievement => {
        if (!progressData.achievements.includes(achievement)) {
            progressData.achievements.push(achievement);
            showAchievementUnlocked(achievement);
        }
    });
    
    saveProgressData();
}

function updateAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    const achievements = achievementsGrid.querySelectorAll('.achievement');
    achievements.forEach(achievement => {
        const achievementId = achievement.getAttribute('data-achievement');
        if (progressData.achievements.includes(achievementId)) {
            achievement.classList.remove('locked');
            achievement.classList.add('unlocked');
        }
    });
}

function showAchievementUnlocked(achievementId) {
    // Find achievement element
    const achievement = document.querySelector(`[data-achievement="${achievementId}"]`);
    if (achievement) {
        achievement.classList.remove('locked');
        achievement.classList.add('unlocked');
        
        // Animate unlock
        achievement.style.transform = 'scale(0.8)';
        setTimeout(() => {
            achievement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                achievement.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }
    
    // Show celebration
    const achievementNames = {
        'first-day': 'First Day Complete!',
        'three-streak': 'Hot Streak Unlocked!',
        'week-warrior': 'Week Warrior!',
        'perfect-week': 'Perfect Week!'
    };
    
    setTimeout(() => {
        showCelebration('🏆 Achievement Unlocked!', achievementNames[achievementId] || 'New achievement!');
    }, 300);
}

function showCelebration(title, subtitle) {
    const overlay = document.getElementById('celebrationOverlay');
    const message = document.getElementById('celebrationMessage');
    const confetti = document.getElementById('confetti');
    
    if (!overlay || !message) return;
    
    // Update message
    message.querySelector('.celebration-text').textContent = title;
    message.querySelector('.celebration-subtext').textContent = subtitle;
    
    // Create confetti
    createConfetti(confetti);
    
    // Show celebration
    overlay.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 3000);
    
    // Click to close
    overlay.onclick = () => {
        overlay.classList.remove('show');
    };
}

function createConfetti(container) {
    container.innerHTML = '';
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 50; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.position = 'absolute';
        confettiPiece.style.width = Math.random() * 10 + 5 + 'px';
        confettiPiece.style.height = confettiPiece.style.width;
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.top = -20 + 'px';
        confettiPiece.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)] === 'circle' ? '50%' : '0';
        confettiPiece.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        confettiPiece.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(confettiPiece);
    }
    
    // Add confetti animation CSS if not exists
    if (!document.getElementById('confettiStyles')) {
        const style = document.createElement('style');
        style.id = 'confettiStyles';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function markTodayComplete() {
    const today = new Date().toISOString().split('T')[0];
    progressData.dailyProgress[today] = true;
    
    saveProgressData();
    refreshProgressDisplay();
    checkAchievements();
    
    showCelebration('✅ Day Complete!', 'Great job on today\'s study session!');
}

function resetProgress() {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
        progressData = {
            currentPlan: null,
            dailyProgress: {},
            streak: 0,
            achievements: [],
            startDate: null
        };
        
        saveProgressData();
        refreshProgressDisplay();
        
        alert('Progress has been reset!');
    }
}

// Hook into study plan generation to update progress
function updateProgressWithNewPlan(studyPlan) {
    updateCurrentPlan(studyPlan);
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