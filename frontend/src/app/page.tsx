"use client";

import { useState, FormEvent } from 'react';
import axios from 'axios';

export default function Home() {
  const [customerName, setCustomerName] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName || !content) {
      setStatus({ type: 'error', message: 'Por favor, preencha todos os campos.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Enviando mensagem...' });

    try {
      await axios.post(`${apiUrl}/messages`, {
        customerName,
        content,
      });
      setStatus({ type: 'success', message: 'Mensagem enviada com sucesso! Ela será processada em breve.' });
      setCustomerName('');
      setContent('');
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatus({ type: 'error', message: 'Falha ao enviar mensagem. Tente novamente.' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Self-Driving CRM
          </h1>
          <p className="text-gray-400 mt-2">Plataforma de Ingestão de Mensagens</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Cliente
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Mensagem
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite a mensagem recebida do cliente..."
            />
          </div>

          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.type === 'loading' ? 'Enviando...' : 'Enviar para Análise'}
          </button>
        </form>

        {status.type !== 'idle' && status.type !== 'loading' && (
          <div className={`mt-6 p-4 rounded-lg text-center ${status.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {status.message}
          </div>
        )}
        <footer className="text-center mt-12 text-gray-500">
            <p>Acesse o <a href="http://localhost:15672" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Painel do RabbitMQ</a> para ver as filas.</p>
        </footer>
      </div>
    </main>
  );
}
