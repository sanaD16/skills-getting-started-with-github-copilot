from fastapi.testclient import TestClient

from src.app import app

client = TestClient(app)


def test_signup_updates_activity_participants_immediately():
    email = "newstudent@mergington.edu"

    response = client.post("/activities/Basketball Team/signup?email=" + email)

    assert response.status_code == 200
    assert email in client.get("/activities").json()["Basketball Team"]["participants"]

    # Clean up for idempotent reruns
    client.delete("/activities/Basketball Team/unregister?email=" + email)


def test_unregister_participant():
    response = client.delete("/activities/Chess Club/unregister?email=michael@mergington.edu")

    assert response.status_code == 200
    assert "michael@mergington.edu" in response.json()["message"]
    assert "michael@mergington.edu" not in client.get("/activities").json()["Chess Club"]["participants"]

    # Clean up for idempotent test reruns
    client.post("/activities/Chess Club/signup?email=michael@mergington.edu")
