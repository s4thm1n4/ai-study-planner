// Enhanced JavaScript for Multi-Agent Study Planner with JWT Authentication

const API_BASE_URL = 'http://127.0.0.1:8000';
let currentUser = null;
let authToken = null;

// ===== ETHICAL CONTENT VALIDATION =====
function validateEthicalContent(subject) {
    console.log('[ETHICS] Validating subject:', subject);
    
    const subjectLower = subject.toLowerCase();
    
    // Comprehensive blocked keywords list
    const blockedKeywords = {
        'Violence & Harm': [
            'suicide', 'suicidal', 'kill', 'killing', 'murder', 'murderer', 'assassin', 
            'assassination', 'bomb', 'bombing', 'explosive', 'weapon', 'weaponize', 
            'gun', 'firearm', 'rifle', 'pistol', 'knife attack', 'stabbing', 'stab',
            'terrorist', 'terrorism', 'terror attack', 'mass shooting', 'school shooting',
            'serial killer', 'homicide', 'genocide', 'war crime', 'torture', 'execution',
            'death penalty', 'vigilante', 'lynch', 'poison', 'poisoning', 'strangle'
        ],
        'Illegal Hacking & Cybercrime': [
            'black hat', 'blackhat', 'crack software', 'cracking', 'piracy', 'pirate software',
            'warez', 'keygen', 'crack password', 'password cracker', 'brute force attack',
            'hack bank', 'hack account', 'hack website', 'hack system', 'hack network',
            'break into system', 'break into account', 'unauthorized access', 'bypass security',
            'exploit kit', 'zero-day exploit', 'malware creation', 'virus creation',
            'ransomware', 'create virus', 'ddos attack', 'dos attack', 'botnet',
            'phishing kit', 'credential stuffing', 'session hijacking', 'sql injection',
            'xss attack', 'man in the middle', 'keylogger', 'trojan', 'backdoor',
            'rootkit', 'spyware', 'adware creation'
        ],
        'Illegal Activities & Fraud': [
            'steal', 'stealing', 'theft', 'rob', 'robbery', 'burglary', 'fraud',
            'scam', 'scamming', 'ponzi scheme', 'pyramid scheme', 'identity theft',
            'credit card fraud', 'fake id', 'counterfeit', 'forgery', 'money laundering',
            'tax evasion', 'insider trading', 'embezzlement', 'bribery', 'corruption',
            'smuggling', 'trafficking', 'illegal trade'
        ],
        'Drugs & Illegal Substances': [
            'meth', 'methamphetamine', 'meth production', 'meth lab', 'cocaine',
            'cocaine production', 'heroin', 'heroin production', 'fentanyl', 'fentanyl synthesis',
            'drug dealing', 'drug manufacturing', 'drug production', 'drug trafficking',
            'illegal drugs', 'narcotics production', 'lsd production', 'mdma production',
            'ecstasy production', 'crack cocaine', 'opium', 'cannabis cultivation illegal'
        ],
        'Self-Harm & Dangerous Behavior': [
            'self-harm', 'self harm', 'cut myself', 'cutting myself', 'hurt myself',
            'hurting myself', 'self-mutilation', 'self injury', 'eating disorder',
            'anorexia tips', 'bulimia tips', 'purging', 'pro ana', 'pro mia',
            'suicide method', 'how to die', 'overdose intentionally', 'jump off',
            'hang myself', 'end my life'
        ],
        'Sexual Abuse & Exploitation': [
            'child porn', 'child pornography', 'cp', 'sexual assault', 'rape',
            'child abuse', 'child exploitation', 'child molest', 'pedophilia',
            'human trafficking', 'sex trafficking', 'sexual predator', 'grooming children',
            'revenge porn', 'non-consensual', 'sexual harassment'
        ],
        'Hate Speech & Discrimination': [
            'white supremacy', 'white supremacist', 'white power', 'nazi', 'neo-nazi',
            'fascism', 'hate group', 'ethnic cleansing', 'racial violence', 'hate crime',
            'lynching', 'ku klux klan', 'kkk', 'genocide', 'holocaust denial',
            'racial supremacy', 'racist ideology', 'sexist ideology'
        ],
        'Dangerous Materials & Weapons': [
            'make bomb', 'build bomb', 'create explosive', 'pipe bomb', 'fertilizer bomb',
            'pressure cooker bomb', 'molotov cocktail', 'chemical weapon', 'biological weapon',
            'bioweapon', 'nerve agent', 'sarin gas', 'anthrax', 'ricin', 'cyanide',
            'radioactive material', 'dirty bomb', 'nuclear weapon', 'uranium enrichment'
        ]
    };

    // Check against all blocked keywords
    for (const [category, keywords] of Object.entries(blockedKeywords)) {
        for (const keyword of keywords) {
            if (subjectLower.includes(keyword)) {
                console.log(`[ETHICS] ❌ BLOCKED - Category: "${category}", Keyword: "${keyword}"`);
                
                // Show detailed error message
                showEthicalViolationError(category, keyword, 'resources');
                return false;
            }
        }
    }
    
    console.log('[ETHICS] ✅ Content validation passed');
    return true;
}

