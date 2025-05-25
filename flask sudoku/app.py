from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import copy

app = Flask(__name__)
CORS(app)

class SudokuGenerator:
    def __init__(self):
        self.board = [[0 for _ in range(9)] for _ in range(9)]
    
    def is_valid(self, board, row, col, num):
        # Check row
        for x in range(9):
            if board[row][x] == num:
                return False
        
        # Check column
        for x in range(9):
            if board[x][col] == num:
                return False
        
        # Check 3x3 box
        start_row = row - row % 3
        start_col = col - col % 3
        for i in range(3):
            for j in range(3):
                if board[i + start_row][j + start_col] == num:
                    return False
        
        return True
    
    def solve(self, board):
        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:
                    numbers = list(range(1, 10))
                    random.shuffle(numbers)
                    for num in numbers:
                        if self.is_valid(board, row, col, num):
                            board[row][col] = num
                            if self.solve(board):
                                return True
                            board[row][col] = 0
                    return False
        return True
    
    def generate_complete_board(self):
        board = [[0 for _ in range(9)] for _ in range(9)]
        self.solve(board)
        return board
    
    def create_puzzle(self, complete_board, difficulty=40):
        puzzle = copy.deepcopy(complete_board)
        cells_to_remove = difficulty
        
        while cells_to_remove > 0:
            row = random.randint(0, 8)
            col = random.randint(0, 8)
            
            if puzzle[row][col] != 0:
                puzzle[row][col] = 0
                cells_to_remove -= 1
        
        return puzzle

def validate_solution(board):
    # Check if board is complete
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return False
    
    # Check rows
    for row in range(9):
        if len(set(board[row])) != 9:
            return False
    
    # Check columns
    for col in range(9):
        column = [board[row][col] for row in range(9)]
        if len(set(column)) != 9:
            return False
    
    # Check 3x3 boxes
    for box_row in range(3):
        for box_col in range(3):
            box = []
            for row in range(box_row * 3, box_row * 3 + 3):
                for col in range(box_col * 3, box_col * 3 + 3):
                    box.append(board[row][col])
            if len(set(box)) != 9:
                return False
    
    return True

@app.route('/api/new-game', methods=['GET'])
def new_game():
    difficulty = request.args.get('difficulty', 40, type=int)
    generator = SudokuGenerator()
    complete_board = generator.generate_complete_board()
    puzzle = generator.create_puzzle(complete_board, difficulty)
    
    return jsonify({
        'puzzle': puzzle,
        'solution': complete_board
    })

@app.route('/api/validate', methods=['POST'])
def validate():
    data = request.json
    board = data.get('board')
    
    if not board:
        return jsonify({'error': 'No board provided'}), 400
    
    is_valid = validate_solution(board)
    return jsonify({'valid': is_valid})

@app.route('/api/solve', methods=['POST'])
def solve_puzzle():
    data = request.json
    puzzle = data.get('puzzle')
    
    if not puzzle:
        return jsonify({'error': 'No puzzle provided'}), 400
    
    generator = SudokuGenerator()
    solution = copy.deepcopy(puzzle)
    
    if generator.solve(solution):
        return jsonify({'solution': solution})
    else:
        return jsonify({'error': 'No solution found'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
