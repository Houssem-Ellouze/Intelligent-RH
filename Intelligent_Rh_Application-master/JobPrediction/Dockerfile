# 1. Image de base légère mais compatible avec les bibliothèques de Data Science
FROM python:3.11-slim

# 2. Variables d'environnement pour éviter les fichiers .pyc et bufferiser les logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Répertoire de travail
WORKDIR /app

# 4. Installation des dépendances système nécessaires pour scikit-learn et SQLite
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Mise à jour de pip et installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copier le reste du code source
COPY . .

# 7. Création d'un utilisateur non-root pour la sécurité
# Important : SQLite a besoin de droits d'écriture sur le DOSSIER parent
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# 8. Exposition du port Flask
EXPOSE 5000

# 9. Commande de lancement
# L'utilisation de --host=0.0.0.0 est CRUCIAL pour Docker
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]