function validateEthicalContentForMotivation(input) {
    console.log('[ETHICS] Validating motivation input:', input);
    
    const inputLower = input.toLowerCase();
    
    // Same blocked keywords as resources, but with motivation context
    const blockedKeywords = {
        'Violence & Harm': [
            'suicide', 'suicidal', 'kill', 'killing', 'murder', 'murderer', 'assassin', 
            'assassination', 'bomb', 'bombing', 'explosive', 'weapon', 'weaponize', 
            'gun', 'firearm', 'rifle', 'pistol', 'knife attack', 'stabbing', 'stab',
            'terrorist', 'terrorism', 'terror attack', 'mass shooting', 'school shooting',
            'serial killer', 'homicide', 'genocide', 'war crime', 'torture', 'execution',
            'death penalty', 'vigilante', 'lynch', 'poison', 'poisoning', 'strangle'
        ],
        'Illegal Hacking & Cybercrime': [
            'black hat', 'blackhat', 'crack software', 'cracking', 'piracy', 'pirate software',
            'warez', 'keygen', 'crack password', 'password cracker', 'brute force attack',
            'hack bank', 'hack account', 'hack website', 'hack system', 'hack network',
            'break into system', 'break into account', 'unauthorized access', 'bypass security',
            'exploit kit', 'zero-day exploit', 'malware creation', 'virus creation',
            'ransomware', 'create virus', 'ddos attack', 'dos attack', 'botnet',
            'phishing kit', 'credential stuffing', 'session hijacking', 'sql injection',
            'xss attack', 'man in the middle', 'keylogger', 'trojan', 'backdoor',
            'rootkit', 'spyware', 'adware creation'
        ],
        'Illegal Activities & Fraud': [
            'steal', 'stealing', 'theft', 'rob', 'robbery', 'burglary', 'fraud',
            'scam', 'scamming', 'ponzi scheme', 'pyramid scheme', 'identity theft',
            'credit card fraud', 'fake id', 'counterfeit', 'forgery', 'money laundering',
            'tax evasion', 'insider trading', 'embezzlement', 'bribery', 'corruption',
            'smuggling', 'trafficking', 'illegal trade'
        ],
        'Drugs & Illegal Substances': [
            'meth', 'methamphetamine', 'meth production', 'meth lab', 'cocaine',
            'cocaine production', 'heroin', 'heroin production', 'fentanyl', 'fentanyl synthesis',
            'drug dealing', 'drug manufacturing', 'drug production', 'drug trafficking',
            'illegal drugs', 'narcotics production', 'lsd production', 'mdma production',
            'ecstasy production', 'crack cocaine', 'opium', 'cannabis cultivation illegal'
        ],
        'Self-Harm & Dangerous Behavior': [
            'self-harm', 'self harm', 'cut myself', 'cutting myself', 'hurt myself',
            'hurting myself', 'self-mutilation', 'self injury', 'eating disorder',
            'anorexia tips', 'bulimia tips', 'purging', 'pro ana', 'pro mia',
            'suicide method', 'how to die', 'overdose intentionally', 'jump off',
            'hang myself', 'end my life'
        ],
        'Sexual Abuse & Exploitation': [
            'child porn', 'child pornography', 'cp', 'sexual assault', 'rape',
            'child abuse', 'child exploitation', 'child molest', 'pedophilia',
            'human trafficking', 'sex trafficking', 'sexual predator', 'grooming children',
            'revenge porn', 'non-consensual', 'sexual harassment'
        ],
        'Hate Speech & Discrimination': [
            'white supremacy', 'white supremacist', 'white power', 'nazi', 'neo-nazi',
            'fascism', 'hate group', 'ethnic cleansing', 'racial violence', 'hate crime',
            'lynching', 'ku klux klan', 'kkk', 'genocide', 'holocaust denial',
            'racial supremacy', 'racist ideology', 'sexist ideology'
        ],
        'Dangerous Materials & Weapons': [
            'make bomb', 'build bomb', 'create explosive', 'pipe bomb', 'fertilizer bomb',
            'pressure cooker bomb', 'molotov cocktail', 'chemical weapon', 'biological weapon',
            'bioweapon', 'nerve agent', 'sarin gas', 'anthrax', 'ricin', 'cyanide',
            'radioactive material', 'dirty bomb', 'nuclear weapon', 'uranium enrichment'
        ]
    };

    // Check against all blocked keywords
    for (const [category, keywords] of Object.entries(blockedKeywords)) {
        for (const keyword of keywords) {
            if (inputLower.includes(keyword)) {
                console.log(`[ETHICS] ❌ BLOCKED - Category: "${category}", Keyword: "${keyword}"`);
                
                // Show detailed error message with motivation context
                showEthicalViolationError(category, keyword, 'motivation');
                return false;
            }
        }
    }
    
    console.log('[ETHICS] ✅ Motivation content validation passed');
    return true;
}

