# Author: Harshitha
# Core Sudoku Algorithm: Backtracking Solver and Unique Puzzle Generator
import random
from typing import List, Tuple

Grid = List[List[int]]

class Sudoku:
    """Sudoku logic engine handling board generation, solution counting, and masking."""

    @staticmethod
    def is_placement_valid(board: Grid, row: int, col: int, val: int) -> bool:
        for i in range(9):
            if board[row][i] == val or board[i][col] == val:
                return False

        sub_r, sub_c = 3 * (row // 3), 3 * (col // 3)
        for r in range(sub_r, sub_r + 3):
            for c in range(sub_c, sub_c + 3):
                if board[r][c] == val:
                    return False
        return True

    @classmethod
    def fill_board(cls, board: Grid) -> bool:
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    candidates = list(range(1, 10))
                    random.shuffle(candidates)
                    for val in candidates:
                        if cls.is_placement_valid(board, r, c, val):
                            board[r][c] = val
                            if cls.fill_board(board):
                                return True
                            board[r][c] = 0
                    return False
        return True

    @classmethod
    def count_solutions(cls, board: Grid, count: int = 0) -> int:
        """Finds the number of valid solutions (early exits if > 1 to guarantee uniqueness)."""
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    for val in range(1, 10):
                        if cls.is_placement_valid(board, r, c, val):
                            board[r][c] = val
                            count = cls.count_solutions(board, count)
                            board[r][c] = 0
                            if count >= 2:
                                return count
                    return count
        return count + 1

    @classmethod
    def generate_puzzle(cls, difficulty: str = "medium") -> Tuple[Grid, Grid]:
        solution: Grid = [[0] * 9 for _ in range(9)]
        cls.fill_board(solution)
        puzzle: Grid = [row[:] for row in solution]

        removal_limits = {"easy": 26, "medium": 36, "hard": 46}
        target_cleared = removal_limits.get(difficulty.lower(), 36)

        cells = [(r, c) for r in range(9) for c in range(9)]
        random.shuffle(cells)

        cleared = 0
        for r, c in cells:
            if cleared >= target_cleared:
                break
            original = puzzle[r][c]
            puzzle[r][c] = 0

            # Verification of unique solution
            copy_check = [row[:] for row in puzzle]
            if cls.count_solutions(copy_check) != 1:
                puzzle[r][c] = original
            else:
                cleared += 1

        return puzzle, solution

    @classmethod
    def check_solution(cls, user_board: Grid, solution: Grid) -> bool:
        return user_board == solution
