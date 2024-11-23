import style from "./app.module.css";
import { useEffect, useState } from "react";
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

function randomaizeArrayOrder(arr) {
  const arrLength = arr.length;
  const result = [];
  const indexesUsed = [];

  arr.forEach((item) => {
    let randomIndex = Math.floor(Math.random() * arrLength);
    while (indexesUsed.includes(randomIndex)) {
      randomIndex = Math.floor(Math.random() * arrLength);
    }

    if (randomIndex || randomIndex === 0) {
      indexesUsed.push(randomIndex);
      result[randomIndex] = item;
    }
  });

  return result;
}

function App() {
  const [cardSrcRandomized, setCardSrcRandomized] = useState(
    randomaizeArrayOrder(cardSrcSequencial)
  );
  const [count, setCount] = useState(0);
  const [cardRevealed, setCardRevealed] = useState(
    Array.from({ length: cardSrcRandomized.length }, () => false)
  );
  const [currentOpened, setCurrentOpened] = useState(null);
  const [peekedIndexes, setPeekedIndexes] = useState([null, null]);
  const isNotMatchedAndShouldWait = !peekedIndexes.includes(null);
  const won = !cardRevealed.includes(false);

  const [bestScore, setBestScore] = useState(localStorage.getItem("bestScore"));

  useEffect(
    function () {
      // if the two cards didn't match then close them
      if (isNotMatchedAndShouldWait) {
        setTimeout(() => {
          setCardRevealed((curr) => {
            const changed = curr.slice();
            changed[peekedIndexes[0]] = false;
            changed[peekedIndexes[1]] = false;
            return changed;
          });
          setPeekedIndexes([null, null]);
        }, 1000);
      }

      if (won) {
        if (bestScore === null) {
          localStorage.setItem("bestScore", count);
          setBestScore(count);
        } else {
          if (Number(bestScore) > count) {
            localStorage.setItem("bestScore", count);
            setBestScore(count);
          }
        }
      }
    },
    [peekedIndexes, won]
  );

  function handleCardClick(e, cardIndex, isCovered) {
    e.preventDefault();

    if (!isCovered || isNotMatchedAndShouldWait) {
      // nothing happens if you click one that's already opened
      return;
    }

    setCount((curr) => curr + 1);

    setCardRevealed((curr) => {
      const changed = curr.slice();
      changed[cardIndex] = true;
      return changed;
    });

    const opened = cardSrcRandomized[cardIndex].split("-")[0];

    if (!currentOpened) {
      setCurrentOpened(opened);
      setPeekedIndexes([cardIndex, null]);
    } else {
      if (currentOpened !== opened) {
        setCurrentOpened(null);
        setPeekedIndexes((curr) => {
          const changed = curr.slice();
          changed[1] = cardIndex;
          return changed;
        });
      } else {
        // when it matches
        setCurrentOpened(null);
        setPeekedIndexes([null, null]);
      }
    }
  }

  function playAgain() {
    setCount(0);
    setCardRevealed(
      Array.from({ length: cardSrcRandomized.length }, () => false)
    );
    setCardSrcRandomized(randomaizeArrayOrder(cardSrcSequencial));
  }

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
              isNotMatchedAndShouldWait && style.cannotClick
            }`}
            src={`/assets/${cardRevealed[index] ? cardSrc : "cover"}.png`}
            alt="memory game card"
            onClick={(e) => handleCardClick(e, index, !cardRevealed[index])}
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