function showEthicalViolationError(category, keyword, context = 'resources') {
    // Create error modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 1rem; max-width: 600px; width: 100%; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 4rem; margin-bottom: 0.5rem;">⚠️</div>
                <h2 style="color: #dc2626; margin: 0 0 0.5rem 0; font-size: 1.75rem;">Content Policy Violation</h2>
                <p style="color: #64748b; margin: 0; font-size: 1rem;">Detected: <strong>${category}</strong></p>
            </div>
            
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 1.25rem; margin: 1.5rem 0; border-radius: 0.5rem;">
                <p style="margin: 0 0 1rem 0; color: #991b1b; font-weight: 600;">
                    🚫 Our AI ${context === 'motivation' ? 'Motivation Coach' : 'Resource Finder'} is designed exclusively for educational purposes.
                </p>
                <p style="margin: 0; color: #991b1b; line-height: 1.6;">
                    We cannot ${context === 'motivation' ? 'provide motivation or guidance' : 'find or recommend resources'} for topics involving violence, illegal activities, 
                    self-harm, discrimination, or any content that could cause harm.
                </p>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.25rem; margin: 1.5rem 0; border-radius: 0.5rem;">
                <p style="margin: 0 0 0.75rem 0; color: #166534; font-weight: 600;">
                    ✅ Try ${context === 'motivation' ? 'sharing positive study experiences' : 'searching for these educational topics'} instead:
                </p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                    ${context === 'motivation' ? `
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">"Struggling with calculus"</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">"Need study motivation"</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">"Feeling overwhelmed"</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">"Excited about learning"</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">"Need confidence boost"</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">"Preparing for exams"</span>
                    ` : `
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">Data Science</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">Programming</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">Mathematics</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">Science</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">Languages</span>
                        <span style="background: white; color: #166534; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #bbf7d0;">Design</span>
                    `}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove(); document.getElementById('${context === 'motivation' ? 'currentMood' : 'resourceSubject'}').focus();" 
                        style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                               color: white; 
                               border: none; 
                               padding: 1rem 2.5rem; 
                               border-radius: 0.75rem; 
                               font-size: 1.1rem; 
                               font-weight: 700; 
                               cursor: pointer;
                               box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                               transition: all 0.3s ease;">
                    ${context === 'motivation' ? 'Share Different Feelings' : 'Search for Different Resources'}
                </button>
            </div>
        </div>
    `;
    
    // Add hover effect to button
    const button = modal.querySelector('button');
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
    });
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            const targetInput = document.getElementById(context === 'motivation' ? 'currentMood' : 'resourceSubject');
            if (targetInput) targetInput.focus();
        }
    });
}

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
    
    // Hide all loading divs initially
    const loadingDivs = document.querySelectorAll('.loading');
    loadingDivs.forEach(div => {
        div.classList.remove('show');
        div.style.display = 'none';
    });
    
    // Clear any existing results
    const resultsDivs = document.querySelectorAll('[id$="-results"]');
    resultsDivs.forEach(div => {
        div.innerHTML = '';
    });
    
    // Setup onboarding listeners (ensure they work after auth)
    setTimeout(() => {
        if (typeof setupOnboardingListeners === 'function') {
            setupOnboardingListeners();
        }
    }, 200);
    
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
        // Clear any existing results first
        if (resultsDiv) resultsDiv.innerHTML = '';
        
        // Show enhanced loading state
        showEnhancedLoading(loadingDiv, resultsDiv, 'Our AI agents are creating your personalized study plan...');
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
        if (loadingDiv) {
            loadingDiv.classList.remove('show');
            loadingDiv.style.display = 'none';
        }
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
    
    // Generate roadmap nodes
    let scheduleHtml = '';
    if (plan.schedule && Array.isArray(plan.schedule)) {
        // All emojis for rotating through days
        const topicEmojis = ['📖', '⚡', '🛠️', '�', '🏗️', '⚙️', '🎓', '�', '💡', '🔥', '📱', '�', '🧠', '🔍', '📈'];
        
        scheduleHtml = plan.schedule.map((day, index) => {
            // Extract the actual topic from API response
            let mainTopic = '';
            let topicsHtml = '';
            
            // Use actual topics from API if available
            if (day.topics && day.topics.length > 0) {
                // Get the first topic as the main topic for the day title
                mainTopic = day.topics[0].topic || `Day ${day.day} Topics`;
                
                // Log to verify we're using API data
                console.log(`[ROADMAP] Day ${day.day}: Using API topic "${mainTopic}"`);
                
                // Generate topics HTML from API data
                topicsHtml = day.topics.map(topic => 
                    `<span class="topic-tag">• ${topic.topic} (${topic.hours}h)</span>`
                ).join('');
            } else {
                // Fallback if no topics in API response
                mainTopic = `${plan.subject} - Day ${day.day}`;
                topicsHtml = `<span class="topic-tag">• Study Session (${day.hours}h)</span>`;
                console.warn(`[ROADMAP] Day ${day.day}: No API topics, using fallback`);
            }
            
            // Get emoji for this day - rotate through emojis
            const emoji = topicEmojis[index % topicEmojis.length];
            const status = index === 0 ? 'in-progress' : 'not-started';
            const progress = index === 0 ? 25 : 0;
            
            // Simple fallback resources for data attribute (will be fetched from API when clicked)
            const fallbackResources = [
                { title: `${mainTopic} - Course`, type: 'Course', duration: `${day.hours}h`, icon: '📘' },
                { title: `${mainTopic} - Tutorial`, type: 'Video', duration: '45m', icon: '🎥' },
                { title: `${mainTopic} - Guide`, type: 'Article', duration: '20m', icon: '📄' }
            ];
            
            const markerIcon = status === 'completed' ? '✓' : emoji;
            const difficulty = index < 3 ? 'easy' : index < 5 ? 'medium' : 'hard';
            const difficultyIcon = difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴';
            const resourcesJson = JSON.stringify(fallbackResources);
            
            return `
                <div class="roadmap-node ${status}" data-day="${day.day}" data-emoji="${emoji}" data-topic="${mainTopic}" data-resources='${resourcesJson}'>
                    <div class="roadmap-marker">
                        ${markerIcon}
                    </div>
                    <div class="roadmap-card">
                        <div class="timeline-header">
                            <div class="timeline-day-info">
                                <h4>Day ${day.day}: ${mainTopic}</h4>
                                <span class="timeline-date">${day.date}</span>
                            </div>
                            <div class="timeline-status">
                                <input type="checkbox" 
                                       class="timeline-checkbox" 
                                       id="checkbox-day-${day.day}"
                                       data-day="${day.day}"
                                       onchange="toggleRoadmapDayCompletion(${day.day})"
                                       title="Mark as complete">
                                <span class="status-badge ${status}" id="status-day-${day.day}">
                                    ${status === 'completed' ? '✓ Done' : status === 'in-progress' ? '⏳ In Progress' : '⭕ Pending'}
                                </span>
                            </div>
                        </div>

                        <div class="timeline-topics">
                            <h5>📚 Today's Focus</h5>
                            <div class="topic-list">
                                ${topicsHtml}
                            </div>
                        </div>

                        ${day.goals && day.goals.length > 0 ? `
                            <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.75rem;">
                                <strong style="color: #6b7280; font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">🎯 Goals:</strong>
                                <p style="margin: 0; color: #374151; font-size: 0.875rem;">${day.goals.join(' • ')}</p>
                            </div>
                        ` : ''}

                        <div class="timeline-footer">
                            <div class="timeline-duration">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                </svg>
                                ${day.hours} hours
                            </div>
                            <span class="difficulty-indicator difficulty-${difficulty}">
                                ${difficultyIcon} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </span>
                            <div class="timeline-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span class="progress-text">${progress}%</span>
                            </div>
                        </div>
                        <div class="resource-view-prompt">
                            <button class="view-resources-btn">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 0.25rem;">
                                    <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                                </svg>
                                View Resources
                            </button>
                        </div>
                    </div>
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
                    <div class="schedule-roadmap-container">
                        <h4 style="text-align: center; color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">
                            🗺️ Your Learning Roadmap
                        </h4>
                        <p style="text-align: center; color: #6b7280; margin-bottom: 3rem; font-size: 1rem;">
                            Click on any day to explore recommended resources and learning materials
                        </p>
                        <div class="schedule-roadmap">
                            <div class="roadmap-path"></div>
                            ${scheduleHtml}
                        </div>
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
    
    // Attach event listeners to roadmap nodes after rendering
    setTimeout(() => {
        attachRoadmapEventListeners();
    }, 100);
    
    // Update progress tracker with new plan
    updateProgressWithNewPlan(plan);
}

