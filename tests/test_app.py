import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_index_route(client):
    res = client.get("/")
    assert res.status_code == 200

def test_puzzle_api_structure(client):
    res = client.get("/api/puzzle?difficulty=easy")
    assert res.status_code == 200
    data = res.get_json()
    assert "puzzle" in data
    assert "solution" in data
    assert len(data["puzzle"]) == 9
