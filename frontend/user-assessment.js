// User Assessment JavaScript

// User Assessment Variables
let currentStep = 1;
let userAssessment = {};

// Initialize assessment functionality
function initializeAssessment() {
    // Initialize mood selector for the assessment
    initializeMoodSelector();
    
    // Initialize knowledge level selector
    initializeKnowledgeLevelSelector();
    
    // Set up event listeners
    const studyPurposeSelect = document.getElementById('studyPurpose');
    if (studyPurposeSelect) {
        studyPurposeSelect.addEventListener('change', function() {
            const examGroup = document.getElementById('examDetailsGroup');
            if (this.value === 'exam') {
                examGroup.style.display = 'block';
            } else {
                examGroup.style.display = 'none';
            }
        });
    }

    // Initialize difficulty slider
    updateDifficultyLabel();
}

// Knowledge Level Selector
function initializeKnowledgeLevelSelector() {
    const knowledgeBtns = document.querySelectorAll('.knowledge-btn');
    
    knowledgeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            knowledgeBtns.forEach(b => b.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Store the selected value
            const hiddenInput = document.getElementById('selectedKnowledgeLevel');
            if (hiddenInput) {
                hiddenInput.value = this.dataset.level;
            }
        });
    });
}

// Mood Selector for Assessment
function initializeMoodSelector() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    
    moodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            moodBtns.forEach(b => b.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Store the selected value
            const hiddenInput = document.getElementById('selectedMood');
            if (hiddenInput) {
                hiddenInput.value = this.dataset.mood;
            }
        });
    });
}

// Update grade options based on education level
function updateGradeOptions() {
    const educationLevel = document.getElementById('educationLevel').value;
    const gradeGroup = document.getElementById('gradeGroup');
    const gradeSelect = document.getElementById('grade');
    
    // Clear previous options
    gradeSelect.innerHTML = '';
    
    if (educationLevel) {
        gradeGroup.style.display = 'block';
        
        let options = [];
        switch(educationLevel) {
            case 'elementary':
                options = [
                    { value: 'k', text: 'Kindergarten' },
                    { value: '1', text: 'Grade 1' },
                    { value: '2', text: 'Grade 2' },
                    { value: '3', text: 'Grade 3' },
                    { value: '4', text: 'Grade 4' },
                    { value: '5', text: 'Grade 5' }
                ];
                break;
            case 'middle':
                options = [
                    { value: '6', text: 'Grade 6' },
                    { value: '7', text: 'Grade 7' },
                    { value: '8', text: 'Grade 8' }
                ];
                break;
            case 'high':
                options = [
                    { value: '9', text: 'Grade 9 (Freshman)' },
                    { value: '10', text: 'Grade 10 (Sophomore)' },
                    { value: '11', text: 'Grade 11 (Junior)' },
                    { value: '12', text: 'Grade 12 (Senior)' }
                ];
                break;
            case 'undergraduate':
                options = [
                    { value: 'freshman', text: '1st Year (Freshman)' },
                    { value: 'sophomore', text: '2nd Year (Sophomore)' },
                    { value: 'junior', text: '3rd Year (Junior)' },
                    { value: 'senior', text: '4th Year (Senior)' },
                    { value: '5th', text: '5th Year+' }
                ];
                break;
            case 'graduate':
                options = [
                    { value: 'masters-1', text: "Master's - 1st Year" },
                    { value: 'masters-2', text: "Master's - 2nd Year" },
                    { value: 'phd-1', text: 'PhD - 1st Year' },
                    { value: 'phd-2', text: 'PhD - 2nd Year' },
                    { value: 'phd-3', text: 'PhD - 3rd Year+' }
                ];
                break;
            case 'professional':
                options = [
                    { value: 'entry', text: 'Entry Level (0-2 years)' },
                    { value: 'mid', text: 'Mid Level (3-7 years)' },
                    { value: 'senior', text: 'Senior Level (8+ years)' },
                    { value: 'executive', text: 'Executive Level' }
                ];
                break;
            case 'lifelong':
                gradeGroup.style.display = 'none';
                return;
        }
        
        // Add options to select
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            gradeSelect.appendChild(optionElement);
        });
    } else {
        gradeGroup.style.display = 'none';
    }
}

