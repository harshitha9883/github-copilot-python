# Author: Harshitha
# Web server API endpoints for Sudoku Web Application

from flask import Flask, jsonify, render_template, request
from sudoku_engine import SudokuEngine

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/puzzle", methods=["GET"])
def get_puzzle():
    difficulty = request.args.get("difficulty", "medium")
    puzzle, solution = SudokuEngine.create_puzzle(difficulty)
    return jsonify({"status": "success", "difficulty": difficulty, "puzzle": puzzle, "solution": solution})

@app.route("/api/validate", methods=["POST"])
def validate_solution():
    payload = request.get_json(silent=True) or {}
    user_grid = payload.get("board")
    solution_grid = payload.get("solution")
    if not user_grid or not solution_grid:
        return jsonify({"status": "error", "message": "Missing board data"}), 400
    is_valid = SudokuEngine.verify_solution(user_grid, solution_grid)
    return jsonify({"status": "success", "is_correct": is_valid})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

