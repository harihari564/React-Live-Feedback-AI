import pandas as pd
import joblib
import re
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

print("Loading dataset...")

df = pd.read_csv("EmotionDetection.csv")

# detect columns automatically
text_col = [c for c in df.columns if "text" in c.lower()][0]
label_col = [c for c in df.columns if "emotion" in c.lower()][0]

df = df[[text_col, label_col]].dropna()

# ---- clean text ----
def clean(t):
    t = t.lower()
    t = re.sub(r"[^a-zA-Z ]", "", t)
    return t

df[text_col] = df[text_col].astype(str).apply(clean)

X = df[text_col]
y = df[label_col].astype(str)

print("Training on", len(df), "rows")

# combine word + character features (helps short inputs)
features = FeatureUnion([
    ("word", TfidfVectorizer(
        stop_words="english",
        ngram_range=(1,2),
        max_features=12000
    )),
    ("char", TfidfVectorizer(
        analyzer="char",
        ngram_range=(3,5),
        max_features=8000
    ))
])

model = Pipeline([
    ("features", features),
    ("clf", LogisticRegression(
        max_iter=2500,
        class_weight="balanced"
    ))
])

model.fit(X,y)

joblib.dump(model,"emotion_model.pkl")

print("Model trained successfully.")
