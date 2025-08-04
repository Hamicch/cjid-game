'use client';

import { useState, useEffect, useRef } from 'react';
import { acronyms, shuffleArray, generateUserId, type Player, type Acronym } from '@/lib/gameData';

const GAME_DURATION = 120000; // 2 minutes in milliseconds

export default function Game() {
  const [userId, setUserId] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [currentAcronym, setCurrentAcronym] = useState('');
  const [scrambledText, setScrambledText] = useState('');
  const [message, setMessage] = useState('Welcome! The first question will appear shortly.');
  const [timeLeft, setTimeLeft] = useState('02:00');
  const [players, setPlayers] = useState<Player[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Acronym[]>([]);
  const [answerInput, setAnswerInput] = useState('');
  const [isAnswerDisabled, setIsAnswerDisabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const mainTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate user ID only on client side
  useEffect(() => {
    setIsClient(true);
    setUserId(generateUserId());
  }, []);

  // Polling for leaderboard updates
  useEffect(() => {
    const pollLeaderboard = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };

    // Initial fetch
    pollLeaderboard();

    // Set up polling
    const interval = setInterval(pollLeaderboard, 1000);
    pollingInterval.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, []);

  const joinGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter a name.');
      return;
    }

    if (!userId) {
      alert('Please wait for your user ID to be generated.');
      return;
    }

    try {
      await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, name: playerName, score: 0 }),
      });

      setShowNameInput(false);
      if (!gameActive) {
        startGame();
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setMessage('Failed to join. Please try again.');
    }
  };

  const startGame = () => {
    setGameActive(true);
    setMessage('Get ready...');
    setScrambledText('');
    setGameQuestions([...acronyms]);
    startMainTimer();

    // Use a callback that doesn't depend on gameActive state
    setTimeout(() => {
      showNextQuestion(true, [...acronyms]); // Pass questions directly
    }, 3000);
  };

  const startMainTimer = () => {
    if (mainTimerInterval.current) {
      clearInterval(mainTimerInterval.current);
    }

    const endTime = Date.now() + GAME_DURATION;

    mainTimerInterval.current = setInterval(() => {
      const timeLeft = endTime - Date.now();
      if (timeLeft <= 0) {
        if (mainTimerInterval.current) {
          clearInterval(mainTimerInterval.current);
        }
        endGame("Time's Up! Game Over.");
        return;
      }
      const minutes = Math.floor((timeLeft / 1000) / 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
  };

  const endGame = (endMessage: string) => {
    setGameActive(false);
    if (mainTimerInterval.current) {
      clearInterval(mainTimerInterval.current);
    }
    setMessage(endMessage);
    setScrambledText("Thanks for playing!");
    setIsAnswerDisabled(true);
    setTimeLeft("00:00");
  };

  const showNextQuestion = (isFirstQuestion = false, questionsOverride?: Acronym[]) => {
    // Skip gameActive check for the first question
    if (!isFirstQuestion && !gameActive) return;

    const questionsToUse = questionsOverride || gameQuestions;

    if (questionsToUse.length === 0) {
      endGame("Game Over! You've completed all the acronyms.");
      return;
    }

    setMessage('');
    setAnswerInput('');
    setIsAnswerDisabled(false);

    const questionIndex = Math.floor(Math.random() * questionsToUse.length);
    const question = questionsToUse[questionIndex];
    const remainingQuestions = questionsToUse.filter((_, index) => index !== questionIndex);

    setCurrentAcronym(question.acronym);
    setGameQuestions(remainingQuestions);

    const words = question.definition.split(' ');
    const scrambledWords = shuffleArray(words);
    setScrambledText(scrambledWords.join(' '));
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive || isAnswerDisabled) return;

    const userAnswer = answerInput.trim().toUpperCase();
    setIsAnswerDisabled(true);

    if (userAnswer === currentAcronym) {
      const scoreToAdd = 1;
      setMessage(`Correct! +${scoreToAdd} point.`);
      await updateScore(scoreToAdd);
    } else {
      setMessage(`Incorrect. The answer was ${currentAcronym}.`);
    }

    setTimeout(() => showNextQuestion(), 2000);
  };

  const updateScore = async (points: number) => {
    if (!userId || points === 0) return;

    try {
      const currentPlayer = players.find(p => p.id === userId);
      const currentScore = currentPlayer?.score || 0;
      const newScore = Math.max(0, currentScore + points);

      await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, name: playerName, score: newScore }),
      });
    } catch (error) {
      console.error('Failed to update score:', error);
    }
  };

  const resetScores = async () => {
    try {
      await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      setMessage('All scores have been reset!');

      // Restart the game
      if (mainTimerInterval.current) {
        clearInterval(mainTimerInterval.current);
      }
      startGame();
    } catch (error) {
      console.error('Error resetting scores:', error);
      alert('Failed to reset scores.');
    } finally {
      setShowResetModal(false);
    }
  };

  return (
    <div className="p-4 mx-auto w-full max-w-6xl md:p-6">
              <div className="mb-6 text-center">
          <div className="flex justify-between items-center mb-4">
            <a
              href="/admin"
              className="text-sm text-gray-400 hover:text-yellow-400 transition-colors"
            >
              Admin Dashboard →
            </a>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 md:text-5xl">
            CJID and Media Ecosystem Scramble Dash
          </h1>
          <p className="mt-2 text-gray-400">
            Unscramble the definition and type the correct acronym! Your User ID:
            <span className="px-2 py-1 ml-2 font-mono bg-gray-700 rounded">
              {isClient ? (userId || 'Generating...') : 'Loading...'}
            </span>
          </p>
        </div>

      {/* Player Name Input */}
      {showNameInput && (
        <div className="flex gap-4 justify-center items-center mb-6">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full max-w-xs p-2.5"
            required
          />
          <button
            onClick={joinGame}
            className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Join Game
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${showNameInput ? 'hidden' : ''}`}>
        {/* Game Area */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold">Game Arena</h2>
            <div className="text-right">
              <span className="text-xl font-semibold text-yellow-400">Time Left:</span>
              <span className="ml-2 font-mono text-2xl text-yellow-400">{timeLeft}</span>
            </div>
          </div>
                      <div id="game-area">
              <div className="p-8 w-full text-center">
                <p className="mb-6 text-xl text-gray-300">{message}</p>
                <p className="mb-6 text-3xl font-bold leading-relaxed text-yellow-300">{scrambledText}</p>
                {message !== 'Get ready...' && (
                  <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-3 justify-center items-center mx-auto max-w-sm sm:flex-row">
                    <input
                      type="text"
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Type acronym here"
                      className="block p-3 w-full text-lg text-center text-white uppercase bg-gray-700 rounded-lg border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                      autoComplete="off"
                      disabled={isAnswerDisabled}
                    />
                    <button
                      type="submit"
                      disabled={isAnswerDisabled}
                      className="px-8 py-3 w-full text-lg font-medium text-center text-black bg-yellow-400 rounded-lg sm:w-auto hover:bg-yellow-500 disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </form>
                )}
              </div>
            </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold">Leaderboard</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const pollLeaderboard = async () => {
                    try {
                      const response = await fetch('/api/players');
                      const data = await response.json();
                      setPlayers(data);
                    } catch (error) {
                      console.error('Failed to fetch players:', error);
                    }
                  };
                  pollLeaderboard();
                }}
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 text-sm font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Reset Game
              </button>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg h-[50vh] overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-gray-500">Waiting for players...</p>
            ) : (
              players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 rounded-lg mb-2 ${
                      player.id === userId ? 'bg-yellow-500/30' : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 text-lg font-bold">{index + 1}</span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <span className="text-xl font-semibold">{player.score}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="mb-4 text-xl font-semibold">Reset Game?</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to reset all scores and start a new game? This cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetScores}
                className="px-6 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="px-6 py-2 font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}