// Simple function to toggle roadmap day completion
function toggleRoadmapDayCompletion(dayNumber) {
    console.log(`[COMPLETION] ========================================`);
    console.log(`[COMPLETION] Toggle completion for Day ${dayNumber}`);
    
    const checkbox = document.getElementById(`checkbox-day-${dayNumber}`);
    const statusBadge = document.getElementById(`status-day-${dayNumber}`);
    const roadmapNode = document.querySelector(`[data-day="${dayNumber}"]`);
    
    console.log(`[COMPLETION] Checkbox: ${checkbox ? 'Found' : 'NOT FOUND'}`);
    console.log(`[COMPLETION] Status Badge: ${statusBadge ? 'Found' : 'NOT FOUND'}`);
    console.log(`[COMPLETION] Roadmap Node: ${roadmapNode ? 'Found' : 'NOT FOUND'}`);
    
    if (!checkbox || !statusBadge || !roadmapNode) {
        console.error('[COMPLETION] ❌ Missing required elements!');
        return;
    }
    
    const isChecked = checkbox.checked;
    console.log(`[COMPLETION] Checkbox is: ${isChecked ? 'CHECKED' : 'UNCHECKED'}`);
    
    if (isChecked) {
        // Mark as completed
        console.log('[COMPLETION] ✅ Marking as COMPLETED');
        roadmapNode.classList.remove('not-started', 'in-progress');
        roadmapNode.classList.add('completed');
        
        statusBadge.className = 'status-badge completed';
        statusBadge.innerHTML = '✓ Done';
        
        // Update marker
        const marker = roadmapNode.querySelector('.roadmap-marker');
        if (marker) {
            marker.innerHTML = '✓';
            marker.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            marker.style.color = 'white';
        }
        
        // Show celebration
        showMiniCelebration(dayNumber);
    } else {
        // Mark as not started
        console.log('[COMPLETION] ⭕ Marking as NOT STARTED');
        roadmapNode.classList.remove('completed', 'in-progress');
        roadmapNode.classList.add('not-started');
        
        statusBadge.className = 'status-badge not-started';
        statusBadge.innerHTML = '⭕ Pending';
        
        // Restore original emoji
        const emoji = roadmapNode.getAttribute('data-emoji');
        const marker = roadmapNode.querySelector('.roadmap-marker');
        if (marker && emoji) {
            marker.innerHTML = emoji;
            marker.style.background = '';
            marker.style.color = '';
        }
    }
    
    console.log(`[COMPLETION] ========================================`);
}

