import pytest
from sudoku import Sudoku

def test_valid_placement():
    board = [[0] * 9 for _ in range(9)]
    board[0][0] = 5
    assert Sudoku.is_placement_valid(board, 0, 1, 5) is False
    assert Sudoku.is_placement_valid(board, 1, 0, 5) is False
    assert Sudoku.is_placement_valid(board, 1, 1, 5) is False
    assert Sudoku.is_placement_valid(board, 0, 1, 7) is True

def test_unique_solution_guarantee():
    puzzle, solution = Sudoku.generate_puzzle("easy")
    assert len(puzzle) == 9
    assert len(solution) == 9
    assert Sudoku.count_solutions(puzzle) == 1
