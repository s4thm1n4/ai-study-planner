class TodaysPlan {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'todays-plan-card';
    }

    async render(topic) {
        const plan = await this.fetchTodaysPlan(topic);
        
        this.container.innerHTML = `
            <div class="card">
                <h2>Today's Study Plan</h2>
                <div class="today-goal">
                    <h3>Today's Goal: Study ${plan.topic} for ${plan.targetHours} hours</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(plan.hoursCompleted / plan.targetHours) * 100}%"></div>
                    </div>
                    <p>${plan.hoursCompleted} / ${plan.targetHours} hours completed</p>
                </div>
                
                <div class="tasks-list">
                    <h3>Today's Tasks:</h3>
                    <ul>
                        ${plan.tasks.map(task => `
                            <li>
                                <input type="checkbox" 
                                       id="task-${task.id}" 
                                       ${task.completed ? 'checked' : ''}
                                       onchange="handleTaskComplete(${task.id})">
                                <label for="task-${task.id}">${task.title}</label>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="study-actions">
                    <button class="primary-btn" onclick="startStudySession('${plan.topic}')">
                        Start Study Session
                    </button>
                    <button class="secondary-btn" onclick="viewDetails('${plan.topic}')">
                        View Details
                    </button>
                </div>
            </div>
        `;

        return this.container;
    }

    async fetchTodaysPlan(topic) {
        try {
            const response = await fetch(`/api/study-plan/today?topic=${topic}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching today\'s plan:', error);
            return {
                topic: topic,
                targetHours: 2,
                hoursCompleted: 0,
                tasks: []
            };
        }
    }
}

// Add styles
const styles = document.createElement('style');
styles.textContent = `
    .todays-plan-card {
        margin: 20px 0;
    }

    .todays-plan-card .card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .today-goal {
        margin: 15px 0;
    }

    .progress-bar {
        height: 10px;
        background: #f0f0f0;
        border-radius: 5px;
        margin: 10px 0;
    }

    .progress {
        height: 100%;
        background: #4CAF50;
        border-radius: 5px;
        transition: width 0.3s ease;
    }

    .tasks-list {
        margin: 20px 0;
    }

    .tasks-list ul {
        list-style: none;
        padding: 0;
    }

    .tasks-list li {
        display: flex;
        align-items: center;
        margin: 10px 0;
        padding: 10px;
        background: #f8f8f8;
        border-radius: 5px;
    }

    .study-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .primary-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }

    .secondary-btn {
        background: #f0f0f0;
        color: #333;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
    }
`;
document.head.appendChild(styles);

// Global functions for event handlers
window.startStudySession = async (topic) => {
    // TODO: Implement study session start logic
    console.log('Starting study session for:', topic);
};

window.handleTaskComplete = async (taskId) => {
    // TODO: Implement task completion logic
    console.log('Task completed:', taskId);
};

window.viewDetails = (topic) => {
    // TODO: Implement view details logic
    console.log('Viewing details for:', topic);
};

export default TodaysPlan;