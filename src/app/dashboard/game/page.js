"use client";

import { useEffect, useState } from "react";
import styles from "../dashboard.module.css";

export default function QuizGamePage() {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("loading"); // loading, playing, completed, already-played
  const [timeUntilReset, setTimeUntilReset] = useState("");

  const todayKey = `quiz_completed_${new Date().toISOString().split("T")[0]}`;

  // 1. Initial State Check (Questions & Lock Validation)
  useEffect(() => {
    // Check if user already locked out for today
    const hasPlayedToday = localStorage.getItem(todayKey);
    if (hasPlayedToday) {
      setScore(parseInt(hasPlayedToday, 10));
     setGameState("already-played");
     return;
    }

    async function fetchQuiz() {
      try {
        const res = await fetch("/api/game");
        const data = await res.json();
        if (data.success && data.questions?.length > 0) {
          setQuestions(data.questions);
          setGameState("playing");
        } else {
          setGameState("error");
        }
      } catch (err) {
        setGameState("error");
      }
    }
    fetchQuiz();
  }, [todayKey]);

  // 2. Live Countdown Clock Logic
  useEffect(() => {
    if (gameState !== "completed" && gameState !== "already-played") return;

    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // Target exact next midnight

      const diffMs = tomorrow - now;
      if (diffMs <= 0) {
        clearInterval(timer);
        window.location.reload(); // Refresh to unlock the next day's quiz automatically
        return;
      }

      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // 3. Handle Option Click Selection
  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === questions[currentIdx].answer) {
      setScore((prev) => prev + 1);
    }
  };

  // 4. Move forward / Handle Finish
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Game over! Lock today's score into localStorage
      localStorage.setItem(todayKey, score.toString());
      setGameState("completed");
    }
  };

  // --- RENDER STATES ---
  if (gameState === "loading") {
    return <div className={styles.loading}>Assembling today's English test parameters... 🎮</div>;
  }

  if (gameState === "error" || (questions.length === 0 && gameState === "playing")) {
    return <div className={styles.empty}>Failed loading today's quiz collection. Please try again. ⚠️</div>;
  }

  // Finished or locked display state
  if (gameState === "completed" || gameState === "already-played") {
    return (
      <div className={styles.page}>
        <div className={styles.quizFinishedCard}>
          <h1>{gameState === "completed" ? "🏁 Challenge Completed!" : "🔒 Already Played Today"}</h1>
          <p className={styles.subtitle}>You can test your English logic modules again once the server clocks roll over.</p>
          
          <div className={styles.scoreCircle}>
            <span>{score} / 5</span>
          </div>
          
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <span className={styles.toggleLabel}>Next Questions Unlock In:</span>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#7c3aed", marginTop: "8px", fontFamily: "monospace" }}>
              {timeUntilReset || "Calculating..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className={styles.page}>
      {/* HEADER HUD METRICS */}
      <div className={styles.quizHUD}>
        <span className={styles.hudBadge}>
          Question: <strong>{currentIdx + 1} / {questions.length}</strong>
        </span>
        <span className={`${styles.levelBadge} ${styles[currentQuestion.level]}`}>
          Difficulty: {currentQuestion.level}
        </span>
        <span className={styles.hudBadge}>
          Current Score: <strong>{score}</strong>
        </span>
      </div>

      {/* QUIZ CORE LAYOUT */}
      <div className={styles.quizMainCard}>
        <h2 className={styles.quizQuestionText}>{currentQuestion.question}</h2>

        <div className={styles.optionsStack}>
          {currentQuestion.options.map((option, index) => {
            let optionStyle = styles.optionBtn;
            if (isAnswered) {
              if (option === currentQuestion.answer) {
                optionStyle = `${styles.optionBtn} ${styles.correctOption}`;
              } else if (option === selectedOption) {
                optionStyle = `${styles.optionBtn} ${styles.wrongOption}`;
              } else {
                optionStyle = `${styles.optionBtn} ${styles.fadedOption}`;
              }
            }

            return (
              <button
                key={index}
                className={optionStyle}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={styles.explanationBlock}>
            <h4>
              {selectedOption === currentQuestion.answer ? "✅ Correct Choice" : "❌ Incorrect Choice"}
            </h4>
            <p>{currentQuestion.explanation}</p>
            
            <button onClick={handleNextQuestion} className={styles.nextQuizBtn}>
              {currentIdx + 1 === questions.length ? "Submit & Save Score" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}