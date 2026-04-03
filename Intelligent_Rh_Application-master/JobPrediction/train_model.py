import joblib
import re
import random
import sqlite3
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def clean_text(text):
    """Nettoyage optimisé pour conserver les technologies critiques."""
    text = text.lower()
    # On garde le + et le # pour C++ et C#
    text = re.sub(r'[^a-z0-9+#]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def train_model():
    X, y = [], []

    try:
        # 1. Extraction des données
        conn = sqlite3.connect("jobs_skills.db")
        cur = conn.cursor()
        cur.execute("""
            SELECT jr.name, GROUP_CONCAT(js.skill) 
            FROM job_roles jr 
            JOIN job_skills js ON jr.id = js.job_role_id 
            GROUP BY jr.name
        """)
        rows = cur.fetchall()
        roles_list = [r[0] for r in rows]
        conn.close()

        if not rows:
            print("❌ Erreur : La base de données est vide.")
            return

        # 2. Augmentation de données (Data Augmentation)
        for role, skills in rows:
            skill_list = skills.split(',')
            for _ in range(800): # Augmenté à 800 pour une meilleure stabilité
                # Simulation de CV réalistes (mélange de 30% à 80% des compétences)
                k = random.randint(max(2, int(len(skill_list)*0.3)), int(len(skill_list)*0.8))
                sample = random.sample(skill_list, k=k)

                fillers = ["expérience", "maîtrise", "conception", "projet", "équipe"]
                sample += random.sample(fillers, k=random.randint(1, 3))

                random.shuffle(sample)
                X.append(clean_text(" ".join(sample)))
                if random.random() < 0.08:
                    y.append(random.choice([r for r in roles_list if r != role]))
                else:
                    y.append(role)

        # 3. Split Stratifié
        # 'stratify=y' assure que chaque métier est représenté équitablement dans le test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )

        # 4. Pipeline avec Hyperparamètres ajustés
        # C=0.1 est un bon compromis entre ton 0.01 (trop faible) et 1.0 (trop fort)
        model = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=250, ngram_range=(1, 2))),
            ('clf', LogisticRegression(
                C=0.1,
                class_weight='balanced',
                solver='lbfgs',
                max_iter=1000
            ))
        ])

        print("⏳ Entraînement du modèle intelligent...")
        model.fit(X_train, y_train)

        # 5. Évaluation complète
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)

        print("\n" + "="*45)
        print(f"🎯 ACCURACY RÉALISTE : {acc:.2%}")
        print("="*45)

        # Le Data Scientist regarde toujours le rapport détaillé
        print("\n📊 RAPPORT DE CLASSIFICATION :")
        print(classification_report(y_test, y_pred))

        # 6. Exportation
        joblib.dump(model, 'cv_model.pkl')
        print("✅ Modèle 'cv_model.pkl' sauvegardé avec succès.")

    except Exception as e:
        print(f"❌ Erreur critique : {e}")

if __name__ == "__main__":
    train_model()