
import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuizResults, QuizSession } from '../../types';
import CheckIcon from '../icons/CheckIcon';
import XIcon from '../icons/XIcon';
import ClockIcon from '../icons/ClockIcon';

interface QuizScreenProps {
  session: QuizSession;
  onFinishQuiz: (results: QuizResults) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ session, onFinishQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState(session.answers);
  const [time, setTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = session.questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = useCallback((answer: boolean) => {
    if (isAnswered) return;
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isCorrect = answer === currentQuestion.resposta_correta;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    setUserAnswers(prev => [...prev, {
      question: currentQuestion,
      answer,
      isCorrect,
      timeTaken
    }]);
  }, [isAnswered, currentQuestion, questionStartTime]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      onFinishQuiz({
        answers: userAnswers,
        totalTime: (Date.now() - session.startTime) / 1000,
        settings: { materia: '', subtopico: '', numberOfQuestions: session.questions.length } // Placeholder
      });
    }
  };
  
  const getButtonClass = (isCorrectButton: boolean) => {
    if (!isAnswered) {
        return 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/20';
    }
    if (isCorrectButton === currentQuestion.resposta_correta) {
        return 'bg-green-500/80 cursor-not-allowed';
    }
    if (selectedAnswer === isCorrectButton && selectedAnswer !== currentQuestion.resposta_correta) {
        return 'bg-red-500/80 cursor-not-allowed';
    }
    return 'bg-slate-700 cursor-not-allowed opacity-50';
  }


  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col justify-center min-h-[80vh]">
        <div className="mb-6 flex justify-between items-center text-gray-300">
            <h2 className="text-lg font-bold">Questão {currentQuestionIndex + 1} de {session.questions.length}</h2>
            <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>{time}s</span>
            </div>
        </div>
        <div className="w-full bg-indigo-500/20 h-2 rounded-full mb-8">
            <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            ></div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-indigo-900/20 backdrop-blur-sm">
            <p className="text-white text-xl md:text-2xl leading-relaxed mb-10 text-center">
                {currentQuestion.pergunta}
            </p>

            <div className="space-y-4">
                <button
                    onClick={() => handleAnswer(true)}
                    disabled={isAnswered}
                    className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 ${getButtonClass(true)}`}
                >
                    <CheckIcon />
                    <span>CERTO</span>
                </button>
                <button
                    onClick={() => handleAnswer(false)}
                    disabled={isAnswered}
                    className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 ${getButtonClass(false)}`}
                >
                    <XIcon />
                    <span>ERRADO</span>
                </button>
            </div>

            {isAnswered && (
                <div className={`mt-8 p-6 rounded-lg ${selectedAnswer === currentQuestion.resposta_correta ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'} border`}>
                    {selectedAnswer === currentQuestion.resposta_correta ? (
                         <h3 className="text-lg font-bold text-green-300 flex items-center"><CheckIcon className="mr-2"/> Parabéns! Você acertou!</h3>
                    ) : (
                         <h3 className="text-lg font-bold text-red-300 flex items-center"><XIcon className="mr-2"/> Ops! Resposta incorreta.</h3>
                    )}
                    <p className="text-gray-300 mt-2">A resposta correta é: <span className="font-bold">{currentQuestion.resposta_correta ? 'CERTO' : 'ERRADO'}</span></p>
                    <p className="text-gray-300 mt-4"><span className="font-bold">Explicação:</span> {currentQuestion.explicacao}</p>
                    <button
                        onClick={handleNextQuestion}
                        className="mt-6 w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg"
                    >
                        {currentQuestionIndex < session.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default QuizScreen;
