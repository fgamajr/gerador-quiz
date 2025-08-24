import React, { useState, useCallback, useEffect } from 'react';
import { AppView, QuestionBank, QuizSettings, ImportData, Question, QuizSession, QuizResults } from './types';
import SetupScreen from './components/screens/SetupScreen';
import ImportScreen from './components/screens/ImportScreen';
import QuizScreen from './components/screens/QuizScreen';
import ResultsScreen from './components/screens/ResultsScreen';
import GenerateScreen from './components/screens/GenerateScreen';

const App: React.FC = () => {
  const [questionBank, setQuestionBank] = useState<QuestionBank>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [view, setView] = useState<AppView>('SETUP');
  const [activeTab, setActiveTab] = useState<'quiz' | 'import' | 'generate'>('quiz');
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const fetchQuestionBank = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/questions');
        if (!response.ok) {
          // If the file/endpoint doesn't exist, it's not a fatal error, just start with an empty bank.
          if (response.status === 404) {
            setQuestionBank({});
            return;
          }
          throw new Error('Falha ao buscar as questões do servidor.');
        }
        const data: QuestionBank = await response.json();
        setQuestionBank(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('Ocorreu um erro desconhecido ao carregar as questões.');
        }
        setQuestionBank({});
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchQuestionBank();
  }, [fetchQuestionBank]);

  const handleImport = useCallback(async (data: ImportData): Promise<boolean> => {
    try {
        const response = await fetch('/api/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Falha ao importar questões para o servidor.');
        }
        
        await fetchQuestionBank(); // Refetch the bank to get all questions including the new ones
        return true;

    } catch (error) {
        console.error("Import failed:", error);
        // You might want to set an error state here to show in the UI
        return false;
    }
  }, [fetchQuestionBank]);
  
  const handleStartQuiz = useCallback((settings: QuizSettings) => {
    const { materia, subtopico, numberOfQuestions } = settings;
    const subject = questionBank[materia];
    if (!subject) return;

    let availableQuestions = subject.questoes;
    if (subtopico !== 'todos') {
      availableQuestions = availableQuestions.filter(q => q.subtopico === subtopico);
    }
    
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numberOfQuestions);

    setQuizSession({
      questions: selectedQuestions,
      answers: [],
      startTime: Date.now()
    });
    setView('QUIZ');
  }, [questionBank]);

  const handleFinishQuiz = useCallback((results: QuizResults) => {
    const finalResults = {
        ...results,
        settings: quizSession ? {
            materia: Object.values(questionBank).find(s => s.questoes.some(q => q.id === quizSession.questions[0].id))?.materia || 'Unknown',
            subtopico: quizSession.questions[0].subtopico,
            numberOfQuestions: quizSession.questions.length
        } : { materia: 'Unknown', subtopico: 'Unknown', numberOfQuestions: results.answers.length },
    };
    setQuizResults(finalResults);
    setView('RESULTS');
    setQuizSession(null);
  }, [quizSession, questionBank]);

  const handleRestartQuiz = useCallback(() => {
    if (quizResults?.settings) {
        handleStartQuiz(quizResults.settings);
    }
  }, [quizResults, handleStartQuiz]);
  
  const handleNewQuiz = useCallback(() => {
    setView('SETUP');
    setActiveTab('quiz');
    setQuizResults(null);
  }, []);
  
  const handleTabActionSuccess = () => {
    setView('SETUP');
    setActiveTab('quiz');
  }

  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-gray-400">Carregando banco de questões...</p>
    </div>
  );

  const renderView = () => {
    switch(view) {
      case 'QUIZ':
        return quizSession && <QuizScreen session={quizSession} onFinishQuiz={handleFinishQuiz} />;
      case 'RESULTS':
        return quizResults && <ResultsScreen results={quizResults} onRestartQuiz={handleRestartQuiz} onNewQuiz={handleNewQuiz} />;
      case 'SETUP':
      default:
        return (
          <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
            <div className="flex mb-8 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button 
                    onClick={() => setActiveTab('quiz')}
                    className={`w-1/3 py-3 rounded-lg font-semibold transition-colors duration-300 ${activeTab === 'quiz' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                >
                    Iniciar Quiz
                </button>
                <button 
                    onClick={() => setActiveTab('import')}
                    className={`w-1/3 py-3 rounded-lg font-semibold transition-colors duration-300 ${activeTab === 'import' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                >
                    Importar Questões
                </button>
                 <button 
                    onClick={() => setActiveTab('generate')}
                    className={`w-1/3 py-3 rounded-lg font-semibold transition-colors duration-300 ${activeTab === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                >
                    Gerar com IA
                </button>
            </div>
            {activeTab === 'quiz' ? (
                <SetupScreen questionBank={questionBank} onStartQuiz={handleStartQuiz} />
            ) : activeTab === 'import' ? (
                <ImportScreen onImport={handleImport} onImportSuccess={handleTabActionSuccess}/>
            ) : (
                <GenerateScreen onImport={handleImport} onGenerationSuccess={handleTabActionSuccess} />
            )}
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0B14] text-white">
      <header className="py-12 text-center">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Quiz de Concursos
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Selecione a matéria e subtópico para começar seu quiz
        </p>
      </header>
      <main>
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-center text-red-400 p-8 rounded-lg bg-red-900/20 border border-red-700 max-w-3xl mx-auto">{error}</div>}
        {!isLoading && !error && renderView()}
      </main>
    </div>
  );
};

export default App;