import pytest
from app import app
from io import BytesIO

# 🔹 Fake modèle ML
class FakeModel:
    classes_ = ["Data Scientist", "Web Developer"]

    def predict_proba(self, X):
        return [[0.8, 0.2]]

# 🔹 Fake PDF
class FakePage:
    def extract_text(self):
        return "python machine learning sql"

class FakePDF:
    pages = [FakePage()]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


@pytest.fixture
def client(monkeypatch):
    #  Remplacer modèle ML
    monkeypatch.setattr("app.ML_MODEL", FakeModel())

    #  Remplacer pdfplumber
    monkeypatch.setattr("app.pdfplumber.open", lambda x: FakePDF())

    #  Mock DB skills
    monkeypatch.setattr("app.get_weighted_skills", lambda: {
        "Data Scientist": [("python", 3), ("machine learning", 5)],
        "Web Developer": [("html", 2), ("css", 2)]
    })

    with app.test_client() as client:
        yield client


def test_predict_cv_success(client):
    data = {
        "cv": (BytesIO(b"fake pdf content"), "cv.pdf")
    }

    response = client.post("/predict_cv", data=data, content_type="multipart/form-data")

    assert response.status_code == 200

    json_data = response.get_json()

    assert json_data["success"] is True
    assert "best_job" in json_data
    assert len(json_data["top_matches"]) > 0


def test_predict_cv_no_file(client):
    response = client.post("/predict_cv", data={})

    assert response.status_code == 400

    json_data = response.get_json()
    assert json_data["success"] is False