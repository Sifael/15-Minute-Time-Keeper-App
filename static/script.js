document.addEventListener('DOMContentLoaded', () => {
    const activityInput = document.getElementById('activity-input');
    const logBtn = document.getElementById('log-btn');
    const historyList = document.getElementById('history-list');
    const timerText = document.getElementById('timer-text');
    const nextSlotBadge = document.getElementById('next-slot');
    const progressBar = document.getElementById('progress-bar');
    const streakCount = document.getElementById('streak-count');
    const reminderSound = document.getElementById('reminder-sound');
    const reminderContainer = document.getElementById('reminder-container');

    let logs = [];
    let currentStreak = parseInt(localStorage.getItem('streak') || '0');
    streakCount.textContent = currentStreak;

    // Fetch logs on load
    fetchLogs();

    // Start timer loop
    updateTimer();
    setInterval(updateTimer, 1000);

    logBtn.addEventListener('click', logActivity);
    activityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') logActivity();
    });

    async function fetchLogs() {
        try {
            const response = await fetch('/api/logs');
            logs = await response.json();
            renderHistory();
            updateProgress();
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    }

    async function logActivity() {
        const activity = activityInput.value.trim();
        if (!activity) return;

        const now = new Date();
        const slotTime = getClosestSlot(now);

        try {
            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activity, slot_time: slotTime })
            });

            if (response.ok) {
                activityInput.value = '';
                fetchLogs();
                incrementStreak();
                // Visual feedback
                logBtn.textContent = 'Logged!';
                logBtn.classList.add('success');
                setTimeout(() => {
                    logBtn.textContent = 'Log Activity';
                    logBtn.classList.remove('success');
                }, 2000);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    function renderHistory() {
        historyList.innerHTML = '';
        logs.forEach(log => {
            const item = document.createElement('li');
            item.className = 'history-item';
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            item.innerHTML = `
                <div class="history-content">
                    <span class="history-activity">${log.activity}</span>
                    <span class="history-time">${timeStr}</span>
                </div>
                <span class="history-slot">${log.slot_time}</span>
            `;
            historyList.appendChild(item);
        });
    }

    function updateTimer() {
        const now = new Date();
        const nextSlot = getNextSlot(now);
        const diff = nextSlot - now;

        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        nextSlotBadge.textContent = nextSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Trigget reminder if it's the exact minute of the slot (or within first 10 seconds)
        if (minutes === 0 && seconds === 0) {
            triggerReminder();
        }

        // Window awareness (8PM - 9PM)
        const hour = now.getHours();
        if (hour === 20) {
            reminderContainer.classList.add('in-window');
        } else {
            reminderContainer.classList.remove('in-window');
        }
    }

    function getNextSlot(now) {
        const next = new Date(now);
        const minutes = now.getMinutes();
        const nextQuarter = Math.ceil((minutes + 0.1) / 15) * 15;
        
        if (nextQuarter === 60) {
            next.setHours(next.getHours() + 1);
            next.setMinutes(0);
        } else {
            next.setMinutes(nextQuarter);
        }
        next.setSeconds(0);
        next.setMilliseconds(0);
        return next;
    }

    function getClosestSlot(now) {
        const minutes = now.getMinutes();
        const slotMin = Math.round(minutes / 15) * 15;
        const h = now.getHours();
        const displayH = slotMin === 60 ? h + 1 : h;
        const displayM = slotMin === 60 ? 0 : slotMin;
        return `${displayH}:${displayM.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
        // Progress for 8:00 PM to 9:00 PM
        const windowSlots = ['20:00', '20:15', '20:30', '20:45', '21:00'];
        const loggedToday = logs.filter(log => {
            const date = new Date(log.timestamp);
            return date.toDateString() === new Date().toDateString();
        });

        const loggedSlots = new Set(loggedToday.map(l => l.slot_time));
        let count = 0;
        windowSlots.forEach(slot => {
            const indicator = document.querySelector(`.indicator[data-time="${slot}"]`);
            if (loggedSlots.has(slot)) {
                indicator?.classList.add('active');
                count++;
            }
        });

        const progressPercent = (count / windowSlots.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    function triggerReminder() {
        reminderSound.play().catch(e => console.log('Audio play blocked'));
        reminderContainer.classList.add('reminder-active');
        if (Notification.permission === 'granted') {
            new Notification('TimeKeeper Reminder', {
                body: "It's time to log your progress!",
                icon: '/static/icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        
        setTimeout(() => {
            reminderContainer.classList.remove('reminder-active');
        }, 30000); // Pulse for 30 seconds
    }

    function incrementStreak() {
        currentStreak++;
        localStorage.setItem('streak', currentStreak);
        streakCount.textContent = currentStreak;
        
        // Bonus effect
        streakCount.style.transform = 'scale(1.5)';
        setTimeout(() => streakCount.style.transform = 'scale(1)', 300);
    }
});
