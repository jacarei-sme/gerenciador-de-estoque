# Sistema de Controle de Estoque - DTI/SME

## Sobre o Projeto

Este é um sistema de controle de estoque desenvolvido como parte do Projeto Integrador do 2º Semestre de 2025 para o setor de TI da Secretaria Municipal de Educação de Jacareí.

A aplicação web permite o gerenciamento completo de produtos, incluindo cadastro, edição, e o registro de todas as movimentações de entrada e saída, oferecendo uma visão clara e atualizada do inventário.

## ✨ Funcionalidades Principais

O sistema foi construído para ser uma ferramenta prática e funcional para a gestão de estoque, com as seguintes características:

* **🔐 Autenticação de Usuários:** Acesso seguro ao sistema através de login com e-mail e senha.
* **📦 Gestão de Produtos (CRUD):**
    * **Criação:** Adicione novos produtos ao estoque com nome, descrição e quantidade inicial.
    * **Visualização:** Liste todos os produtos em uma tabela clara, com o estoque atual visível.
    * **Atualização:** Edite as informações de produtos já cadastrados.
    * **(Não implementado no front-end):** A exclusão de produtos pode ser implementada futuramente.
* **📈 Controle de Movimentação:**
    * Registre **entradas** de novos itens no estoque.
    * Registre **retiradas (saídas)** de material, com um campo opcional para justificativa.
* **📊 Relatórios Detalhados:**
    * Gere um relatório completo com todo o histórico de movimentações.
    * Visualize rapidamente as últimas 20 movimentações para um acompanhamento ágil.
    * Os relatórios exibem data, produto, tipo de movimentação (entrada ou saída), quantidade, usuário responsável e observações.
* **💻 Interface Intuitiva:** Design simples e funcional, utilizando o framework **Pico.css** para uma aparência limpa e responsiva sem a necessidade de configurações complexas.

## 🚀 Tecnologias Utilizadas

* **Front-end:**
    * HTML5
    * CSS3 com **Pico.css**
    * JavaScript (Vanilla)
* **Back-end (BaaS - Backend as a Service):**
    * **Supabase:** Utilizado para autenticação de usuários e como banco de dados PostgreSQL para armazenar produtos e movimentações.

## 🏁 Como Utilizar

O sistema é dividido em algumas seções principais:

1.  **Login:** A tela inicial onde o usuário deve se autenticar.
2.  **Painel Principal:** Após o login, o usuário tem acesso à lista de produtos em estoque e às ações principais:
    * Adicionar um novo produto.
    * Gerar relatórios de movimentação.
3.  **Cadastro e Edição de Produto:** Formulário para criar um novo item ou alterar um existente.
4.  **Registro de Movimentação:** Uma janela modal permite registrar entradas e saídas de forma rápida para cada produto diretamente da tela principal.
5.  **Relatórios:** Uma tela dedicada para a visualização do histórico de movimentações.

Todo o controle de estado e a renderização das diferentes seções são gerenciados via JavaScript, manipulando a visibilidade dos elementos no DOM.

## Contribuidores

* Grupo 012 - Projeto Integrador
