import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ImportData } from '../../types';
import SparklesIcon from '../icons/SparklesIcon';

interface GenerateScreenProps {
  onImport: (data: ImportData) => Promise<boolean>;
  onGenerationSuccess: () => void;
}

const GenerateScreen: React.FC<GenerateScreenProps> = ({ onImport, onGenerationSuccess }) => {
  const [formData, setFormData] = useState({
    materia: '',
    subtopico: '',
    conteudo: '',
    numQuestoes: 10,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(50, Number(e.target.value)));
    setFormData(prev => ({ ...prev, numQuestoes: value }));
  };

  const validateForm = () => {
    if (!process.env.API_KEY) {
      setError('A Gemini API Key não foi configurada no ambiente.');
      return false;
    }
    if (!formData.materia.trim() || !formData.subtopico.trim() || !formData.conteudo.trim()) {
      setError('Os campos Matéria, Subtópico e Conteúdo Base devem ser preenchidos.');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      const schema = {
        type: Type.OBJECT,
        properties: {
          materia: { type: Type.STRING },
          subtopico: { type: Type.STRING },
          questoes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pergunta: { type: Type.STRING, description: 'A afirmação da questão no estilo Certo/Errado.' },
                resposta_correta: { type: Type.BOOLEAN, description: '`true` para CERTO, `false` para ERRADO.' },
                explicacao: { type: Type.STRING, description: 'Uma explicação detalhada e fundamentada para a resposta correta.' }
              },
              required: ['pergunta', 'resposta_correta', 'explicacao']
            }
          }
        },
        required: ['materia', 'subtopico', 'questoes']
      };
      
      const systemInstruction = `Você é um especialista em criar questões de concurso para tribunais de contas brasileiros, no estilo Certo/Errado da banca CESPE/CEBRASPE. Sua tarefa é gerar questões de nível difícil com base no conteúdo fornecido. Cada questão deve ter uma afirmação e o gabarito deve ser 'true' para Certo e 'false' para Errado. Inclua uma explicação detalhada e fundamentada para cada questão, justificando o gabarito.`;
      const prompt = `Gere exatamente ${formData.numQuestoes} questões de nível difícil no estilo Certo/Errado (CESPE/CEBRASPE) para um concurso de Tribunal de Contas, com base no seguinte conteúdo:\n\n---\n\nCONTEÚDO:\n${formData.conteudo}\n\n---\n\nAs questões devem ser sobre a matéria "${formData.materia}" e o subtópico "${formData.subtopico}". O JSON de saída DEVE seguir o schema fornecido e conter a matéria e o subtópico exatamente como foram informados.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
        }
      });
      
      const jsonText = response.text.trim();
      const generatedData: ImportData = JSON.parse(jsonText);

      // Sanity check in case the AI hallucinates the subject/subtopic
      if (generatedData.materia !== formData.materia || generatedData.subtopico !== formData.subtopico) {
          console.warn("AI did not use the exact materia/subtopic. Overriding for consistency.");
          generatedData.materia = formData.materia;
          generatedData.subtopico = formData.subtopico;
      }
      
      const importOk = await onImport(generatedData);
      if (importOk) {
        setSuccess(`${generatedData.questoes.length} questões geradas e importadas com sucesso!`);
        setTimeout(() => onGenerationSuccess(), 2500);
      } else {
        throw new Error('As questões foram geradas, mas falharam ao serem salvas no servidor.');
      }

    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(`Erro ao gerar questões: ${e.message}`);
      } else {
        setError('Ocorreu um erro desconhecido durante a geração.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-4">
             <h2 className="text-2xl font-bold text-white flex items-center gap-2"><SparklesIcon className="text-indigo-400"/> Gerar Questões com IA</h2>
             <p className="text-gray-400">Preencha os campos abaixo para gerar questões automaticamente com base em um conteúdo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="font-semibold text-white">Matéria</label>
                <input type="text" name="materia" value={formData.materia} onChange={handleInputChange} placeholder="Ex: Direito Administrativo" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
            </div>
            <div className="space-y-2">
                <label className="font-semibold text-white">Subtópico</label>
                <input type="text" name="subtopico" value={formData.subtopico} onChange={handleInputChange} placeholder="Ex: Atos Administrativos" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
            </div>
        </div>

        <div className="space-y-2">
            <label className="font-semibold text-white">Conteúdo Base</label>
            <textarea name="conteudo" value={formData.conteudo} onChange={handleInputChange} placeholder="Cole aqui o texto, artigo de lei, ou material de estudo..." rows={12} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
        </div>

        <div className="space-y-2">
            <label className="font-semibold text-white">Número de Questões</label>
            <input type="number" name="numQuestoes" value={formData.numQuestoes} onChange={handleNumberChange} min="1" max="50" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
        </div>

        {error && <p className="text-red-400 text-sm p-4 bg-red-900/20 border border-red-800 rounded-lg">{error}</p>}
        {success && <p className="text-green-400 text-sm p-4 bg-green-900/20 border border-green-800 rounded-lg">{success}</p>}

        <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.materia.trim() || !formData.subtopico.trim() || !formData.conteudo.trim()}
            className="w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-700 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
            {isGenerating ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Gerando...</span>
                </>
            ) : (
                <>
                    <SparklesIcon />
                    <span>Gerar e Importar Questões</span>
                </>
            )}
        </button>
    </div>
  );
};

export default GenerateScreen;
