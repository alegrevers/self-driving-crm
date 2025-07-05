### Self-Driving CRM - Pipeline de Ingestão e Análise
Este projeto demonstra um pipeline completo para ingestão, processamento e análise de mensagens de vendas, simulando o core do Self-Driving CRM da Kobi.

## Arquitetura
O fluxo de dados é o seguinte:

Frontend (Next.js): Um formulário simples captura o nome do cliente e uma mensagem.

API Ingestion (Backend Nest.js): Recebe a mensagem, criptografa o conteúdo e a persiste no banco de dados (PostgreSQL) com o status inicial received.

Enfileiramento (RabbitMQ): O ID da nova mensagem é publicado em uma fila para processamento assíncrono.

Processamento (Backend Consumer): Um consumer escuta a fila, busca a mensagem no banco, a descriptografa e a envia para a API do Google Gemini para classificar o estágio do funil (ex: Lead, Oportunidade).

Atualização: O status e o estágio do funil da mensagem são atualizados no banco de dados.

Error Handling: Em caso de falha no processamento, a mensagem é enviada para uma Dead-Letter Queue (DLQ) para análise manual.

## Stack Tecnológica
Frontend: Next.js com TypeScript e Tailwind CSS

Backend: Nest.js com TypeScript

Banco de Dados: PostgreSQL

Broker de Mensageria: RabbitMQ

IA para Classificação: Google Gemini

Containerização: Docker e Docker Compose

CI/CD: GitHub Actions

## Pré-requisitos
Docker

Docker Compose

Uma chave de API do Google Gemini (obtenha em Google AI Studio)

## Como Executar
Clone o repositório (se estivesse em um). Como você tem os arquivos, apenas organize-os na estrutura de pastas correta.

Crie o arquivo de ambiente:
Copie o conteúdo de .env.example para um novo arquivo chamado .env na raiz do projeto.

cp .env.example .env

Configure as variáveis de ambiente:
Abra o arquivo .env e preencha com suas credenciais. O ENCRYPTION_KEY deve ser uma string hexadecimal de 64 caracteres (32 bytes). Você pode gerar uma com o comando:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

E MUITO IMPORTANTE: adicione sua chave da API do Gemini.

Inicie os containers:
Na raiz do projeto, execute o comando:

docker-compose up --build

Isso irá construir as imagens do frontend e backend e iniciar todos os serviços.

## Como Usar
Frontend: Acesse http://localhost:3000 no seu navegador. Preencha o formulário e envie uma mensagem de vendas (ex: "Olá, gostaria de saber mais sobre o produto X").

RabbitMQ Management UI: Acesse http://localhost:15672. Use o login guest e senha guest. Você poderá ver as filas messages_queue e dlq_messages_queue e o fluxo de mensagens.

Banco de Dados: Você pode se conectar ao Postgres (verifique a porta mapeada no docker-compose.yml, ex: 5434) com as credenciais do seu .env para ver a tabela messages sendo atualizada em tempo real.

## CI/CD
O workflow definido em .github/workflows/ci.yml é acionado em cada push ou pull_request. Ele executa as seguintes etapas para o backend e frontend:

Instalação de dependências

Build do projeto

Linting

Execução dos testes unitários (para o backend)
