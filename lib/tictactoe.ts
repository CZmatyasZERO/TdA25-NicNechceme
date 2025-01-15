export type Cell = "X" | "O" | "";
export type Board = Cell[][];

export const createRandomBoard = (steps: number): Board => {
    const boardSize = 15; // Adjusted board size to 15x15
    const board: Board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));

    // Validate steps (maximum of boardSize * boardSize moves)
    steps = Math.min(steps, boardSize * boardSize);

    // Keep track of available cells
    const availableCells: [number, number][] = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            availableCells.push([i, j]);
        }
    }

    // Randomly fill the board
    for (let step = 0; step < steps; step++) {
        const turn = step % 2 === 0 ? "X" : "O"; // Alternate turns between X and O
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const [row, col] = availableCells.splice(randomIndex, 1)[0]; // Remove the chosen cell from available cells
        board[row][col] = turn;
    }

    return board;
};

// Function to create an empty board
export const createEmptyBoard = (): Board => {
    return Array.from({ length: 15 }, () => Array(15).fill(""));
};

type BoardValidationResult = {
    valid: boolean;
    message?: string;
};

export const isValidBoard = (board: Board): BoardValidationResult => {
    const boardSize = 15;

    const isValidSize = board.length === boardSize && board.every(row => row.length === boardSize);
    if (!isValidSize) {
        return {
            valid: false,
            message: "Board size is incorrect. It must be 15x15."
        };
    }
    
    const flatBoard = board.flat();
    const isValidCells = flatBoard.every(cell => cell === "X" || cell === "O" || cell === "");
    if (!isValidCells) {
        return {
            valid: false,
            message: "Board contains invalid cells. Allowed values are 'X', 'O', and ''."
        };
    }

    // Count the number of "X" and "O"
    const xCount = flatBoard.filter(cell => cell === "X").length;
    const oCount = flatBoard.filter(cell => cell === "O").length;

    // X must start, hence xCount must be equal to oCount or be exactly one more
    const isValidMoveCount = xCount === oCount || xCount === oCount + 1;
    if (!isValidMoveCount) {
        return {
            valid: false,
            message: "Invalid number of moves. 'X' must start and can have at most one more move than 'O'."
        };
    }

    return {
        valid: true
    };
};

type GameResult = {
    finished: boolean;
    winner?: "X" | "O";
};

export const checkGameEnd = (board: Board): GameResult => {
    const boardSize = 15;
    const winLength = 5;

    const checkLine = (line: Cell[]): "X" | "O" | null => {
        for (let i = 0; i <= line.length - winLength; i++) {
            let subArray = line.slice(i, i + winLength);
            if (subArray.every(cell => cell === "X")) {
                return "X";
            }
            if (subArray.every(cell => cell === "O")) {
                return "O";
            }
        }
        return null;
    };

    // Check rows
    for (let i = 0; i < boardSize; i++) {
        const rowWinner = checkLine(board[i]);
        if (rowWinner) return { finished: true, winner: rowWinner };
    }

    // Check columns
    for (let i = 0; i < boardSize; i++) {
        const column = board.map(row => row[i]);
        const columnWinner = checkLine(column);
        if (columnWinner) return { finished: true, winner: columnWinner };
    }

    // Check diagonals
    // Bottom-left to top-right
    for (let i = -boardSize + 1; i < boardSize; i++) {
        const diagonal: Cell[] = [];
        for (let j = 0; j < boardSize; j++) {
            const row = i + j;
            if (row >= 0 && row < boardSize) {
                diagonal.push(board[row][j]);
            }
        }
        const diagonalWinner = checkLine(diagonal);
        if (diagonalWinner) return { finished: true, winner: diagonalWinner };
    }

    // Top-left to bottom-right
    for (let i = 0; i < 2 * boardSize - 1; i++) {
        const diagonal: Cell[] = [];
        for (let j = 0; j < boardSize; j++) {
            const row = i - j;
            if (row >= 0 && row < boardSize) {
                diagonal.push(board[row][j]);
            }
        }
        const diagonalWinner = checkLine(diagonal);
        if (diagonalWinner) return { finished: true, winner: diagonalWinner };
    }

    // If no winner and any empty cell exists, game is not finished
    if (board.flat().some(cell => cell === "")) {
        return { finished: false };
    }

    // If all cells are filled and no winner, it's a draw
    return { finished: true, winner: undefined };
};

export type Move = { x: number, y: number };

export const getAvailableMoves = (board: Board): Move[] => {
    const moves: Move[] = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "") {
                moves.push({ x: i, y: j });
            }
        }
    }
    
    return moves;
}
type EvaluationResult = {
    score: number;
    move: Move | null;
};



export const getWinningMove = (board: Board, player: "X" | "O"): Move | null => {
    const availableMoves = getAvailableMoves(board);
    for(let i = 0; i < availableMoves.length; i++) {
        const move = availableMoves[i]
        let newBoard = copyBoard(board)
        newBoard[move.x][move.y] = player
        let result = checkGameEnd(newBoard)
        if(result.winner === player) {
            return move
        }
    }
    return null
}

export const findBestMove = (board: Board, player: "X" | "O", timeLimit: number): Move => {
    const winMove = getWinningMove(board, player)
    if(winMove) {
        return winMove
    }
    const loseMove = getWinningMove(board, player === "X" ? "O" : "X")
    if(loseMove) {
        return loseMove
    }
    return RandomMove(board, player)
}

export const RandomMove = (board: Board, player: "X" | "O"): Move => {
    const moves = getAvailableMoves(board)
    const randomIndex = Math.floor(Math.random() * moves.length)
    return moves[randomIndex]
}

export const copyBoard = (board: Board): Board => {
    let newBoard: Board = []
    board.forEach(row => {
        newBoard.push(Array.from(row))
    })
    return newBoard
}


const MAX_DEPTH = 3;
