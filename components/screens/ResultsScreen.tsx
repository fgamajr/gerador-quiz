
import React from 'react';
import { QuizResults } from '../../types';
import TrophyIcon from '../icons/TrophyIcon';
import ClockIcon from '../icons/ClockIcon';
import CheckIcon from '../icons/CheckIcon';
import XIcon from '../icons/XIcon';
import RepeatIcon from '../icons/RepeatIcon';

interface ResultsScreenProps {
  results: QuizResults;
  onRestartQuiz: () => void;
  onNewQuiz: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRestartQuiz, onNewQuiz }) => {
  const correctAnswers = results.answers.filter(a => a.isCorrect).length;
  const totalQuestions = results.answers.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const avgTime = totalQuestions > 0 ? (results.answers.reduce((acc, a) => acc + a.timeTaken, 0) / totalQuestions).toFixed(1) : 0;
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-12">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-indigo-900/20 text-center">
        <TrophyIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-4xl font-extrabold text-white">Quiz Finalizado!</h2>
        <p className="text-red-400 font-semibold mt-1">Continue praticando! 💪</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-white">
          <div className="bg-slate-900/50 p-6 rounded-lg">
            <div className="text-4xl font-bold">{correctAnswers}/{totalQuestions}</div>
            <div className="text-gray-400">Acertos</div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-lg">
            <div className="text-4xl font-bold">{percentage}%</div>
            <div className="text-gray-400">Aproveitamento</div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-lg">
            <div className="text-4xl font-bold">{avgTime}s</div>
            <div className="text-gray-400">Tempo médio</div>
          </div>
        </div>
        
        <div className="mt-8">
            <p className="text-gray-300 text-left mb-2">Progresso</p>
            <div className="w-full bg-slate-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
        
        <div className="mt-10 flex flex-col md:flex-row justify-center gap-4">
            <button onClick={onRestartQuiz} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all duration-300">
                <RepeatIcon className="w-5 h-5"/>
                Refazer Quiz
            </button>
            <button onClick={onNewQuiz} className="flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Quiz
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-3xl font-bold text-white">Gabarito Detalhado</h3>
        {results.answers.map((answer, index) => (
          <div key={answer.question.id} className={`p-6 rounded-2xl border ${answer.isCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
            <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {index + 1}
                </div>
                <div className="flex-1">
                    <p className="text-white text-lg">{answer.question.pergunta}</p>
                    <div className="text-sm mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-300">
                        <p>Sua resposta: <span className={`font-bold ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{answer.answer ? 'CERTO' : 'ERRADO'}</span></p>
                        <p>Resposta correta: <span className="font-bold text-green-400">{answer.question.resposta_correta ? 'CERTO' : 'ERRADO'}</span></p>
                    </div>
                    <p className="text-gray-300 mt-4"><span className="font-bold text-gray-200">Explicação: </span>{answer.question.explicacao}</p>
                    <div className="text-xs text-gray-400 mt-4 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1"/>
                        Tempo: {answer.timeTaken.toFixed(1)}s
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsScreen;