// Mini celebration effect
function showMiniCelebration(dayNumber) {
    const roadmapNode = document.querySelector(`[data-day="${dayNumber}"]`);
    if (!roadmapNode) return;
    
    // Add celebration class
    roadmapNode.style.animation = 'celebrationBounce 0.6s ease-out';
    
    // Create confetti burst
    const confettiColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const card = roadmapNode.querySelector('.roadmap-card');
    
    if (card) {
        for (let i = 0; i < 10; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.left = '50%';
            confetti.style.top = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            
            const angle = (Math.PI * 2 * i) / 10;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            confetti.style.animation = `confettiBurst 0.8s ease-out forwards`;
            confetti.style.setProperty('--vx', vx + 'px');
            confetti.style.setProperty('--vy', vy + 'px');
            
            card.style.position = 'relative';
            card.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 800);
        }
    }
    
    // Reset animation
    setTimeout(() => {
        roadmapNode.style.animation = '';
    }, 600);
}

// Attach click listeners to roadmap nodes
function attachRoadmapEventListeners() {
    console.log('[ROADMAP DEBUG] ========================================');
    console.log('[ROADMAP DEBUG] attachRoadmapEventListeners() called');
    
    const roadmapNodes = document.querySelectorAll('.roadmap-node');
    console.log(`[ROADMAP DEBUG] Found ${roadmapNodes.length} roadmap nodes`);
    
    roadmapNodes.forEach((node, index) => {
        const dayNumber = parseInt(node.getAttribute('data-day'));
        const topicName = node.getAttribute('data-topic');
        const resourcesJson = node.getAttribute('data-resources');
        
        console.log(`[ROADMAP DEBUG] Node ${index + 1}: Day ${dayNumber}, Topic: ${topicName}`);
        
        // Find the "View Resources" button within this node
        const viewResourcesBtn = node.querySelector('.view-resources-btn');
        console.log(`[ROADMAP DEBUG] View Resources button found: ${!!viewResourcesBtn}`);
        
        if (viewResourcesBtn) {
            // Remove any existing click listeners (prevent duplicates)
            const newBtn = viewResourcesBtn.cloneNode(true);
            viewResourcesBtn.parentNode.replaceChild(newBtn, viewResourcesBtn);
            
            console.log(`[ROADMAP DEBUG] ✅ Added click listener to Day ${dayNumber} button`);
            
            // Add click listener to the button only
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                
                console.log('╔════════════════════════════════════════════════════╗');
                console.log(`║ 🔍 VIEW RESOURCES CLICKED - Day ${dayNumber}`);
                console.log(`║ Topic: ${topicName}`);
                console.log('╚════════════════════════════════════════════════════╝');
                
                // Parse fallback resources for API failure case
                let fallbackResources = [];
                try {
                    if (resourcesJson) {
                        fallbackResources = JSON.parse(resourcesJson);
                        console.log(`[ROADMAP] Parsed ${fallbackResources.length} fallback resources`);
                    }
                } catch (error) {
                    console.error('[ROADMAP ERROR] Error parsing resources JSON:', error);
                }
                
                // Call the popup function (which will fetch from API)
                console.log('[ROADMAP] Calling openResourcePopup()...');
                openResourcePopup(dayNumber, topicName, fallbackResources);
            });
            
            // Make button look clickable
            newBtn.style.cursor = 'pointer';
            
            // Visual feedback on hover
            newBtn.addEventListener('mouseenter', () => {
                console.log(`[ROADMAP] Mouse hovering over Day ${dayNumber} button`);
            });
        } else {
            console.warn(`[ROADMAP WARN] ❌ No view-resources-btn found for Day ${dayNumber}`);
        }
    });
    
    console.log('[ROADMAP DEBUG] ========================================');
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
    
    // ETHICAL CONTENT VALIDATION - Check before searching for resources
    if (!validateEthicalContent(subject)) {
        console.log('[ETHICS] ❌ Resource search blocked due to harmful content');
        return; // Stop here, don't proceed with search
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
        if (loadingDiv) {
            loadingDiv.classList.remove('show');
            loadingDiv.style.display = 'none';
        }
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
    if (loadingDiv) {
        loadingDiv.classList.add('show');
        const loadingText = loadingDiv.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    if (resultsDiv) {
        resultsDiv.innerHTML = '';
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
    
    // ETHICAL CONTENT VALIDATION - Check motivation input for harmful content
    if (!validateEthicalContentForMotivation(mood)) {
        console.log('[ETHICS] ❌ Motivation request blocked due to harmful content');
        return; // Stop here, don't proceed with motivation request
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
        if (loadingDiv) {
            loadingDiv.classList.remove('show');
            loadingDiv.style.display = 'none';
        }
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

// ===== ROADMAP RESOURCE SIDE PANEL FUNCTIONS =====

async function openResourcePopup(dayNumber, topicName, fallbackResources) {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║           OPENING RESOURCE SIDE PANEL              ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║ Day Number: ${dayNumber}`);
    console.log(`║ Topic: ${topicName}`);
    console.log(`║ Fallback Resources: ${fallbackResources ? fallbackResources.length : 0}`);
    console.log('╚════════════════════════════════════════════════════╝');
    
    // Close any existing panel
    closeResourcePopup();
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'resource-panel-backdrop';
    backdrop.id = 'resource-panel-backdrop';
    document.body.appendChild(backdrop);
    
    // Create side panel
    const sidePanel = document.createElement('div');
    sidePanel.className = 'resource-side-panel';
    sidePanel.id = 'resource-side-panel';
    
    // Show loading state initially
    sidePanel.innerHTML = `
        <div class="side-panel-header">
            <div>
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">📚</span>
                    Day ${dayNumber} Resources
                </h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.8; font-size: 0.9rem;">${topicName}</p>
            </div>
            <button class="side-panel-close" id="close-panel-btn" title="Close (ESC)">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
            </button>
        </div>
        <div class="side-panel-body" style="text-align: center; padding: 3rem 1rem;">
            <div class="loading-spinner" style="margin: 0 auto 1rem;">
                <div class="spinner"></div>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">🔍 Searching IR system for best resources...</p>
        </div>
    `;
    
    document.body.appendChild(sidePanel);
    
    console.log('[SIDE PANEL] Panel created and added to DOM');
    
    // Add event listeners for closing
    backdrop.addEventListener('click', () => {
        console.log('[BACKDROP] Backdrop clicked, closing...');
        closeResourcePopup();
    });
    
    const closeBtn = document.getElementById('close-panel-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('[CLOSE BTN] Close button clicked, closing...');
            closeResourcePopup();
        });
    }
    
    // Trigger slide-in animation
    setTimeout(() => {
        backdrop.classList.add('active');
        sidePanel.classList.add('open');
    }, 10);
    
    // Add ESC key listener to close panel
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            console.log('[ESC] Escape key pressed, closing...');
            closeResourcePopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Fetch resources from IR system API
    try {
        console.log(`[API CALL] Fetching resources for: ${topicName}`);
        console.log(`[API CALL] Making authenticated request to /api/find-resources`);
        
        const response = await makeAuthenticatedRequest('/api/find-resources', {
            method: 'POST',
            body: JSON.stringify({
                subject: topicName,
                resource_type: null,
                limit: 5
            })
        });
        
        console.log(`[API RESPONSE] Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const resources = data.resources || [];
        
        console.log(`[API SUCCESS] ✅ Received ${resources.length} resources from API`);
        console.log('[API SUCCESS] Resources:', resources);
        console.log('[API DEBUG] Checking for fallback resources...');
        
        // Check if these are fallback resources
        const isFallback = resources.length > 0 && resources[0].id && resources[0].id.startsWith('fallback_');
        console.log(`[API DEBUG] Is fallback? ${isFallback}`);
        
        if (isFallback) {
            console.warn('[API WARNING] ⚠️ API returned FALLBACK resources, not database matches!');
            console.warn('[API WARNING] This means the IR system did not find matches in the database.');
        }
        
        // Update side panel with resources
        displayResourcesInSidePanel(sidePanel, dayNumber, topicName, resources, data.search_feedback, isFallback);
        
    } catch (error) {
        console.error('[API ERROR] ❌ Error fetching resources:', error);
        console.error('[API ERROR] Stack:', error.stack);
        
        // Fallback to static resources if API fails
        console.log(`[FALLBACK] Using ${fallbackResources.length} static fallback resources`);
        displayResourcesInSidePanel(sidePanel, dayNumber, topicName, fallbackResources, 'Showing suggested resources (API unavailable)', true);
    }
}

function displayResourcesInSidePanel(sidePanel, dayNumber, topicName, resources, feedback, isFallback) {
    // Generate resource items HTML from API data
    let resourceItemsHtml = '';
    
    if (resources && resources.length > 0) {
        resourceItemsHtml = resources.map((resource, index) => {
            const relevanceScore = resource.similarity_score ? Math.round(resource.similarity_score * 100) : 0;
            const resourceType = resource.resource_type || 'general';
            const difficulty = resource.difficulty || 'N/A';
            const url = resource.url || `https://www.google.com/search?q=${encodeURIComponent(topicName)}`;
            
            // Get icon based on resource type
            const iconMap = {
                'online_course': '📘',
                'video': '🎥',
                'video_series': '🎬',
                'article': '📄',
                'book': '📚',
                'tutorial': '🎓',
                'interactive': '🖱️',
                'interactive_course': '💻',
                'documentation': '📋',
                'podcast': '🎧',
                'general': '📖'
            };
            const icon = iconMap[resourceType] || '📖';
            
            // Difficulty colors
            const difficultyColors = {
                'beginner': '#10b981',
                'intermediate': '#f59e0b',
                'advanced': '#ef4444',
                'expert': '#8b5cf6'
            };
            const difficultyColor = difficultyColors[difficulty.toLowerCase()] || '#6b7280';
            
            return `
                <div class="side-panel-resource-item" style="animation-delay: ${index * 0.05}s">
                    <div style="display: flex; align-items: start; gap: 1rem;">
                        <div class="resource-icon-large">${icon}</div>
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #1f2937;">
                                ${resource.title || 'Educational Resource'}
                            </h4>
                            <p style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #6b7280; line-height: 1.5;">
                                ${resource.description || 'Quality learning resource for ' + topicName}
                            </p>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;">
                                <span class="resource-badge" style="background: ${difficultyColor}22; color: ${difficultyColor}; border: 1px solid ${difficultyColor}44;">
                                    ${resourceType.replace('_', ' ')}
                                </span>
                                <span class="resource-badge" style="background: ${difficultyColor}22; color: ${difficultyColor}; border: 1px solid ${difficultyColor}44;">
                                    ${difficulty}
                                </span>
                                ${relevanceScore > 0 ? `
                                    <span style="color: #10b981; font-size: 0.8125rem; font-weight: 600;">
                                        ✓ ${relevanceScore}% match
                                    </span>
                                ` : ''}
                            </div>
                            <a href="${url}" target="_blank" class="resource-link-btn">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 0.375rem;">
                                    <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                    <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                </svg>
                                Open Resource
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // No resources found
        resourceItemsHtml = `
            <div style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">🔍</div>
                <p style="color: #6b7280; font-size: 1rem; margin-bottom: 0.5rem;">No specific resources found for this topic.</p>
                <p style="color: #9ca3af; font-size: 0.875rem;">Try searching on educational platforms directly.</p>
            </div>
        `;
    }
    
    // Warning banner is removed - we don't need to show this to users
    const fallbackWarning = '';
    
    // Update side panel content
    sidePanel.innerHTML = `
        <div class="side-panel-header">
            <div>
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">📚</span>
                    Day ${dayNumber} Resources
                </h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.8; font-size: 0.9rem;">${topicName}</p>
                ${feedback && !isFallback ? `<p style="margin: 0.5rem 0 0 0; opacity: 0.7; font-size: 0.8125rem; font-style: italic; color: #10b981;">💡 ${feedback}</p>` : ''}
                <p style="margin: 0.5rem 0 0 0; opacity: 0.6; font-size: 0.75rem;">Tip: Click outside or press ESC to close</p>
            </div>
            <button class="side-panel-close" id="close-panel-btn-final" title="Close">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
            </button>
        </div>
        <div class="side-panel-body">
            ${fallbackWarning}
            <p style="color: #6b7280; margin-bottom: 1.25rem; font-size: 0.9rem; padding: 0 0.25rem;">
                ${isFallback ? '🌐 Recommended educational platforms' : '🎯 Top-ranked resources from our IR system'}
            </p>
            <div class="side-panel-resources-list">
                ${resourceItemsHtml}
            </div>
            <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 0.8125rem; margin: 0; line-height: 1.5;">
                    ${isFallback ? '💡 Tip: These are search links to popular learning platforms' : '💡 Tip: Resources ranked by relevance using TF-IDF and cosine similarity'}
                </p>
            </div>
        </div>
    `;
    
    // Re-attach close button event listener after innerHTML update
    setTimeout(() => {
        const closeBtnFinal = document.getElementById('close-panel-btn-final');
        if (closeBtnFinal) {
            closeBtnFinal.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('[CLOSE BTN FINAL] Close button clicked, closing...');
                closeResourcePopup();
            });
        }
    }, 50);
}

function closeResourcePopup() {
    console.log('[CLOSE] Closing resource popup...');
    
    // Close side panel
    const sidePanel = document.getElementById('resource-side-panel');
    const backdrop = document.getElementById('resource-panel-backdrop');
    
    if (sidePanel) {
        console.log('[CLOSE] Found side panel, removing...');
        sidePanel.classList.remove('open');
        setTimeout(() => {
            sidePanel.remove();
        }, 300);
    }
    
    if (backdrop) {
        console.log('[CLOSE] Found backdrop, removing...');
        backdrop.classList.remove('active');
        setTimeout(() => {
            backdrop.remove();
        }, 300);
    }
    
    // Legacy: also close old popup overlay if exists
    const overlay = document.querySelector('.resource-popup-overlay');
    if (overlay) {
        console.log('[CLOSE] Found legacy overlay, removing...');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Animate roadmap path fill
function animateRoadmapPath(completedUpToDay) {
    const roadmapPath = document.querySelector('.roadmap-path');
    if (!roadmapPath) return;
    
    const allNodes = document.querySelectorAll('.roadmap-node');
    const totalNodes = allNodes.length;
    
    if (totalNodes === 0) return;
    
    // Calculate percentage: each node represents a segment
    const percentComplete = (completedUpToDay / totalNodes) * 100;
    
    // Create animated gradient that fills up
    roadmapPath.style.background = `linear-gradient(
        to bottom,
        #10b981 0%,
        #10b981 ${percentComplete}%,
        rgba(59, 130, 246, 0.3) ${percentComplete}%,
        rgba(236, 72, 153, 0.3) 100%
    )`;
    
    // Add glow effect at the current position
    roadmapPath.style.filter = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))';
    roadmapPath.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
}

// Move in-progress status to next day
function moveToNextDay(currentDay) {
    const allNodes = document.querySelectorAll('.roadmap-node');
    const nextDayNode = document.querySelector(`[data-day="${currentDay + 1}"]`);
    
    if (nextDayNode && nextDayNode.classList.contains('not-started')) {
        // Remove in-progress from all nodes first
        allNodes.forEach(node => {
            if (node.classList.contains('in-progress')) {
                node.classList.remove('in-progress');
                node.classList.add('not-started');
                const badge = node.querySelector('.status-badge');
                if (badge) {
                    badge.className = 'status-badge not-started';
                    badge.textContent = '⭕ Pending';
                }
            }
        });
        
        // Set next day as in-progress
        nextDayNode.classList.remove('not-started');
        nextDayNode.classList.add('in-progress');
        const nextBadge = nextDayNode.querySelector('.status-badge');
        if (nextBadge) {
            nextBadge.className = 'status-badge in-progress';
            nextBadge.textContent = '⏳ In Progress';
        }
        
        // Update progress for next day
        const nextProgress = nextDayNode.querySelector('.progress-fill');
        const nextProgressText = nextDayNode.querySelector('.progress-text');
        if (nextProgress && nextProgressText) {
            nextProgress.style.width = '25%';
            nextProgressText.textContent = '25%';
        }
        
        // Scroll to next day smoothly
        nextDayNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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