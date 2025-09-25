// Enhanced JavaScript for Multi-Agent Study Planner

const API_BASE_URL = 'http://127.0.0.1:8000';

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Simple Plan Generation (Legacy compatibility)
async function generateSimplePlan() {
    const goal = document.getElementById('simple-goal').value.trim();
    const resultsDiv = document.getElementById('simple-results');
    const loadingDiv = document.getElementById('simple-loading');
    
    if (!goal) {
        resultsDiv.innerHTML = '<div class="error">Please enter a learning goal!</div>';
        return;
    }
    
    // Show loading
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ goal: goal }),
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Check if we have the expected data structure
        if (!data.schedule || !data.first_resource) {
            throw new Error('Invalid response format from server');
        }
        
        // Format the output
        let outputHTML = `
            <div class="success">✅ Study plan generated successfully!</div>
            <h3>📅 Your 3-Day Study Plan:</h3>
            <div class="schedule">
                ${data.schedule.map((topic, index) => `
                    <div class="schedule-item">
                        <strong>Day ${index + 1}:</strong> ${topic}
                    </div>
                `).join('')}
            </div>
            <h3>📚 First Resource:</h3>
            <div class="resource-card">
                <strong>Topic:</strong> ${data.first_resource.topic}<br>
                <strong>Link:</strong> <a href="${data.first_resource.link}" target="_blank">${data.first_resource.link}</a>
            </div>
        `;
        
        resultsDiv.innerHTML = outputHTML;
        
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Advanced Plan Generation
async function generateAdvancedPlan() {
    const subject = document.getElementById('subject').value;
    const knowledgeLevel = document.getElementById('knowledge-level').value;
    const dailyHours = parseInt(document.getElementById('daily-hours').value);
    const totalDays = parseInt(document.getElementById('total-days').value);
    const learningStyle = document.getElementById('learning-style').value;
    
    const resultsDiv = document.getElementById('advanced-results');
    const loadingDiv = document.getElementById('advanced-loading');
    
    if (!subject) {
        resultsDiv.innerHTML = '<div class="error">Please select a subject!</div>';
        return;
    }
    
    // Show loading
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v2/generate-advanced-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject,
                available_hours_per_day: dailyHours,
                total_days: totalDays,
                learning_style: learningStyle,
                knowledge_level: knowledgeLevel
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format the advanced output
        let scheduleHTML = '';
        if (data.schedule && Array.isArray(data.schedule)) {
            scheduleHTML = data.schedule.map(day => `
                <div class="schedule-item">
                    <h4>📅 Day ${day.day} - ${day.date}</h4>
                    <p><strong>Study Time:</strong> ${day.hours} hours</p>
                    <div class="topics">
                        ${day.topics.map(topic => `
                            <div style="margin-left: 20px; padding: 5px 0;">
                                📖 <strong>${topic.topic}</strong> (${topic.hours}h)
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
        
        let resourcesHTML = '';
        if (data.resources && Array.isArray(data.resources)) {
            resourcesHTML = data.resources.map(resource => `
                <div class="resource-card">
                    <h4>${resource.title}</h4>
                    <p><strong>Type:</strong> ${resource.resource_type}</p>
                    <p><strong>Difficulty:</strong> ${resource.difficulty}</p>
                    <p><strong>Rating:</strong> <span class="resource-rating">${'⭐'.repeat(Math.floor(resource.rating || 4))}</span> (${resource.rating || 'N/A'})</p>
                    <p>${resource.description}</p>
                    <p><strong>Tags:</strong> ${(resource.tags || []).join(', ')}</p>
                    <a href="${resource.url}" target="_blank" style="color: #4CAF50; text-decoration: none; font-weight: bold;">📖 Access Resource</a>
                </div>
            `).join('');
        }
        
        let motivationHTML = '';
        if (data.motivation) {
            motivationHTML = `
                <div class="motivation-section">
                    <h3>💪 Daily Motivation</h3>
                    <blockquote style="font-style: italic; margin: 10px 0;">
                        "${data.motivation.quote.quote}" - ${data.motivation.quote.author}
                    </blockquote>
                    <p><strong>💡 Study Tip:</strong> ${data.motivation.tip.tip}</p>
                    <p>${data.motivation.encouragement}</p>
                </div>
            `;
        }
        
        const outputHTML = `
            <div class="success">🚀 Advanced study plan generated successfully!</div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>📊 Plan Overview</h3>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Total Hours:</strong> ${data.total_hours}h</p>
                <p><strong>Daily Hours:</strong> ${data.daily_hours}h</p>
                <p><strong>Difficulty:</strong> ${data.difficulty}</p>
            </div>
            
            ${motivationHTML}
            
            <h3>📅 Your Study Schedule</h3>
            ${scheduleHTML}
            
            <h3>📚 Recommended Resources</h3>
            ${resourcesHTML}
        `;
        
        resultsDiv.innerHTML = outputHTML;
        
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> Failed to generate advanced plan. ${error.message}
            </div>
        `;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Find Resources
async function findResources() {
    const subject = document.getElementById('resource-subject').value.trim();
    const difficulty = document.getElementById('resource-difficulty').value;
    
    const resultsDiv = document.getElementById('resources-results');
    const loadingDiv = document.getElementById('resources-loading');
    
    if (!subject) {
        resultsDiv.innerHTML = '<div class="error">Please enter a subject!</div>';
        return;
    }
    
    // Show loading
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/resources/${encodeURIComponent(subject)}?difficulty=${difficulty}&limit=8`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.resources || data.resources.length === 0) {
            resultsDiv.innerHTML = '<div class="error">No resources found for this subject. Try a different search term.</div>';
            return;
        }
        
        const resourcesHTML = data.resources.map(resource => `
            <div class="resource-card">
                <h4>${resource.title}</h4>
                <p><strong>Type:</strong> ${resource.resource_type}</p>
                <p><strong>Subject:</strong> ${resource.subject}</p>
                <p><strong>Difficulty:</strong> ${resource.difficulty}</p>
                <p><strong>Rating:</strong> <span class="resource-rating">${'⭐'.repeat(Math.floor(resource.rating || 4))}</span> (${resource.rating || 'N/A'})</p>
                ${resource.duration_minutes ? `<p><strong>Duration:</strong> ${Math.floor(resource.duration_minutes / 60)}h ${resource.duration_minutes % 60}m</p>` : ''}
                <p>${resource.description}</p>
                <p><strong>Tags:</strong> ${(resource.tags || []).join(', ')}</p>
                <p><strong>Source:</strong> ${resource.source}</p>
                <a href="${resource.url}" target="_blank" style="color: #4CAF50; text-decoration: none; font-weight: bold;">📖 Access Resource</a>
                ${resource.similarity_score ? `<p style="font-size: 0.9em; color: #666;">Match Score: ${(resource.similarity_score * 100).toFixed(1)}%</p>` : ''}
            </div>
        `).join('');
        
        resultsDiv.innerHTML = `
            <div class="success">Found ${data.resources.length} resources for "${subject}"</div>
            ${resourcesHTML}
        `;
        
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> Failed to find resources. ${error.message}
            </div>
        `;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Get Motivation
async function getMotivation() {
    const moodText = document.getElementById('mood-text').value.trim();
    
    const resultsDiv = document.getElementById('motivation-results');
    const loadingDiv = document.getElementById('motivation-loading');
    
    // Show loading
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/motivation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: moodText }),
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const motivationHTML = `
            <div class="motivation-section">
                <h3>🌟 Your Daily Motivation</h3>
                
                ${moodText ? `
                    <div style="background: rgba(255,255,255,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4>📊 Mood Analysis</h4>
                        <p>Based on your input, I detected a <strong>${data.mood || 'neutral'}</strong> mood.</p>
                    </div>
                ` : ''}
                
                <div style="background: rgba(255,255,255,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>💭 Inspirational Quote</h4>
                    <blockquote style="font-style: italic; font-size: 1.1em; margin: 10px 0;">
                        "${data.quote.quote}"
                    </blockquote>
                    <p style="text-align: right; font-weight: bold;">— ${data.quote.author}</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>💡 Study Tip</h4>
                    <p>${data.tip.tip}</p>
                    <p><small><strong>Category:</strong> ${data.tip.category}</small></p>
                </div>
                
                <div style="background: rgba(255,255,255,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>🎯 Encouragement</h4>
                    <p>${data.encouragement}</p>
                </div>
            </div>
        `;
        
        resultsDiv.innerHTML = motivationHTML;
        
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> Failed to get motivation. ${error.message}
            </div>
        `;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Load available subjects on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subjects`);
        if (response.ok) {
            const data = await response.json();
            const subjectSelect = document.getElementById('subject');
            
            // Clear existing options except the first one
            subjectSelect.innerHTML = '<option value="">Select a subject...</option>';
            
            // Add subjects from the database
            data.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load subjects:', error);
    }
});

// Add some visual feedback for form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add focus effects to form elements
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        element.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});