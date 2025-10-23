class StudyTimer {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'study-timer-modal';
        this.isRunning = false;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60; // 5 minutes break
        this.onBreak = false;
    }

    render() {
        this.container.innerHTML = `
            <div class="timer-content">
                <h2>${this.onBreak ? 'Break Time!' : 'Study Session'}</h2>
                <div class="timer-display">
                    <span class="minutes">${Math.floor(this.timeLeft / 60).toString().padStart(2, '0')}</span>:
                    <span class="seconds">${(this.timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div class="timer-controls">
                    <button class="timer-btn ${this.isRunning ? 'pause' : 'start'}" onclick="studyTimer.toggleTimer()">
                        ${this.isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button class="timer-btn reset" onclick="studyTimer.resetTimer()">Reset</button>
                </div>
                <div class="session-info">
                    <p>Topic: ${this.currentTopic}</p>
                    <p>Sessions completed: ${this.sessionsCompleted}</p>
                </div>
            </div>
        `;
        return this.container;
    }

    start(topic) {
        this.currentTopic = topic;
        this.sessionsCompleted = 0;
        document.body.appendChild(this.render());
        this.updateDisplay();
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.resume();
        }
        this.render();
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    resume() {
        this.isRunning = true;
        this.timerInterval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
            this.completeSession();
        }
        this.updateDisplay();
    }

    async completeSession() {
        this.pause();
        
        if (!this.onBreak) {
            // Record completed study session
            await fetch('/api/study-session/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: this.currentTopic,
                    duration: 25 // minutes
                })
            });
            
            this.sessionsCompleted++;
            this.onBreak = true;
            this.timeLeft = this.breakTime;
        } else {
            this.onBreak = false;
            this.timeLeft = 25 * 60;
        }
        
        // Show notification
        new Notification(this.onBreak ? "Time for a break!" : "Break's over! Ready to study?", {
            body: this.onBreak ? 
                  "Great work! Take 5 minutes to rest." : 
                  "Let's start another focused study session!"
        });
        
        this.render();
    }

    resetTimer() {
        this.pause();
        this.timeLeft = this.onBreak ? this.breakTime : 25 * 60;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
        
        const minutesEl = this.container.querySelector('.minutes');
        const secondsEl = this.container.querySelector('.seconds');
        
        if (minutesEl && secondsEl) {
            minutesEl.textContent = minutes;
            secondsEl.textContent = seconds;
        }
    }
}

// Add styles
const timerStyles = document.createElement('style');
timerStyles.textContent = `
    .study-timer-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
    }

    .timer-content {
        text-align: center;
    }

    .timer-display {
        font-size: 48px;
        font-weight: bold;
        margin: 20px 0;
        font-family: monospace;
    }

    .timer-controls {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin: 20px 0;
    }

    .timer-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .timer-btn.start {
        background: #4CAF50;
        color: white;
    }

    .timer-btn.pause {
        background: #FFA000;
        color: white;
    }

    .timer-btn.reset {
        background: #f0f0f0;
        color: #333;
    }

    .session-info {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }

    .session-info p {
        margin: 5px 0;
        color: #666;
    }
`;
document.head.appendChild(timerStyles);

// Create global instance
window.studyTimer = new StudyTimer();

export default StudyTimer;