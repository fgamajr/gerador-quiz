import React, { useState } from 'react';
import { ImportData } from '../../types';

interface ImportScreenProps {
  onImport: (data: ImportData) => Promise<boolean>;
  onImportSuccess: () => void;
}

const exampleJSON = `{
  "materia": "Matemática",
  "subtopico": "Álgebra",
  "questoes": [
    {
      "pergunta": "2 + 2 = 4?",
      "resposta_correta": true,
      "explicacao": "Soma básica de números naturais"
    },
    {
      "pergunta": "3 x 3 = 10?",
      "resposta_correta": false,
      "explicacao": "3 x 3 = 9, não 10"
    }
  ]
}`;

const ImportScreen: React.FC<ImportScreenProps> = ({ onImport, onImportSuccess }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setError('');
    setSuccess('');
    if (!jsonInput.trim()) {
      setError('O JSON não pode estar vazio.');
      return;
    }
    
    setIsImporting(true);
    try {
      const data: ImportData = JSON.parse(jsonInput);

      if (!data.materia || !data.subtopico || !Array.isArray(data.questoes)) {
        throw new Error('Formato de JSON inválido. Faltando "materia", "subtopico", ou "questoes".');
      }

      const importOk = await onImport(data);

      if (importOk) {
        setSuccess(`${data.questoes.length} questões importadas para "${data.materia}" com sucesso!`);
        setJsonInput('');
        setTimeout(() => onImportSuccess(), 2000);
      } else {
        throw new Error('Falha ao salvar as questões no servidor.');
      }

    } catch (e) {
      if (e instanceof Error) {
        setError(`Erro ao processar JSON: ${e.message}`);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
        setIsImporting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white">Importar Questões</h2>
      <p className="text-gray-400">Cole o JSON com as questões para importar em massa</p>
      
      <div className="space-y-2">
        <label className="text-lg font-semibold text-white">Formato esperado:</label>
        <pre className="bg-slate-900 text-gray-300 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-x-auto">
          <code>{exampleJSON}</code>
        </pre>
      </div>

      <div className="space-y-2">
         <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Cole seu JSON aqui..."
          rows={10}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          disabled={isImporting}
        />
      </div>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        onClick={handleImport}
        disabled={isImporting}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed"
      >
        {isImporting ? 'Importando...' : 'Importar Questões'}
      </button>
    </div>
  );
};

export default ImportScreen;