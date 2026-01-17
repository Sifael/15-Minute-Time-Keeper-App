# Tutorial: Building a 15-Minute Accountability Journal

This tutorial will guide you through building "TimeKeeper," a web application designed to help you log your activities every 15 minutes, specifically focused on the 8:00 PM - 9:00 PM window.

## Overview
The application consists of:
1.  **Python Backend**: Using Flask to handle data storage and API requests.
2.  **SQLite Database**: A lightweight database to store your logs permanently.
3.  **Web Frontend**: A modern, light-themed interface built with HTML, CSS, and Vanilla JavaScript.
4.  **Smart Reminders**: Automated audio and visual signals every 15 minutes.

---

## Step 1: Setting up the Backend (Python)

We use **Flask** because it's lightweight and perfect for small utilities. We also use **Flask-SQLAlchemy** to manage our database.

### File: `app.py`
This file does three main things:
- Defines the `LogEntry` model (how our data looks).
- Provides an API to save new logs (`POST /api/logs`).
- Provides an API to retrieve previous logs (`GET /api/logs`).

### Key Code snippet:
```python
class LogEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    activity = db.Column(db.String(200), nullable=False)
    slot_time = db.Column(db.String(10), nullable=False)
```

---

## Step 2: Creating the User Interface (HTML)

The UI is designed to be clean and focused. It features a large "Timer Circle" that shows the countdown to the next 15-minute slot.

### File: `templates/index.html`
- **Header**: Displays your Current Streak.
- **Reminder Card**: Houses the timer and the input field.
- **Progress Card**: Shows a visual timeline of your 8-9 PM window.
- **History Card**: Lists all your past logs.

---

## Step 3: Styling with CSS

We use a "Glassmorphism" inspired light theme.
- **Colors**: Soft grays (`#f8fafc`) for the background, deep blues (`#6366f1`) for primary actions.
- **Animations**: A 'pulse' animation is applied to the timer when it's time to log.

---

## Step 4: The Logic (JavaScript)

This is the "brain" of the app. It manages the real-time clock and reminders.

### Key Logic:
1.  **Next Slot Calculation**: Every second, the app calculates how many minutes are left until the next 15-minute mark (e.g., if it's 8:04, the next slot is 8:15).
2.  **Reminders**: When the timer hits `00:00`, it plays a gentle chime and sends a browser notification.
3.  **Streaks**: We use `localStorage` to keep track of your consecutive logs, giving you a sense of achievement.

---

## How to Run the App

1.  **Install Dependencies**:
    ```bash
    pip install flask flask-sqlalchemy
    ```

2.  **Start the Server**:
    ```bash
    python app.py
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:5001`.

## Incentives Included
- **Streak Counter**: Watch your number grow as you log consistently.
- **Visual Progress Bar**: See the 8:00 PM - 9:00 PM hour fill up as you complete each 15-minute block.
- **Auditory Cues**: A gentle sound ensures you don't forget, even if you're focused on work.
- **Interactive Feedback**: Buttons and cards react to your input, making the experience feel "alive."
