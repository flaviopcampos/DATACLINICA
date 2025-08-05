# Sistema Clínico Profissional

Este repositório contém o código-fonte para o Sistema Clínico Profissional, um ERP web (SaaS) com funcionalidades essenciais para clínicas, incluindo prontuário eletrônico, faturamento TISS, gestão de pacientes, controle financeiro, relatórios gerenciais e segurança LGPD.

## Plano de Implementação

O desenvolvimento seguirá o plano detalhado abaixo, que será ajustado conforme a necessidade:

### 0. Etapa Preliminar: Pesquisa e Planejamento Detalhado

*   **0.1. Pesquisa Aprofundada do DataSigh:** Levantamento e inclusão de funcionalidades adicionais.
*   **0.2. Definição de Requisitos Não Funcionais:** Escalabilidade, performance, segurança, manutenibilidade e usabilidade.
*   **0.3. Escolha e Configuração do Banco de Dados:** Confirmação do PostgreSQL e definição da estrutura inicial.

### 1. ETAPA 1 — Estrutura Base do Projeto

*   **1.1. Autenticação e Perfis de Usuário:** Sistema de login seguro com JWT, cadastro de usuários com perfis (Administrador, Médico, Enfermeiro, Financeiro) e controle de permissões (ACL).
*   **1.2. Estrutura Geral do Sistema:** Interface web moderna (tema claro e escuro), navegação por módulos, dashboard de resumo, suporte a múltiplas clínicas (multiempresa) e responsividade.

### 2. ETAPA 2 — Módulo de Pacientes

*   **2.1. Cadastro Completo do Paciente:** Dados pessoais, endereço, contatos, convênios, dados complementares (alergias, comorbidades, grupo sanguíneo) e upload de documentos/fotos.
*   **2.2. Histórico Clínico Unificado:** Listagem de atendimentos anteriores, prontuários, prescrições, evoluções e exames reunidos por paciente.

### 3. ETAPA 3 — Prontuário Eletrônico do Paciente (PEP)

*   **3.1. Prontuário Clínico Customizável:** Evolução clínica, anamnese por especialidade, diagnóstico CID-10 e campos personalizáveis.
*   **3.2. Prescrição Médica:** Receita digital com assinatura eletrônica, integração com API da Memed e impressão de documentos com logo da clínica.
*   **3.3. Documentos Médicos:** Geração e armazenamento de atestados, encaminhamentos, laudos, assinatura digital (Clicksign/ICP-Brasil) e histórico de emissão.

### 4. ETAPA 4 — Faturamento e Financeiro

*   **4.1. Faturamento TISS:** Cadastro de convênios, tabelas TUSS, guias ANS, emissão de lotes XML, geração de boletos/repasses médicos e controle de glosas/autorizações.
*   **4.2. Controle Financeiro:** Contas a pagar/receber, centro de custo, plano de contas, fluxo de caixa, relatório de repasses médicos e conciliação de recebíveis.

### 5. ETAPA 5 — Farmácia e Estoque

*   **5.1. Controle de Insumos e Medicamentos:** Cadastro de produtos, entradas/saídas de estoque, controle de validade/lote, alertas de estoque mínimo e relatórios de uso por setor.
*   **5.2. Requisições Internas:** Médicos/enfermeiros podem solicitar insumos, liberação pelo setor de farmácia com registro e histórico de movimentações.
*   **5.3. Classificação de Produtos (Estoque Ampliado):** Tipos de item (clínicos, limpeza, refeitório) com campos detalhados.
*   **5.4. Entradas e Saídas por Setor:** Sistema de requisição por setor e controle de movimentações detalhado.
*   **5.5. Relatórios de Estoque Geral:** Consumo por categoria, custo total por setor/mês, alertas de itens vencendo/baixo estoque e consumo por colaborador (opcional).
*   **5.6. Compras Internas:** Cadastro de fornecedores, geração de pedidos de compra, comparativo de preços e entrada automatizada no estoque.

### 6. ETAPA 6 — Relatórios e BI

*   **6.1. Relatórios Administrativos:** Pacientes atendidos por período, relatórios por especialidade/profissional, procedimentos mais realizados e receita mensal por convênio.
*   **6.2. Indicadores Gráficos (BI):** Ocupação de profissionais, receita bruta/líquida, percentual de glosas e tempo médio de atendimento.

### 7. ETAPA 7 — Segurança e LGPD

*   **7.1. Conformidade com LGPD:** Controle de consentimento do paciente, registro de logs de acesso, backup automático e criptografia de dados sensíveis.
*   **7.2. Auditoria e Rastreabilidade:** Log de ações críticas e relatórios de atividades por usuário.

### 8. ETAPA 8 — Extras Técnicos e Arquitetura

*   **8.1. Tecnologia Recomendada:** Backend (Python/FastAPI), Frontend (React + TailwindCSS), Banco de Dados (PostgreSQL), APIs externas (Memed, Clicksign/DocuSign, CEP/Prefeituras).
*   **8.2. Arquitetura e Deploy:** Sistema SaaS multiempresa, backend em contêiner (Docker), deploy em ambiente cloud (Render, Railway ou AWS) e suporte a atualizações automáticas (CI/CD).

## Próximos Passos

1.  **Configuração do Ambiente de Desenvolvimento:** Instalação de Python, Node.js, PostgreSQL e Docker.
2.  **Estrutura Inicial do Projeto:** Criação dos diretórios `backend` e `frontend`.
3.  **Configuração do Banco de Dados:** Definição do esquema inicial do PostgreSQL.

---

Este `README.md` servirá como a documentação principal do projeto e será atualizado conforme o progresso.