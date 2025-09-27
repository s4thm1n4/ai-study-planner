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
    
    const loginRequired = document.getElementById('loginRequired');
    const mainContent = document.getElementById('mainContent');
    const userDisplay = document.getElementById('userDisplay');
    
    console.log('Elements found:', { 
        loginRequired: !!loginRequired, 
        mainContent: !!mainContent, 
        userDisplay: !!userDisplay 
    });
    
    if (loginRequired) {
        loginRequired.style.display = 'none';
        console.log('Hidden login required');
    }
    
    if (mainContent) {
        mainContent.style.display = 'block';
        console.log('Shown main content');
    }
    
    if (userDisplay && currentUser) {
        const displayName = currentUser.first_name && currentUser.last_name 
            ? `${currentUser.first_name} ${currentUser.last_name}`
            : currentUser.username || 'User';
        
        userDisplay.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>${displayName}</span>
        `;
        console.log('Updated user display:', displayName);
    }
    
    console.log('Loading subjects...');
    loadSubjects();
    
    // Set default tab
    setTimeout(() => {
        const activeTab = document.querySelector('.tab.active');
        const activeContent = document.querySelector('.tab-content.active');
        console.log('Tab state:', { activeTab: !!activeTab, activeContent: !!activeContent });
        
        if (!activeTab) {
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
    
    try {
        const response = await fetch(API_BASE_URL + url, requestOptions);
        
        if (response.status === 401) {
            console.error('Authentication failed, logging out');
            logout();
            throw new Error('Authentication failed. Please log in again.');
        }
        
        return response;
    } catch (error) {
        // Handle network errors more gracefully
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
            console.error('Backend server connection failed:', error);
            throw new Error('Cannot connect to the backend server. Please make sure the server is running on http://127.0.0.1:8000');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network connection failed:', error);
            throw new Error('Network connection failed. Please check your internet connection and ensure the backend server is running.');
        } else {
            // Re-throw other errors as-is
            throw error;
        }
    }
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
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

// Connection status indicator
function showConnectionStatus(isConnected, message = '') {
    // Remove existing status if any
    const existingStatus = document.querySelector('.connection-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    if (!isConnected) {
        const statusBar = document.createElement('div');
        statusBar.className = 'connection-status';
        statusBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 0.75rem 1rem;
            text-align: center;
            z-index: 9999;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        `;
        statusBar.innerHTML = `
            <span>⚠️ Backend Server Disconnected</span>
            ${message ? `<br><small style="opacity: 0.9;">${message}</small>` : ''}
        `;
        document.body.insertBefore(statusBar, document.body.firstChild);
        
        // Adjust main content margin to account for status bar
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.marginTop = '60px';
        }
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
            }
            
            // Update Resources datalist for suggestions
            const resourceSubjectList = document.getElementById('resourceSubjectList');
            if (resourceSubjectList) {
                resourceSubjectList.innerHTML = '';
                subjects.forEach(subject => {
                    resourceSubjectList.innerHTML += `<option value="${subject}">`;
                });
                console.log('Resource subject dropdown updated');
            }
            
        } else {
            console.error('Failed to load subjects, status:', response.status);
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
        // Show connection status if it's a network error
        if (error.message.includes('backend server') || error.message.includes('Network connection')) {
            showConnectionStatus(false, 'Please start the backend server to use all features');
        }
    }
}

// Error display helper with enhanced messages
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        const isBackendError = message.includes('backend server') || message.includes('Backend server');
        
        element.innerHTML = `
            <div class="results">
                <div class="results-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                    <h3>${isBackendError ? '🔌 Server Connection Issue' : '❌ Error'}</h3>
                </div>
                <div class="results-content" style="text-align: center; padding: 3rem;">
                    ${isBackendError ? `
                        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">🔌</div>
                        <p style="color: #ef4444; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">${message}</p>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                            <h4 style="color: #dc2626; margin-bottom: 1rem;">📋 How to Start the Backend Server:</h4>
                            <ol style="text-align: left; color: #374151; line-height: 1.8;">
                                <li>Open a new terminal/command prompt</li>
                                <li>Navigate to your project directory: <code>cd C:\\\\AI-Study-Planner\\\\ai-study-planner</code></li>
                                <li>Activate virtual environment: <code>.\\\\venv\\\\Scripts\\\\activate</code></li>
                                <li>Install dependencies: <code>pip install fastapi uvicorn python-multipart</code></li>
                                <li>Start server: <code>uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload</code></li>
                            </ol>
                        </div>
                        <p style="color: #6b7280;">Once the server is running, refresh this page and try again.</p>
                    ` : `
                        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">❌</div>
                        <p style="color: #ef4444; font-size: 1.125rem; margin-bottom: 1rem;">${message}</p>
                    `}
                </div>
            </div>
        `;
    } else {
        console.error('Error element not found:', elementId, 'Message:', message);
    }
}

// Placeholder functions (to prevent errors)
function toggleCustomDuration() { console.log('toggleCustomDuration called'); }
function generateAdvancedPlan() { showError('advanced-results', 'Backend server is not running. Please start the server and try again.'); }
function findResources() { showError('resources-results', 'Backend server is not running. Please start the server and try again.'); }
function getMotivation() { showError('motivation-results', 'Backend server is not running. Please start the server and try again.'); }