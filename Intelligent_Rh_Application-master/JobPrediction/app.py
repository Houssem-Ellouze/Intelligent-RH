import sqlite3
import joblib
import re
import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

try:
    ML_MODEL = joblib.load('cv_model.pkl')
except:
    ML_MODEL = None

def get_weighted_skills():
    repo = {}
    with sqlite3.connect("jobs_skills.db") as conn:
        cur = conn.cursor()
        cur.execute("SELECT jr.name, js.skill, js.weight FROM job_roles jr JOIN job_skills js ON jr.id = js.job_role_id")
        for job, skill, weight in cur.fetchall():
            if job not in repo: repo[job] = []
            repo[job].append((skill, weight))
    return repo

@app.route('/predict_cv', methods=['POST'])
def analyze_cv():
    if 'cv' not in request.files or not ML_MODEL:
        return jsonify({"success": False, "message": "Fichier ou Modèle absent"}), 400

    file = request.files['cv']
    with pdfplumber.open(file) as pdf:
        cv_text = " ".join([p.extract_text() or "" for p in pdf.pages]).lower()

    repo = get_weighted_skills()
    probs = ML_MODEL.predict_proba([cv_text])[0]

    results = []
    for i, job_name in enumerate(ML_MODEL.classes_):
        ml_score = probs[i] * 100

        job_skills = repo.get(job_name, [])
        found = [s for s, w in job_skills if re.search(r'\b' + re.escape(s) + r'\b', cv_text)]

        total_w = sum(w for s, w in job_skills)
        earned_w = sum(w for s, w in job_skills if s in found)
        skills_score = (earned_w / total_w * 100) if total_w > 0 else 0

        # Score Hybride : 60% Compétences réelles, 40% Contexte IA
        final_match = round((skills_score * 0.6) + (ml_score * 0.4), 2)

        results.append({
            "job": job_name,
            "match_percentage": final_match,
            "details": {
                "ai_confidence": round(ml_score, 2),
                "skills_match": round(skills_score, 2),
                "found": found,
                "missing": [s for s, w in job_skills if s not in found]
            }
        })

    top_matches = sorted(results, key=lambda x: x['match_percentage'], reverse=True)[:3]
    return jsonify({
        "success": True,
        "best_job": top_matches[0]["job"],
        "match_percentage": top_matches[0]["match_percentage"],
        "top_matches": top_matches
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)