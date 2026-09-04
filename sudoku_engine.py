# Author: Harshitha
# Sudoku Generation and Backtracking Validation Engine

import random
from typing import List, Tuple

Grid = List[List[int]]

class SudokuEngine:
    @staticmethod
    def is_placement_valid(board: Grid, row: int, col: int, val: int) -> bool:
        for i in range(9):
            if board[row][i] == val or board[i][col] == val:
                return False
        sub_row, sub_col = 3 * (row // 3), 3 * (col // 3)
        for r in range(sub_row, sub_row + 3):
            for c in range(sub_col, sub_col + 3):
                if board[r][c] == val:
                    return False
        return True

    @classmethod
    def _fill_grid(cls, board: Grid) -> bool:
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    candidates = list(range(1, 10))
                    random.shuffle(candidates)
                    for val in candidates:
                        if cls.is_placement_valid(board, r, c, val):
                            board[r][c] = val
                            if cls._fill_grid(board):
                                return True
                            board[r][c] = 0
                    return False
        return True

    @classmethod
    def generate_completed_grid(cls) -> Grid:
        board: Grid = [[0] * 9 for _ in range(9)]
        cls._fill_grid(board)
        return board

    @classmethod
    def create_puzzle(cls, difficulty: str = "medium") -> Tuple[Grid, Grid]:
        solution = cls.generate_completed_grid()
        puzzle = [row[:] for row in solution]
        removal_map = {"easy": 30, "medium": 42, "hard": 52}
        cells_to_clear = removal_map.get(difficulty.lower(), 42)
        indices = [(r, c) for r in range(9) for c in range(9)]
        random.shuffle(indices)
        for r, c in indices[:cells_to_clear]:
            puzzle[r][c] = 0
        return puzzle, solution

    @classmethod
    def verify_solution(cls, user_board: Grid, solution: Grid) -> bool:
        return user_board == solution

