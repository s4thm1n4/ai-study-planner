class AchievementSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'achievements-section';
        this.notifications = [];
    }

    async render() {
        const achievements = await this.fetchAchievements();
        const streakInfo = await this.fetchStreakInfo();
        
        this.container.innerHTML = `
            <div class="achievements-card">
                <div class="streak-section">
                    <h2>Current Streak: ${streakInfo.currentStreak} Days</h2>
                    <div class="streak-info">
                        <div class="streak-flame ${streakInfo.currentStreak > 0 ? 'active' : ''}">🔥</div>
                        <div class="streak-details">
                            <p>${this.getStreakMessage(streakInfo)}</p>
                            ${this.renderStreakFreeze(streakInfo)}
                        </div>
                    </div>
                </div>

                <div class="achievements-grid">
                    ${this.renderAchievements(achievements)}
                </div>

                <div class="next-achievement">
                    ${this.renderNextAchievement(achievements)}
                </div>
            </div>
        `;

        return this.container;
    }

    renderAchievements(achievements) {
        return achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    ${achievement.unlocked ? 
                        `<span class="unlock-date">Unlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}</span>` :
                        `<div class="progress-bar">
                            <div class="progress" style="width: ${achievement.progress}%"></div>
                        </div>
                        <span class="progress-text">${achievement.progress}%</span>`
                    }
                </div>
            </div>
        `).join('');
    }

    renderNextAchievement(achievements) {
        const nextAchievement = achievements.find(a => !a.unlocked);
        if (!nextAchievement) return '';

        return `
            <div class="next-achievement-card">
                <h3>Next Achievement</h3>
                <div class="next-achievement-content">
                    <div class="achievement-icon">${nextAchievement.icon}</div>
                    <div class="achievement-info">
                        <h4>${nextAchievement.name}</h4>
                        <p>${nextAchievement.description}</p>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${nextAchievement.progress}%"></div>
                        </div>
                        <p class="motivation-text">${this.getMotivationalMessage(nextAchievement)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderStreakFreeze(streakInfo) {
        return `
            <div class="streak-freeze ${streakInfo.freezesAvailable > 0 ? 'available' : ''}">
                <span class="freeze-icon">❄️</span>
                <div class="freeze-info">
                    <p>Streak Freezes: ${streakInfo.freezesAvailable}</p>
                    ${streakInfo.freezesAvailable > 0 ?
                        `<button class="use-freeze-btn" onclick="achievementSystem.useStreakFreeze()">
                            Use Freeze
                        </button>` :
                        `<p class="freeze-help">Complete 7 days to earn a streak freeze!</p>`
                    }
                </div>
            </div>
        `;
    }

    getStreakMessage(streakInfo) {
        if (streakInfo.currentStreak === 0) {
            return "Start your streak today!";
        }
        if (streakInfo.currentStreak < 3) {
            return "Keep going! You're building momentum!";
        }
        if (streakInfo.currentStreak < 7) {
            return "Impressive streak! You're on fire! 🔥";
        }
        return "Amazing dedication! You're unstoppable! 🌟";
    }

    getMotivationalMessage(achievement) {
        if (achievement.progress > 75) {
            return "So close! Just a little more effort!";
        }
        if (achievement.progress > 50) {
            return "You're making great progress!";
        }
        if (achievement.progress > 25) {
            return "Keep pushing forward!";
        }
        return "Every step counts! You can do this!";
    }

    async useStreakFreeze() {
        try {
            const response = await fetch('/api/streak/use-freeze', {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Streak Freeze Applied', 'Your streak is protected for today! ❄️');
                this.render();
            }
        } catch (error) {
            console.error('Error using streak freeze:', error);
        }
    }

    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async fetchAchievements() {
        try {
            const response = await fetch('/api/achievements');
            return await response.json();
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    }

    async fetchStreakInfo() {
        try {
            const response = await fetch('/api/streak/info');
            return await response.json();
        } catch (error) {
            console.error('Error fetching streak info:', error);
            return {
                currentStreak: 0,
                freezesAvailable: 0
            };
        }
    }
}

// Add styles
const styles = document.createElement('style');
styles.textContent = `
    .achievements-section {
        padding: 20px;
    }

    .achievements-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .streak-section {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
    }

    .streak-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-top: 15px;
    }

    .streak-flame {
        font-size: 40px;
        opacity: 0.3;
        transition: all 0.3s ease;
    }

    .streak-flame.active {
        opacity: 1;
        animation: flame 1.5s infinite;
    }

    @keyframes flame {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }

    .achievement-item {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        gap: 15px;
        transition: all 0.3s ease;
    }

    .achievement-item.unlocked {
        background: #e8f5e9;
    }

    .achievement-icon {
        font-size: 30px;
        opacity: 0.7;
    }

    .achievement-info {
        flex: 1;
    }

    .achievement-info h3 {
        margin: 0 0 5px 0;
        color: #333;
    }

    .achievement-info p {
        margin: 0;
        color: #666;
        font-size: 14px;
    }

    .progress-bar {
        height: 4px;
        background: #ddd;
        border-radius: 2px;
        margin: 10px 0;
        overflow: hidden;
    }

    .progress {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s ease;
    }

    .next-achievement-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-top: 30px;
    }

    .next-achievement-content {
        display: flex;
        gap: 15px;
        margin-top: 15px;
    }

    .motivation-text {
        color: #4CAF50;
        font-weight: bold;
        margin-top: 10px;
    }

    .streak-freeze {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        opacity: 0.7;
    }

    .streak-freeze.available {
        opacity: 1;
    }

    .freeze-icon {
        font-size: 24px;
    }

    .use-freeze-btn {
        background: #2196F3;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 5px;
    }

    .achievement-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }

    .achievement-notification.show {
        transform: translateX(0);
    }

    .achievement-notification h4 {
        margin: 0 0 5px 0;
        color: #4CAF50;
    }

    .achievement-notification p {
        margin: 0;
        color: #666;
    }
`;
document.head.appendChild(styles);

// Create global instance
window.achievementSystem = new AchievementSystem();

export default AchievementSystem;