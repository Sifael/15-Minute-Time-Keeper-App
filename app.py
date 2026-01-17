from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, time
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///journal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class LogEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    activity = db.Column(db.String(200), nullable=False)
    slot_time = db.Column(db.String(10), nullable=False) # e.g., "20:15"

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "activity": self.activity,
            "slot_time": self.slot_time
        }

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/logs', methods=['GET'])
def get_logs():
    logs = LogEntry.query.order_by(LogEntry.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs])

@app.route('/api/logs', methods=['POST'])
def add_log():
    data = request.json
    activity = data.get('activity')
    slot_time = data.get('slot_time')
    
    if not activity or not slot_time:
        return jsonify({"error": "Missing data"}), 400
    
    new_log = LogEntry(activity=activity, slot_time=slot_time)
    db.session.add(new_log)
    db.session.commit()
    
    return jsonify(new_log.to_dict()), 201

if __name__ == '__main__':
    app.run(debug=True, port=5001)
