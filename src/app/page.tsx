'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, Question, TableResult, QuestionResult, GameSession, PersonalBests } from '@/types/game';
import { generateQuestions } from '@/lib/gameLogic';
import {
  generateSessionId,
  saveGameSession,
  getPersonalBests,
  getPlayerId
} from '@/lib/storage';
import GameMenu from '@/components/GameMenu';
import Countdown from '@/components/Countdown';
import QuestionCard from '@/components/QuestionCard';
import GameSummary from '@/components/GameSummary';
import PauseOverlay from '@/components/PauseOverlay';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [personalBests, setPersonalBests] = useState<PersonalBests>({});

  // Game progress
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Session data
  const [sessionId, setSessionId] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState('');
  const [tableStartTime, setTableStartTime] = useState(0);
  const [tableResults, setTableResults] = useState<TableResult[]>([]);
  const [currentQuestionResults, setCurrentQuestionResults] = useState<QuestionResult[]>([]);
  const [skippedTables, setSkippedTables] = useState<number[]>([]);

  // Load personal bests on mount
  useEffect(() => {
    setPersonalBests(getPersonalBests());
    getPlayerId(); // Initialize player ID
  }, []);

  const currentTable = selectedTables[currentTableIndex];

  // Start a new game
  const handleStartGame = useCallback((tables: number[]) => {
    setSelectedTables(tables);
    setCurrentTableIndex(0);
    setTableResults([]);
    setSkippedTables([]);
    setSessionId(generateSessionId());
    setSessionStartTime(new Date().toISOString());
    setGameState('countdown');
  }, []);

  // Countdown complete, start questions
  const handleCountdownComplete = useCallback(() => {
    const newQuestions = generateQuestions(currentTable);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setCurrentQuestionResults([]);
    setTableStartTime(Date.now());
    setGameState('playing');
  }, [currentTable]);

  // Handle answer submission
  const handleAnswer = useCallback((answer: string, isCorrect: boolean, timeTakenMs: number) => {
    const question = questions[currentQuestionIndex];

    const result: QuestionResult = {
      question: `${question.multiplier} × ${question.multiplicand}`,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeTakenMs,
      questionType: question.questionType,
    };

    const updatedResults = [...currentQuestionResults, result];
    setCurrentQuestionResults(updatedResults);

    // Check if table is complete
    if (currentQuestionIndex + 1 >= questions.length) {
      // Table complete
      const tableTime = Date.now() - tableStartTime;
      const tableResult: TableResult = {
        table: currentTable,
        timeMs: tableTime,
        questions: updatedResults,
        startedAt: new Date(tableStartTime).toISOString(),
        completedAt: new Date().toISOString(),
      };

      const allTableResults = [...tableResults, tableResult];
      setTableResults(allTableResults);

      // Check if game is complete
      if (currentTableIndex + 1 >= selectedTables.length) {
        // Game complete - save session
        const session: GameSession = {
          id: sessionId,
          startedAt: sessionStartTime,
          completedAt: new Date().toISOString(),
          tableResults: allTableResults,
          skippedTables,
        };
        saveGameSession(session);
        setPersonalBests(getPersonalBests());
        setGameState('summary');
      } else {
        // Move to next table
        setCurrentTableIndex(prev => prev + 1);
        setGameState('countdown');
      }
    } else {
      // Next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [questions, currentQuestionIndex, currentQuestionResults, tableStartTime, currentTable, tableResults, currentTableIndex, selectedTables.length, sessionId, sessionStartTime, skippedTables]);

  // Skip current table
  const handleSkipTable = useCallback(() => {
    setSkippedTables(prev => [...prev, currentTable]);

    if (currentTableIndex + 1 >= selectedTables.length) {
      // No more tables - go to summary
      const session: GameSession = {
        id: sessionId,
        startedAt: sessionStartTime,
        completedAt: new Date().toISOString(),
        tableResults,
        skippedTables: [...skippedTables, currentTable],
      };
      saveGameSession(session);
      setPersonalBests(getPersonalBests());
      setGameState('summary');
    } else {
      // Move to next table
      setCurrentTableIndex(prev => prev + 1);
      setGameState('countdown');
    }
  }, [currentTable, currentTableIndex, selectedTables.length, sessionId, sessionStartTime, tableResults, skippedTables]);

  // Pause/Resume
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  // Quit game
  const handleQuit = () => {
    setIsPaused(false);
    setGameState('menu');
  };

  // Play again (same tables)
  const handlePlayAgain = () => {
    handleStartGame(selectedTables);
  };

  // Back to menu
  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <>
      {/* Menu */}
      {gameState === 'menu' && (
        <GameMenu
          personalBests={personalBests}
          onStartGame={handleStartGame}
        />
      )}

      {/* Countdown */}
      {gameState === 'countdown' && (
        <div className="game-container">
          <Countdown
            table={currentTable}
            onComplete={handleCountdownComplete}
            isPaused={isPaused}
          />
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && questions.length > 0 && (
        <div className="game-container">
          <QuestionCard
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            tableName={currentTable}
            onAnswer={handleAnswer}
            onSkip={handleSkipTable}
            onPause={handlePause}
            isPaused={isPaused}
          />
        </div>
      )}

      {/* Summary */}
      {gameState === 'summary' && (
        <GameSummary
          tableResults={tableResults}
          skippedTables={skippedTables}
          personalBests={personalBests}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Pause overlay */}
      {isPaused && (
        <PauseOverlay onResume={handleResume} onQuit={handleQuit} />
      )}
    </>
  );
}