// Update difficulty description
function updateDifficultyLabel() {
    const slider = document.getElementById('difficultyRange');
    const description = document.getElementById('difficultyDescription');
    
    if (!slider || !description) return;
    
    const descriptions = {
        1: 'Very Easy - Gentle introduction with lots of support',
        2: 'Easy - Comfortable pace with clear explanations', 
        3: 'Moderate - Balanced challenge with good support',
        4: 'Challenging - Fast pace with advanced concepts',
        5: 'Very Challenging - Intensive study with complex topics'
    };
    
    description.textContent = descriptions[slider.value];
}

// Step navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        // Save current step data
        saveCurrentStepData();
        
        // Move to next step
        if (currentStep < 4) {
            currentStep++;
            showStep(currentStep);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.assessment-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Update progress indicator
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === stepNumber) {
            step.classList.add('active');
        } else if (index + 1 < stepNumber) {
            step.classList.add('completed');
        }
    });
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            const educationLevel = document.getElementById('educationLevel').value;
            const studyPurpose = document.getElementById('studyPurpose').value;
            if (!educationLevel || !studyPurpose) {
                alert('Please fill in all required fields in this step.');
                return false;
            }
            break;
        case 2:
            const knowledgeLevel = document.getElementById('selectedKnowledgeLevel').value;
            if (!knowledgeLevel) {
                alert('Please select your current knowledge level.');
                return false;
            }
            break;
        case 3:
            const specificGoals = document.getElementById('specificGoals').value;
            const expectedOutcome = document.getElementById('expectedOutcome').value;
            if (!specificGoals.trim() || !expectedOutcome) {
                alert('Please describe your learning goals and expected outcome.');
                return false;
            }
            break;
    }
    return true;
}

function saveCurrentStepData() {
    const getElementValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
    };

    switch(currentStep) {
        case 1:
            userAssessment.educationLevel = getElementValue('educationLevel');
            userAssessment.grade = getElementValue('grade');
            userAssessment.studyPurpose = getElementValue('studyPurpose');
            userAssessment.examDetails = getElementValue('examDetails');
            break;
        case 2:
            userAssessment.knowledgeLevel = getElementValue('selectedKnowledgeLevel');
            userAssessment.previousExperience = getElementValue('previousExperience');
            userAssessment.strugglingAreas = getElementValue('strugglingAreas');
            break;
        case 3:
            userAssessment.specificGoals = getElementValue('specificGoals');
            userAssessment.expectedOutcome = getElementValue('expectedOutcome');
            userAssessment.preferredDifficulty = getElementValue('difficultyRange');
            
            // Get selected challenges
            const challenges = [];
            document.querySelectorAll('.challenge-option input:checked').forEach(checkbox => {
                challenges.push(checkbox.value);
            });
            userAssessment.learningChallenges = challenges;
            break;
        case 4:
            userAssessment.subjectOfInterest = getElementValue('advancedSubject');
            userAssessment.dailyStudyHours = getElementValue('dailyHours');
            
            // Handle custom duration
            const totalDaysSelect = document.getElementById('totalDays');
            if (totalDaysSelect && totalDaysSelect.value === 'custom') {
                userAssessment.studyDuration = getElementValue('customDays');
            } else {
                userAssessment.studyDuration = getElementValue('totalDays');
            }
            
            userAssessment.learningStyle = getElementValue('learningStyle');
            
            // Get selected mood
            const selectedMoodBtn = document.querySelector('.mood-btn.selected');
            userAssessment.currentMood = selectedMoodBtn ? selectedMoodBtn.dataset.mood : 'neutral';
            break;
    }
}

// Get collected user assessment data
function getUserAssessmentData() {
    // Save current step data before returning
    saveCurrentStepData();
    return userAssessment;
}

// Reset assessment to step 1
function resetAssessment() {
    currentStep = 1;
    userAssessment = {};
    showStep(1);
    
    // Clear all form fields
    document.querySelectorAll('#user-assessment input, #user-assessment select, #user-assessment textarea').forEach(field => {
        field.value = '';
    });
    
    // Clear selections
    document.querySelectorAll('.knowledge-btn, .mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear checkboxes
    document.querySelectorAll('.challenge-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset slider
    const slider = document.getElementById('difficultyRange');
    if (slider) {
        slider.value = 3;
        updateDifficultyLabel();
    }
}

// Export functions for use in main application
window.userAssessment = {
    initialize: initializeAssessment,
    getData: getUserAssessmentData,
    reset: resetAssessment,
    nextStep: nextStep,
    saveCurrentStep: saveCurrentStepData,
    prevStep: prevStep
};