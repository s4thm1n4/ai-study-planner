class StudyLog {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'study-log-section';
    }

    async render() {
        const studyData = await this.fetchStudyData();
        const weeklyStats = this.calculateWeeklyStats(studyData);
        
        this.container.innerHTML = `
            <div class="study-log-card">
                <h2>Study Log & Insights</h2>
                
                <div class="quick-stats">
                    <div class="stat-item">
                        <h3>This Week</h3>
                        <p class="stat-value">${weeklyStats.totalHours} hours</p>
                    </div>
                    <div class="stat-item">
                        <h3>Most Studied</h3>
                        <p class="stat-value">${weeklyStats.mostStudiedTopic}</p>
                    </div>
                    <div class="stat-item">
                        <h3>Current Streak</h3>
                        <p class="stat-value">${weeklyStats.currentStreak} days</p>
                    </div>
                </div>

                <div class="calendar-view">
                    <h3>Study Calendar</h3>
                    ${this.renderCalendar(studyData)}
                </div>

                <div class="study-analytics">
                    <h3>Weekly Progress</h3>
                    <div class="chart-container">
                        ${this.renderWeeklyChart(studyData)}
                    </div>
                </div>

                <div class="topic-breakdown">
                    <h3>Topic Breakdown</h3>
                    ${this.renderTopicBreakdown(studyData.topicStats)}
                </div>
            </div>
        `;

        // Initialize tooltips
        this.initializeTooltips();
        
        return this.container;
    }

    renderCalendar(data) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        let calendarHtml = `
            <div class="calendar-grid">
                <div class="calendar-header">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
                <div class="calendar-days">
        `;

        // Add empty cells for days before start of month
        const firstDayOfMonth = startOfMonth.getDay();
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHtml += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= endOfMonth.getDate(); day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            const dateString = date.toISOString().split('T')[0];
            const dayData = data.dailyStats[dateString];
            
            const hasStudy = dayData && dayData.totalMinutes > 0;
            const isToday = day === today.getDate();
            
            calendarHtml += `
                <div class="calendar-day ${hasStudy ? 'has-study' : ''} ${isToday ? 'today' : ''}"
                     data-date="${dateString}"
                     data-tooltip="${this.formatDayTooltip(dayData)}">
                    ${day}
                    ${hasStudy ? '<div class="study-indicator"></div>' : ''}
                </div>
            `;
        }

        calendarHtml += `
                </div>
            </div>
        `;
        
        return calendarHtml;
    }

    renderWeeklyChart(data) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const maxHours = Math.max(...Object.values(data.dailyStats).map(d => d.totalMinutes / 60));
        
        return `
            <div class="weekly-chart">
                ${days.map(day => {
                    const hours = (data.dailyStats[day]?.totalMinutes || 0) / 60;
                    const height = (hours / maxHours) * 100;
                    return `
                        <div class="chart-bar">
                            <div class="bar" style="height: ${height}%"></div>
                            <span class="day-label">${day}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTopicBreakdown(topicStats) {
        return `
            <div class="topic-stats">
                ${Object.entries(topicStats).map(([topic, stats]) => `
                    <div class="topic-stat-item">
                        <div class="topic-header">
                            <span class="topic-name">${topic}</span>
                            <span class="topic-hours">${stats.totalHours}h</span>
                        </div>
                        <div class="topic-progress">
                            <div class="progress-bar" style="width: ${stats.progressPercentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatDayTooltip(dayData) {
        if (!dayData || dayData.totalMinutes === 0) {
            return 'No study sessions';
        }

        return Object.entries(dayData.topics)
            .map(([topic, minutes]) => `${topic}: ${Math.round(minutes / 60 * 10) / 10}h`)
            .join('\n');
    }

    async fetchStudyData() {
        try {
            const response = await fetch('/api/study-log');
            return await response.json();
        } catch (error) {
            console.error('Error fetching study data:', error);
            return {
                dailyStats: {},
                topicStats: {},
                weeklyStats: {
                    totalHours: 0,
                    mostStudiedTopic: 'N/A',
                    currentStreak: 0
                }
            };
        }
    }

    calculateWeeklyStats(data) {
        // This would normally be calculated by the backend
        return {
            totalHours: Object.values(data.dailyStats)
                .reduce((total, day) => total + (day.totalMinutes || 0), 0) / 60,
            mostStudiedTopic: 'Topic Name',
            currentStreak: 5
        };
    }

    initializeTooltips() {
        // Add tooltip initialization logic here
    }
}

// Add styles
const styles = document.createElement('style');
styles.textContent = `
    .study-log-section {
        padding: 20px;
    }

    .study-log-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .quick-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin: 20px 0;
    }

    .stat-item {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #4CAF50;
    }

    .calendar-grid {
        margin: 20px 0;
    }

    .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
    }

    .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: #f8f9fa;
        border-radius: 5px;
        cursor: pointer;
    }

    .calendar-day.has-study {
        background: #e8f5e9;
    }

    .calendar-day.today {
        border: 2px solid #4CAF50;
    }

    .study-indicator {
        position: absolute;
        bottom: 2px;
        width: 4px;
        height: 4px;
        background: #4CAF50;
        border-radius: 50%;
    }

    .weekly-chart {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 200px;
        margin: 20px 0;
    }

    .chart-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }

    .bar {
        width: 30px;
        background: #4CAF50;
        border-radius: 3px 3px 0 0;
        transition: height 0.3s ease;
    }

    .topic-stats {
        margin-top: 20px;
    }

    .topic-stat-item {
        margin: 10px 0;
    }

    .topic-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
    }

    .topic-progress {
        height: 6px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s ease;
    }
`;
document.head.appendChild(styles);

export default StudyLog;