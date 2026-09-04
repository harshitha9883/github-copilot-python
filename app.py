# Author: Harshitha
# Flask REST API Controller
from flask import Flask, jsonify, render_template, request
from sudoku import Sudoku

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/puzzle", methods=["GET"])
def get_puzzle():
    difficulty = request.args.get("difficulty", "medium")
    puzzle, solution = Sudoku.generate_puzzle(difficulty)
    return jsonify({
        "status": "success",
        "difficulty": difficulty,
        "puzzle": puzzle,
        "solution": solution
    })

@app.route("/api/validate", methods=["POST"])
def validate_board():
    payload = request.get_json(silent=True) or {}
    board = payload.get("board")
    solution = payload.get("solution")

    if not board or not solution:
        return jsonify({"status": "error", "message": "Missing puzzle data"}), 400

    is_correct = Sudoku.check_solution(board, solution)
    return jsonify({
        "status": "success",
        "is_correct": is_correct
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
