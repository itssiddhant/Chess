const socket = io();

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () =>{
    const board = chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowIndex) => {
         row.forEach((square,squareIndex)=>{
            const sqElemnt = document.createElement("div");
            sqElemnt.classList.add(
                "square",
                (rowIndex+squareIndex)%2===0 ?"light":"dark"
            );
            sqElemnt.dataset.row = rowIndex;
            sqElemnt.dataset.col =squareIndex;

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece",
                    square.color ==="w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole ===square.color;
                
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare = {row:rowIndex,col:squareIndex};
                        e.dataTransfer.setData("text/plain","");
                    }
                });
                pieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                });

                sqElemnt.appendChild(pieceElement);
            }
            sqElemnt.addEventListener("dragover",function(e){
                e.preventDefault();
            });

            sqElemnt.addEventListener("drop",function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(sqElemnt.dataset.row),
                        col: parseInt(sqElemnt.dataset.col)
                    };
                    handleMove(sourceSquare,targetSource);
                }
            })
            boardElement.appendChild(sqElemnt);
         })
    });
    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
}
const handleMove = (source,target) =>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q'
    }
    socket.emit("move",move);
}
const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♞",
        B:"♝",
        Q:"♛",
        K:"♚",
    };

    return unicodePieces[piece.type] || "";
}

socket.on("playerRole",function (role){
    playerRole=role;
    renderBoard();
});
socket.on("spectatorRole",function (){
    playerRole=null;
    renderBoard();
});
socket.on("boardState",function (fen){
    chess.load(fen);
    renderBoard();
});
socket.on("move",function (move){
    chess.move(move);
    renderBoard();
});


renderBoard();