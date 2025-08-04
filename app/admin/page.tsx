'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/lib/gameData';

export default function AdminDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch players data
  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 2 seconds
  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const totalPlayers = players.length;
  const totalScore = players.reduce((sum, player) => sum + player.score, 0);
  const averageScore = totalPlayers > 0 ? (totalScore / totalPlayers).toFixed(1) : '0';
  const topPlayer = players.length > 0 ? players.reduce((max, player) =>
    player.score > max.score ? player : max
  ) : null;

  const resetScores = async () => {
    if (!confirm('Are you sure you want to reset all scores? This cannot be undone.')) {
      return;
    }

    try {
      await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      fetchPlayers(); // Refresh data
    } catch (error) {
      console.error('Failed to reset scores:', error);
      alert('Failed to reset scores');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(players, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `players-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Real-time monitoring of player scores and game activity
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span>Last updated: {isClient ? lastUpdated.toLocaleTimeString() : 'Loading...'}</span>
            <span>•</span>
            <span>{totalPlayers} active players</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Players</h3>
            <p className="text-3xl font-bold text-white">{totalPlayers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Score</h3>
            <p className="text-3xl font-bold text-green-400">{totalScore}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Average Score</h3>
            <p className="text-3xl font-bold text-blue-400">{averageScore}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Top Score</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {topPlayer ? topPlayer.score : '0'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={resetScores}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Reset All Scores
          </button>
          <button
            onClick={exportData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Export Data
          </button>
          <button
            onClick={fetchPlayers}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Players Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Player Records</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading player data...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No players have joined yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Player Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <tr key={player.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              index === 2 ? 'text-yellow-600' : 'text-gray-400'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {player.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400 font-mono">
                            {player.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-400">
                            {player.score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            player.score > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {player.score > 0 ? 'Active' : 'New'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Dashboard updates automatically every 2 seconds</p>
          <p className="mt-1">Data is stored locally in data/players.json</p>
        </div>
      </div>
    </div>
  );
}