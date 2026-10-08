# Case Tecnico: Family Finance

## Problema E Solucao

Acompanhar despesas, metas e contas de varias pessoas exige consolidar informacoes e revisar lancamentos. O Family Finance explora esse fluxo com um painel web e importacao de documentos: o arquivo e lido, as linhas sao transformadas em propostas e a pessoa confirma o que deve entrar nas transacoes.

## Fluxo De Importacao

```text
PDF / imagem / TXT / CSV
         |
         v
Arquivo original no IndexedDB
         |
         v
Extracao de texto: PDF.js, OCR ou leitura direta
         |
         v
Interpretacao por regras e propostas de transacao
         |
         v
Revisao e confirmacao
         |
         v
Transacoes salvas no estado local
```

Em `dist/app.js`, `processUploadedFile` coordena o fluxo, `extractFileText` seleciona a leitura apropriada e `parseStatementText` identifica linhas de lancamentos. A interface mostra o progresso e conserva o texto extraido para revisao.

## Por Que Duas Formas De Armazenamento

`localStorage` guarda o estado estruturado da aplicacao, incluindo transacoes e metadados das importacoes. IndexedDB guarda os arquivos como blobs. Essa separacao evita colocar o conteudo binario dos documentos no estado JSON, mas os dois continuam limitados ao navegador e a origem utilizados.

## Assistente

Family AI combina respostas locais e interpretacao de comandos por regras. `parseAiTransaction` transforma um pedido compativel em uma proposta de despesa; a interface exige confirmacao antes de salva-la. A versao atual nao utiliza um modelo generativo, e seu vocabulario e limitado.

## Roteiro De Apresentacao

1. Mostre o painel e a divisao em transacoes, orcamentos, metas e arquivos.
2. Cadastre uma despesa e mostre o efeito no resumo.
3. Importe `examples/fatura-demo.txt` e revise os lancamentos encontrados.
4. Confirme um lancamento e recarregue para demonstrar a persistencia.
5. Mostre o layout no celular e a alternancia de tema.
6. Explique a diferenca entre este MVP local e um produto com autenticacao e dados compartilhados.

## Aprendizados Tecnicos Que O Codigo Permite Explorar

- Modelagem de estado para transacoes, metas e importacoes.
- APIs de arquivos e armazenamento do navegador.
- Operacoes assincronas, progresso e tratamento de falhas de leitura.
- Integracao com bibliotecas de PDF e OCR.
- Validacao humana de resultados de extracao.
- Limites de um assistente por regras e de um modelo de dados sem controle de acesso no servidor.

## Proximos Passos

A prioridade de evolucao e autenticacao, permissoes, sincronizacao e backup. O importador pode ganhar fixtures por layout de fatura e testes de casos de OCR. Conforme a base crescer, separar armazenamento, extracao, regras e renderizacao facilitara manutencao e verificacao.
