# AI-Powered Emotion-Based Feedback System

---

## Overview

This project is a full-stack **Emotion-Based Feedback System** that combines web development with machine learning to analyze user feedback in real time.

Unlike traditional feedback forms, this system uses a trained Natural Language Processing (NLP) model to detect the emotional tone of user comments. The AI model is trained using the provided emotion dataset and predicts sentiments such as Joy, Anger, Sadness, Fear, Love, Neutral, and others.

The application features a modern interface built with React and Tailwind CSS, along with a Flask backend that handles authentication, database operations, and real-time AI predictions.

---

## Key Features

### Artificial Intelligence

* Custom trained model using the provided dataset
* Text preprocessing and TF-IDF feature extraction
* Logistic Regression classifier for emotion prediction
* Real-time emotion detection upon feedback submission

### User Functionality

* User registration with validation
* Secure login authentication
* Feedback form with rating and comment
* Instant AI sentiment analysis results

### Admin Dashboard

* Static admin login (`admin / admin123`)
* Overview of total feedback submissions
* Average rating statistics
* Dominant emotion summary
* Table view of feedback with predicted sentiment
* User management with delete option

### Modern UI/UX

* Glassmorphism-inspired design using Tailwind CSS
* Smooth transitions and modal popups
* Responsive layout for desktop and mobile devices

---

## Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS

**Backend**

* Python (Flask)
* SQLite Database

**Machine Learning**

* Scikit-Learn
* Pandas
* Joblib

---

## Installation & Setup

### 1. Prerequisites

Make sure Python and Node.js are installed.

Install backend dependencies:

```
pip install flask pandas scikit-learn joblib flask-cors
```

Install frontend dependencies:

```
cd frontend
npm install
```

---

### 2. Train the AI Model

Before running the application, train the emotion detection model:

```
cd backend
python train_model.py
```

This generates the trained model file:

```
emotion_model.pkl
```

---

### 3. Run the Backend

```
cd backend
python app.py
```

Backend runs at:

```
http://127.0.0.1:5000
```

---

### 4. Run the Frontend

```
cd frontend
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Admin Credentials

```
Username: admin
Password: admin123
```

---

## Project Objective

This project demonstrates the integration of:

* Full-stack web development
* Machine learning model training and deployment
* Real-time AI predictions within a web application
* Database-backed analytics dashboard

It showcases how AI can be embedded into real-world applications to enhance user feedback systems.

---

## Author

**Harisankar M**
Computer Science Engineering Graduate
