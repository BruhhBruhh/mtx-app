// src/components/MintingProgress.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Zap, Clock, CheckCircle2, AlertTriangle, Pause, Play, Square } from 'lucide-react';

const MintingProgress = ({ 
  isMinting, 
  progress, 
  currentTransaction, 
  logs, 
  onStop,
  onPause,
  onResume,
  isPaused = false
}) => {
  if (!isMinting && (!logs || logs.length === 0)) {
    return null;
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-yellow-300';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleStop = () => {
    if (onStop) {
      // Confirm stop action
      const confirmStop = window.confirm(
        'Are you sure you want to stop minting? The current transaction will complete first.'
      );
      if (confirmStop) {
        onStop();
      }
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-600 mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Minting Progress
            {isPaused && <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">Paused</Badge>}
            {!isMinting && logs?.length > 0 && <Badge variant="outline" className="text-gray-400">Complete</Badge>}
          </CardTitle>
          
          {/* Control Buttons */}
          {isMinting && (
            <div className="flex gap-2">
              {onPause && onResume && (
                <Button 
                  onClick={isPaused ? onResume : onPause}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                onClick={handleStop}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isMinting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-white font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Current Transaction Status */}
        {currentTransaction && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="font-mono bg-gray-700 text-gray-100">
                Transaction {currentTransaction.index}/{currentTransaction.total}
              </Badge>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isPaused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'
                }`} />
                <span className="text-sm font-medium text-gray-300">
                  {isPaused ? 'Paused' : 'Processing...'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {/* Rainbow Mode Display */}
              {currentTransaction.group && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Power Group:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${
                        currentTransaction.powerGroup === 7 ? 'bg-purple-500' :
                        currentTransaction.powerGroup === 6 ? 'bg-blue-500' :
                        currentTransaction.powerGroup === 5 ? 'bg-cyan-500' :
                        currentTransaction.powerGroup === 4 ? 'bg-green-500' :
                        currentTransaction.powerGroup === 3 ? 'bg-yellow-500' :
                        currentTransaction.powerGroup === 2 ? 'bg-red-500' :
                        currentTransaction.powerGroup === 1 ? 'bg-gray-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-white font-medium">{currentTransaction.group}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Term Length:</span>
                    <span className="text-white">{currentTransaction.term} days</span>
                  </div>
                </>
              )}
              
              {/* Ladder Mode Display */}
              {currentTransaction.batch && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Term:</span>
                    <span className="text-white">{currentTransaction.term} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Batch:</span>
                    <span className="text-white">{currentTransaction.batch}/{currentTransaction.batches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Power Group:</span>
                    <span className="text-white font-mono">PG {currentTransaction.powerGroup}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-400">VMUs:</span>
                <span className="text-white font-mono">{currentTransaction.vmu || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Logs */}
        {logs && logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-300">Transaction Log</h4>
              <Badge variant="outline" className="text-xs">
                {logs.length} entries
              </Badge>
            </div>
            <ScrollArea className="h-64 w-full rounded-md border border-gray-700 bg-gray-900/50">
              <div className="p-3 space-y-2">
                {logs.slice().reverse().map((log, index) => (
                  <div 
                    key={`${log.timestamp}-${index}`}
                    className="flex items-start gap-2 text-sm py-2 px-2 rounded hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {typeof log.timestamp === 'string' ? log.timestamp : formatTimestamp(log.timestamp)}
                        </span>
                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                          {log.type}
                        </Badge>
                      </div>
                      <p className={`${getLogTextColor(log.type)} break-words leading-relaxed`}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Session Summary */}
        {!isMinting && logs && logs.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Session Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-900/50 rounded">
                <div className="text-lg font-bold text-green-400">
                  {logs.filter(log => log.type === 'success').length}
                </div>
                <div className="text-gray-400 text-xs">Successful</div>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded">
                <div className="text-lg font-bold text-red-400">
                  {logs.filter(log => log.type === 'error').length}
                </div>
                <div className="text-gray-400 text-xs">Failed</div>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded">
                <div className="text-lg font-bold text-yellow-400">
                  {logs.filter(log => log.type === 'warning').length}
                </div>
                <div className="text-gray-400 text-xs">Warnings</div>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded">
                <div className="text-lg font-bold text-blue-400">
                  {logs.length}
                </div>
                <div className="text-gray-400 text-xs">Total Logs</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {isMinting && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0">
                ℹ️
              </div>
              <div className="text-blue-200 text-sm">
                <p className="font-medium mb-1">Minting in Progress</p>
                <ul className="text-xs space-y-1 text-blue-200/80">
                  <li>• Keep this browser tab open during minting</li>
                  <li>• Current transaction will complete before stopping</li>
                  <li>• Use pause to temporarily halt between transactions</li>
                  <li>• Stop button immediately prevents new transactions</li>
                  <li>• All transactions use your connected wallet's RPC</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stop Confirmation Message */}
        {!isMinting && logs?.some(log => log.message.includes('stopped by user')) && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200 text-sm">
                <p className="font-medium">Minting Stopped</p>
                <p className="text-xs mt-1">
                  Minting was stopped by user request. You can restart at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MintingProgress;