from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import sqlite3
import os
import re

app = Flask(__name__)
CORS(app)

# --- PATH SETUP ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')
MODEL_PATH = os.path.join(BASE_DIR, 'emotion_model.pkl')

# --- DATABASE INIT ---
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                email TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                comment TEXT,
                rating INTEGER,
                sentiment TEXT
            )
        """)

init_db()

# --- LOAD AI MODEL ---
try:
    model = joblib.load(MODEL_PATH)
    print("✅ AI Model Loaded")
except:
    print("❌ Model not found. Run train_model.py")
    model = None

# --- SIGNUP ---
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    email = data.get('email', '').strip()

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid Email Address"}), 400
    if len(password) < 4:
        return jsonify({"error": "Password too short"}), 400

    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
                (username, password, email)
            )
        return jsonify({"status": "success"})
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 400

# --- SIGNIN ---
@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # ADMIN LOGIN
    if username == 'admin' and password == 'admin123':
        return jsonify({"status": "success", "role": "admin", "username": "Admin"})

    # USER LOGIN
    with sqlite3.connect(DB_PATH) as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        ).fetchone()

    if user:
        return jsonify({"status": "success", "role": "user", "username": username})

    return jsonify({"error": "Invalid credentials"}), 401

# --- FEEDBACK + AI ---
@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.json
    sentiment = "Neutral"

    if model:
        try:
            print(f"🧠 Analyzing: {data['comment']}")
            sentiment = model.predict([data['comment']])[0]
            print(f"🧠 Result: {sentiment}")
        except Exception as e:
            print("AI ERROR:", e)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO feedback (username, comment, rating, sentiment) VALUES (?, ?, ?, ?)",
            (data['username'], data['comment'], int(data['rating']), sentiment)
        )

    return jsonify({"sentiment": sentiment})

# --- ADMIN DASHBOARD DATA ---
@app.route('/api/admin', methods=['GET'])
def admin():
    with sqlite3.connect(DB_PATH) as conn:
        reviews = conn.execute("SELECT * FROM feedback ORDER BY id DESC").fetchall()
        users = conn.execute("SELECT * FROM users").fetchall()

    total = len(reviews)

    if total > 0:
        avg = round(sum([r[3] for r in reviews]) / total, 1)
        emotions = [r[4] for r in reviews]
        dom = max(set(emotions), key=emotions.count)
    else:
        avg = 0
        dom = "None"

    return jsonify({
        "reviews": reviews,
        "users": users,
        "stats": {
            "total": total,
            "rating": avg,
            "emotion": dom
        }
    })

# --- DELETE USER ---
@app.route('/api/admin/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    return jsonify({"status": "deleted"})

# --- RUN SERVER ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
