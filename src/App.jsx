import { useEffect, useReducer } from "react";
import style from "./app.module.css";
import Button from "./ui/Button";

const cardSrcSequencial = [
  "helmet-1",
  "potion-1",
  "ring-1",
  "scroll-1",
  "shield-1",
  "sword-1",
  "helmet-2",
  "potion-2",
  "ring-2",
  "scroll-2",
  "shield-2",
  "sword-2",
];

function shuffleArray(arr) {
  return arr
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Preload images
function preloadImages(images) {
  images.forEach((image) => {
    const img = new Image();
    img.src = `/assets/${image}.png`;
  });
}

// Initial game state
const initialState = (cards) => ({
  cardSrcRandomized: shuffleArray(cards),
  cardRevealed: Array(cards.length).fill(false),
  peekedIndexes: [],
  currentOpened: null,
  count: 0,
  bestScore: localStorage.getItem("bestScore"),
  won: false,
});

// Reducer to manage game state
function gameReducer(state, action) {
  switch (action.type) {
    case "REVEAL_CARD": {
      const { cardIndex, cardName } = action.payload;
      const newRevealed = [...state.cardRevealed];
      newRevealed[cardIndex] = true;

      if (state.peekedIndexes.length === 0) {
        return {
          ...state,
          cardRevealed: newRevealed,
          peekedIndexes: [cardIndex],
          currentOpened: cardName,
          count: state.count + 1,
        };
      }

      const [firstIndex] = state.peekedIndexes;
      const firstCardName = state.cardSrcRandomized[firstIndex].split("-")[0];

      if (firstCardName !== cardName) {
        return {
          ...state,
          cardRevealed: newRevealed,
          peekedIndexes: [firstIndex, cardIndex],
          count: state.count + 1,
        };
      }

      // Cards matched
      const won = newRevealed.every(Boolean);
      const bestScore =
        won && (!state.bestScore || state.count + 1 < state.bestScore)
          ? state.count + 1
          : state.bestScore;

      if (won) {
        localStorage.setItem("bestScore", bestScore);
      }

      return {
        ...state,
        cardRevealed: newRevealed,
        peekedIndexes: [],
        currentOpened: null,
        count: state.count + 1,
        won,
        bestScore,
      };
    }

    case "HIDE_CARDS": {
      const [firstIndex, secondIndex] = state.peekedIndexes;
      const newRevealed = [...state.cardRevealed];
      newRevealed[firstIndex] = false;
      newRevealed[secondIndex] = false;

      return {
        ...state,
        cardRevealed: newRevealed,
        peekedIndexes: [],
        currentOpened: null,
      };
    }

    case "RESET_GAME":
      return initialState(state.cardSrcRandomized);

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    cardSrcSequencial,
    initialState
  );

  const {
    cardSrcRandomized,
    cardRevealed,
    peekedIndexes,
    count,
    won,
    bestScore,
  } = state;

  useEffect(() => {
    if (peekedIndexes.length === 2) {
      const timeout = setTimeout(() => dispatch({ type: "HIDE_CARDS" }), 700);
      return () => clearTimeout(timeout);
    }
  }, [peekedIndexes]);

  useEffect(() => {
    // Preload all card images
    preloadImages([...cardSrcSequencial, "cover"]);
  }, []);

  const handleCardClick = (index) => {
    if (cardRevealed[index] || peekedIndexes.length === 2) return;

    const cardName = cardSrcRandomized[index].split("-")[0];
    dispatch({ type: "REVEAL_CARD", payload: { cardIndex: index, cardName } });
  };

  const playAgain = () => {
    dispatch({ type: "RESET_GAME" });
  };

  return (
    <div className={style.container}>
      {!won && (
        <p className={style.stat}>
          Click count: <strong>{count}</strong>
        </p>
      )}
      {won && (
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <p className={style.stat}>
            You pressed <strong>{count}</strong> times to win!
          </p>
          <Button onClick={playAgain} className={style.noLineBreak}>
            Play again
          </Button>
        </div>
      )}

      <div className={style.cardContainer}>
        {cardSrcRandomized.map((cardSrc, index) => (
          <img
            key={cardSrc}
            className={`${style.card} ${
              peekedIndexes.length === 2 && style.cannotClick
            }`}
            src={`/assets/${cardRevealed[index] ? cardSrc : "cover"}.png`}
            alt="memory game card"
            onClick={() => handleCardClick(index)}
            draggable={false}
          />
        ))}
      </div>

      {bestScore && (
        <p className={style.stat}>
          Highest record (least pressed): <strong>{bestScore}</strong>
        </p>
      )}
    </div>
  );
}

export default App;
