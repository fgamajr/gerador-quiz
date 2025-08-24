
import React, { useState, useMemo, useCallback } from 'react';
import { QuestionBank, QuizSettings } from '../../types';
import BookIcon from '../icons/BookIcon';

interface SetupScreenProps {
  questionBank: QuestionBank;
  onStartQuiz: (settings: QuizSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ questionBank, onStartQuiz }) => {
  const materias = useMemo(() => Object.keys(questionBank), [questionBank]);
  const [selectedMateria, setSelectedMateria] = useState<string>(materias[0] || '');
  const [selectedSubtopico, setSelectedSubtopico] = useState<string>('todos');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);

  const subtopicos = useMemo(() => {
    if (!selectedMateria || !questionBank[selectedMateria]) {
      return [];
    }
    const uniqueSubtopicos = [...new Set(questionBank[selectedMateria].questoes.map(q => q.subtopico))];
    return ['todos', ...uniqueSubtopicos];
  }, [selectedMateria, questionBank]);

  const availableQuestions = useMemo(() => {
    if (!selectedMateria || !questionBank[selectedMateria]) {
      return 0;
    }
    if (selectedSubtopico === 'todos') {
      return questionBank[selectedMateria].questoes.length;
    }
    return questionBank[selectedMateria].questoes.filter(q => q.subtopico === selectedSubtopico).length;
  }, [selectedMateria, selectedSubtopico, questionBank]);

  const handleMateriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMateria(e.target.value);
    setSelectedSubtopico('todos');
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if(value > 0 && value <= availableQuestions) {
        setNumberOfQuestions(value);
    } else if (e.target.value === '') {
        setNumberOfQuestions(0);
    }
  }

  const handleStartQuiz = useCallback(() => {
    if (selectedMateria && numberOfQuestions > 0 && numberOfQuestions <= availableQuestions) {
      onStartQuiz({
        materia: selectedMateria,
        subtopico: selectedSubtopico,
        numberOfQuestions,
      });
    }
  }, [selectedMateria, selectedSubtopico, numberOfQuestions, availableQuestions, onStartQuiz]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                    <BookIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <label className="text-xl font-bold text-white">Matéria</label>
            </div>
            <select
                value={selectedMateria}
                onChange={handleMateriaChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
            >
                <option value="" disabled>Selecione uma matéria</option>
                {materias.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                ))}
            </select>
        </div>

        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                    <span className="text-indigo-400 font-bold text-lg">@</span>
                </div>
                <label className="text-xl font-bold text-white">Subtópico (opcional)</label>
            </div>
            <select
                value={selectedSubtopico}
                onChange={(e) => setSelectedSubtopico(e.target.value)}
                disabled={!selectedMateria}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none disabled:opacity-50"
            >
                {subtopicos.map(subtopico => (
                    <option key={subtopico} value={subtopico}>
                        {subtopico === 'todos' ? 'Todos os subtópicos' : subtopico}
                    </option>
                ))}
            </select>
        </div>

        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                    <span className="text-indigo-400 font-bold text-lg">#</span>
                </div>
                <label className="text-xl font-bold text-white">Número de questões</label>
            </div>
            <input
                type="number"
                value={numberOfQuestions === 0 ? '' : numberOfQuestions}
                onChange={handleNumberChange}
                min="1"
                max={availableQuestions}
                disabled={!selectedMateria}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
            />
            <p className="text-sm text-gray-400">As questões serão selecionadas aleatoriamente. ({availableQuestions} disponíveis)</p>
        </div>
        
        <div className="mt-10">
            <button
                onClick={handleStartQuiz}
                disabled={!selectedMateria || numberOfQuestions <= 0 || numberOfQuestions > availableQuestions}
                className="w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-gray-400 disabled:shadow-none transition-all duration-300 flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Iniciar Quiz ({numberOfQuestions} questões)</span>
            </button>
        </div>
    </div>
  );
};

export default SetupScreen;
