# Reposicionamento Veros Advisory — RevOps & Growth Advisory

## O que existe hoje (será preservado)
- Página única em pt-BR, tema escuro, fonte Nunito.
- Logo transparente, fotos do Tiago (escritório e palco), vídeo, favicon.
- WhatsApp (94) 99217-9773 com mensagem pronta, Instagram e LinkedIn.
- Botão flutuante de WhatsApp, FAQ em sanfona, SEO da página.
- Sem banco de dados nem formulários ainda.

## O que muda
- **Visual:** nova paleta do brief (preto #080B12, azul-marinho #101827, azul #2563EB, ciano #22D3EE, verde #22C55E, branco #F8FAFC, cinza #94A3B8). Gradientes e brilhos discretos, cards com bordas finas, animações suaves ao rolar. Fonte de títulos mais forte e tecnológica (Space Grotesk), texto em Nunito mantido.
- **Conteúdo:** as 12 seções do documento, com os textos exatos do brief: Header (transparente → escuro ao rolar, menu mobile), Hero com painel de demonstração, Problema (6 itens), O que é RevOps (4 pilares conectados), 3 Soluções, Metodologia em 6 etapas, Plataforma em desenvolvimento, Para quem, Sobre (fotos reais do Tiago), FAQ (8 perguntas), CTA final, Rodapé.
- **Painéis de dados:** desenhados no próprio site (sem imagens), sempre com selo "Dados ilustrativos — demonstração". A plataforma aparece como "em desenvolvimento", sem prometer módulos prontos.
- **Conversão:** botões de WhatsApp em pontos-chave; botão fixo no desktop e barra inferior no mobile; formulário de diagnóstico com os 8 campos, validação, mensagem de confirmação e registro de origem (qual botão/seção levou ao formulário).

## Formulário — armazenamento
Ativar o Lovable Cloud para guardar as solicitações com segurança (qualquer visitante pode enviar, ninguém de fora pode ler). Após enviar, o visitante também pode seguir para o WhatsApp com os dados já preenchidos. Ver as solicitações fica pelo painel do Cloud (sem área administrativa nesta etapa).

## Etapas
1. Identidade visual e layout.
2. Seções e conteúdos.
3. Formulário, CTAs e Cloud.
4. Responsividade, SEO (novo título "Veros Advisory | Revenue Operations & Growth Advisory", descrição, Open Graph, dados estruturados) e acessibilidade.
5. Testes em desktop e celular, console sem erros, links verificados.

## Fora desta etapa
- Plataforma interna de RevOps (só apresentação conceitual).
- Depoimentos, clientes, números ou certificações.

## Detalhes técnicos
- Componentes separados por seção em `src/components/site/`; `src/routes/index.tsx` só compõe.
- Tabela `diagnostic_requests` com validação (zod) no cliente e servidor; envio por server function; RLS só com insert público.
- Memória de marca atualizada para a nova paleta e posicionamento.
