import sqlite3

# Référentiel avec Poids (3: Critique, 2: Important, 1: Bonus)
skills_data = {
    "Full Stack Developer": {
        "icon": "fa-layer-group",
        "description": "Expertise transverse Front & Back",
        "skills": [
            ("Java", 3), ("Spring Boot", 3), ("Angular", 3), ("React", 3), ("TypeScript", 3),
            ("SQL", 2), ("PostgreSQL", 2), ("MongoDB", 2), ("Docker", 2), ("REST API", 3),
            ("Next.js", 2), ("Tailwind CSS", 2), ("GraphQL", 1)
        ]
    },
    "Backend Developer": {
        "icon": "fa-server",
        "description": "Architecture robuste et scalable",
        "skills": [
            ("Java", 3), ("Spring Boot", 3), ("Microservices", 3), ("Python", 2), ("PostgreSQL", 3),
            ("Redis", 2), ("Kafka", 2), ("JUnit", 2), ("Docker", 2), ("Design Patterns", 2),
            ("Elasticsearch", 2), ("OAuth2", 3), ("Go", 1)
        ]
    },
    "DevOps Engineer": {
        "icon": "fa-infinity",
        "description": "Automatisation et infrastructure as code",
        "skills": [
            ("Docker", 3), ("Kubernetes", 3), ("Jenkins", 3), ("Terraform", 3), ("Ansible", 3),
            ("AWS", 3), ("CI/CD", 3), ("Linux", 2), ("Bash", 2), ("Prometheus", 2),
            ("GCP", 2), ("Azure", 2), ("Helm", 2), ("CloudWatch", 2)
        ]
    },
    "Data Scientist": {
        "icon": "fa-brain",
        "description": "Analyse prédictive et modèles IA",
        "skills": [
            ("Python", 3), ("Machine Learning", 3), ("Deep Learning", 3), ("Scikit-learn", 3),
            ("Pandas", 3), ("NumPy", 3), ("PyTorch", 2), ("TensorFlow", 2), ("SQL", 3), ("NLP", 2),
            ("R", 1), ("Tableau", 2), ("BigQuery", 2), ("Spark", 2)
        ]
    },
    "QA Engineer": {
        "icon": "fa-vial",
        "description": "Garantie de qualité et automatisation des tests",
        "skills": [
            ("Selenium", 3), ("Cypress", 3), ("JUnit", 3), ("Postman", 3), ("Test Automation", 3),
            ("Agile", 2), ("Jira", 2), ("API Testing", 2), ("Cucumber", 2), ("LoadRunner", 1)
        ]
    },
    "Cloud Architect": {
        "icon": "fa-cloud",
        "description": "Conception de solutions Cloud natives",
        "skills": [
            ("AWS", 3), ("Solutions Architecture", 3), ("Serverless", 3), ("S3", 3), ("Lambda", 3),
            ("IAM", 2), ("VPC", 2), ("CloudFormation", 3), ("Security", 3)
        ]
    }
}

def init_db():
    try:
        with sqlite3.connect("jobs_skills.db") as conn:
            c = conn.cursor()

            # Nettoyage des tables
            c.execute('DROP TABLE IF EXISTS job_skills')
            c.execute('DROP TABLE IF EXISTS job_roles')

            # Création des tables (Ajout de icon et description pour le dashboard)
            c.execute('''CREATE TABLE job_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                name TEXT UNIQUE NOT NULL,
                icon TEXT,
                description TEXT
            )''')

            c.execute('''CREATE TABLE job_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                job_role_id INTEGER, 
                skill TEXT NOT NULL, 
                weight INTEGER DEFAULT 1,
                FOREIGN KEY (job_role_id) REFERENCES job_roles(id)
            )''')

            # Insertion des données
            for job_name, info in skills_data.items():
                # On insère le rôle avec ses métadonnées
                c.execute("INSERT INTO job_roles (name, icon, description) VALUES (?, ?, ?)",
                          (job_name, info['icon'], info['description']))

                job_id = c.lastrowid

                # On boucle spécifiquement sur la liste 'skills' à l'intérieur du dictionnaire
                for skill_name, weight in info['skills']:
                    c.execute("INSERT INTO job_skills (job_role_id, skill, weight) VALUES (?, ?, ?)",
                              (job_id, skill_name.lower(), weight))

            conn.commit()
            print(f"✅ DB initialisée avec {len(skills_data)} métiers et leurs métadonnées.")

    except sqlite3.Error as e:
        print(f"❌ Erreur DB : {e}")

if __name__ == "__main__":
    init_db()