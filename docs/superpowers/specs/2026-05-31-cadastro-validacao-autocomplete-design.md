# Cadastro com validacao e autocomplete

## Objetivo

Melhorar o formulario de criacao de conta do EntregaApp para validar os dados antes do envio, formatar documentos e WhatsApp enquanto o usuario digita, e sugerir provedores comuns de email. O fluxo deve atender entregadores e empresas sem duplicar regras entre frontend e API.

## Escopo

- Aplicar validacao com Zod para cadastro no cliente e na rota `/api/register`.
- Reaproveitar o comportamento de mascara progressiva do projeto de referencia para CPF e WhatsApp.
- Manter CNPJ e CEP da empresa com mascara progressiva.
- Sugerir emails com provedores comuns: `gmail.com`, `hotmail.com`, `outlook.com`, `yahoo.com` e `icloud.com`.
- Exibir mensagens de erro por campo no formulario.
- Normalizar CPF, CNPJ, CEP e WhatsApp para somente digitos antes de persistir.

## Regras de Validacao

- Nome deve ter pelo menos duas palavras com dois ou mais caracteres cada.
- Email deve ser valido e normalizado para minusculas.
- Senha deve ter no minimo 8 caracteres, incluindo letra minuscula, letra maiuscula, numero e caractere especial.
- Confirmacao de senha deve ser igual a senha.
- WhatsApp deve conter telefone brasileiro com 10 ou 11 digitos locais, aceitando entrada com `55`.
- Entregador deve informar CPF valido.
- Empresa deve informar CNPJ valido, CPF valido do responsavel e CEP com 8 digitos.

## Arquitetura

`lib/auth/validation.ts` concentrara os schemas Zod de login e cadastro. O `RegisterForm` usara `react-hook-form` com `zodResolver(registerSchema)` para validar em cliente. A rota `/api/register` usara o mesmo schema antes de criar o usuario.

`lib/auth/format.ts` concentrara formatadores progressivos para CPF, CNPJ, WhatsApp brasileiro, CEP e sugestoes de email. O formulario aplicara esses helpers em `onChange`, preservando mensagens e valores controlados pelo `react-hook-form`.

## UX

O usuario escolhe entre entregador e empresa por controle segmentado. O formulario muda os campos exigidos de acordo com o tipo selecionado. Campos com erro mostram a mensagem do schema logo abaixo. O email usa `datalist` para exibir sugestoes baseadas no texto digitado.

## Testes

- Testes unitarios para formatadores e sugestoes de email.
- Testes unitarios para casos validos e invalidos do schema de cadastro.
- Testes de componente para mascaras de CPF, WhatsApp, CNPJ e CEP.
- Teste de componente para sugestoes de email.
- Verificacao final com a suite relevante de Vitest.
