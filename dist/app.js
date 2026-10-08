const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const storageKey = "family-finance-state-v1";
const fileDbName = "family-finance-files-v1";
const fileStoreName = "files";
const scriptLoaders = {};

const categories = [
  { name: "Moradia", color: "#5f5bd6" },
  { name: "Alimentação", color: "#ef8f35" },
  { name: "Transporte", color: "#157a74" },
  { name: "Saúde", color: "#ba3b46" },
  { name: "Educação", color: "#2f7fc1" },
  { name: "Lazer", color: "#bb5f95" },
  { name: "Assinaturas", color: "#84663d" },
  { name: "Contas", color: "#53606d" },
  { name: "Compras", color: "#7a7f22" },
  { name: "Outros", color: "#687381" },
];

const defaultState = {
  view: "home",
  filter: "all",
  theme: "light",
  members: [
    { id: "gabriel", name: "Gabriel", role: "Administrador", initials: "G" },
    { id: "mae", name: "Mãe", role: "Membro", initials: "M" },
    { id: "pai", name: "Pai", role: "Membro", initials: "P" },
    { id: "irma", name: "Irmã", role: "Membro", initials: "I" },
  ],
  accounts: [
    { id: "nubank", name: "Nubank", type: "Conta digital", balance: 3820.53 },
    { id: "bb", name: "Banco do Brasil", type: "Conta corrente", balance: 4100 },
    { id: "wallet", name: "Dinheiro", type: "Carteira", balance: 500 },
  ],
  transactions: [
    {
      id: "t1",
      type: "income",
      amount: 7800,
      description: "Salário Gabriel",
      category: "Receita",
      person: "Gabriel",
      account: "Nubank",
      date: "2026-10-03",
      visibility: "family",
      recurring: true,
    },
    {
      id: "t2",
      type: "income",
      amount: 4700,
      description: "Salário Mãe",
      category: "Receita",
      person: "Mãe",
      account: "Banco do Brasil",
      date: "2026-10-04",
      visibility: "family",
      recurring: true,
    },
    {
      id: "t3",
      type: "expense",
      amount: 282,
      description: "Energia",
      category: "Contas",
      person: "Pai",
      account: "Banco do Brasil",
      date: "2026-10-08",
      visibility: "family",
      recurring: true,
    },
    {
      id: "t4",
      type: "expense",
      amount: 119.9,
      description: "Internet",
      category: "Contas",
      person: "Gabriel",
      account: "Nubank",
      date: "2026-10-12",
      visibility: "family",
      recurring: true,
    },
    {
      id: "t5",
      type: "expense",
      amount: 1430,
      description: "Cartão de crédito",
      category: "Compras",
      person: "Gabriel",
      account: "Nubank",
      date: "2026-10-15",
      visibility: "family",
      recurring: false,
    },
    {
      id: "t6",
      type: "expense",
      amount: 600,
      description: "Supermercado",
      category: "Alimentação",
      person: "Gabriel",
      account: "Nubank",
      date: "2026-10-06",
      visibility: "family",
      recurring: false,
    },
    {
      id: "t7",
      type: "expense",
      amount: 320,
      description: "Delivery",
      category: "Alimentação",
      person: "Irmã",
      account: "Nubank",
      date: "2026-10-05",
      visibility: "family",
      recurring: false,
    },
    {
      id: "t8",
      type: "expense",
      amount: 150,
      description: "Despesa privada",
      category: "Outros",
      person: "Mãe",
      account: "Dinheiro",
      date: "2026-10-02",
      visibility: "private",
      recurring: false,
    },
    {
      id: "t9",
      type: "expense",
      amount: 730,
      description: "Cinema, jogos e passeio",
      category: "Lazer",
      person: "Família",
      account: "Nubank",
      date: "2026-10-01",
      visibility: "family",
      recurring: false,
    },
    {
      id: "t10",
      type: "expense",
      amount: 620,
      description: "Combustível e transporte",
      category: "Transporte",
      person: "Pai",
      account: "Banco do Brasil",
      date: "2026-10-04",
      visibility: "family",
      recurring: false,
    },
  ],
  budgets: [
    { category: "Alimentação", limit: 2000 },
    { category: "Moradia", limit: 3000 },
    { category: "Transporte", limit: 1200 },
    { category: "Saúde", limit: 800 },
    { category: "Lazer", limit: 800 },
    { category: "Outros", limit: 900 },
  ],
  goals: [
    {
      id: "g1",
      name: "Viagem da família",
      target: 10000,
      saved: 4200,
      due: "Dezembro de 2027",
    },
    {
      id: "g2",
      name: "Reserva de emergência",
      target: 18000,
      saved: 7200,
      due: "Junho de 2027",
    },
  ],
  assistant: [
    {
      role: "system",
      text: "Pergunte sobre gastos, metas ou peça para preparar um lançamento. Eu mostro a prévia antes de salvar.",
    },
  ],
  imports: [],
  activeImportId: null,
  importStatus: null,
};

let state = loadState();
let stagedAiEntry = null;

const appContent = document.querySelector("#appContent");
const toast = document.querySelector("#toast");
const entryModal = document.querySelector("#entryModal");
const confirmModal = document.querySelector("#confirmModal");
const goalModal = document.querySelector("#goalModal");
const entryForm = document.querySelector("#entryForm");
const goalForm = document.querySelector("#goalForm");

document.documentElement.dataset.theme = state.theme;

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    const loaded = saved ? { ...structuredClone(defaultState), ...JSON.parse(saved) } : structuredClone(defaultState);
    loaded.imports = Array.isArray(loaded.imports) ? loaded.imports : [];
    loaded.activeImportId = loaded.activeImportId || loaded.imports[0]?.id || null;
    loaded.importStatus = null;
    return loaded;
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function money(value) {
  return BRL.format(value || 0);
}

function parseMoney(value) {
  const normalized = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compactText(value, max = 90) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function fileSize(size) {
  if (!size) return "0 KB";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function today() {
  return "2026-10-07";
}

function txDate(date) {
  return DATE.format(new Date(`${date}T12:00:00`));
}

function categoryByName(name) {
  return categories.find((category) => category.name === name) || categories.at(-1);
}

function calculateSummary() {
  const monthly = state.transactions.filter((tx) => tx.date.startsWith("2026-10"));
  const income = monthly.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = monthly.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const balance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
  const pending = monthly
    .filter((tx) => tx.type === "expense" && new Date(tx.date) >= new Date(`${today()}T00:00:00`))
    .reduce((sum, tx) => sum + tx.amount, 0);
  return { income, expenses, balance, pending, saving: income - expenses };
}

function categorySpent(category) {
  return state.transactions
    .filter((tx) => tx.type === "expense" && tx.category === category && tx.date.startsWith("2026-10"))
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  persist();
  render();
  appContent.focus({ preventScroll: true });
}

function render() {
  renderSidePanel();
  if (state.view === "transactions") renderTransactions();
  else if (state.view === "reports") renderReports();
  else if (state.view === "imports") renderImports();
  else if (state.view === "assistant") renderAssistant();
  else renderHome();
}

function renderHome() {
  const summary = calculateSummary();
  const insight = createInsight();
  const nextBills = state.transactions
    .filter((tx) => tx.type === "expense" && new Date(tx.date) >= new Date(`${today()}T00:00:00`))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  appContent.innerHTML = `
    <div class="view-title">
      <div>
        <p class="eyebrow">Outubro de 2026</p>
        <h2>Painel da Família Castro</h2>
        <p>Resumo financeiro familiar com saldos, compromissos, orçamentos e sinais de atenção.</p>
      </div>
      <div class="view-actions">
        <button class="secondary-button" data-view="reports" type="button">Relatórios</button>
        <button class="primary-button" data-open-modal="transaction" type="button">Adicionar</button>
      </div>
    </div>

    <div class="grid home-grid">
      ${metric("Saldo atual", money(summary.balance), "3 contas conectadas", "")}
      ${metric("Receitas do mês", money(summary.income), "+8% vs. setembro", "income")}
      ${metric("Despesas", money(summary.expenses), "Inclui privadas nos totais", "expense")}
      ${metric("Economia", money(summary.saving), `${Math.round((summary.saving / summary.income) * 100)}% da renda`, "saving")}
    </div>

    <section class="card import-card">
      <div>
        <p class="eyebrow">Importação inteligente</p>
        <h2>Envie uma fatura, comprovante ou foto</h2>
        <p>O Family Finance lê PDF, imagem, texto ou CSV, encontra possíveis lançamentos e deixa tudo em revisão antes de salvar.</p>
      </div>
      <button class="primary-button" data-view="imports" type="button">Importar arquivo</button>
    </section>

    <section class="card ai-card" aria-label="Insight da Family AI">
      <div>
        <p class="eyebrow">Family AI</p>
        <h2>${insight.title}</h2>
        <p>${insight.text}</p>
      </div>
      <div class="ai-spark" aria-hidden="true">✦</div>
    </section>

    <div class="grid two-col">
      <section class="card">
        <div class="section-title">
          <h2>Próximas contas</h2>
          <span class="muted">${money(summary.pending)} pendentes</span>
        </div>
        <div class="stack">
          ${nextBills.map(renderBill).join("") || empty("Nenhuma conta pendente.")}
        </div>
      </section>

      <section class="card">
        <div class="section-title">
          <h2>Orçamento mensal</h2>
          <span class="muted">Atualizado agora</span>
        </div>
        <div class="stack">
          ${state.budgets.map(renderBudget).join("")}
        </div>
      </section>
    </div>
  `;
}

function metric(label, value, note, tone) {
  return `
    <article class="metric-card ${tone}">
      <div class="metric-head">
        <span class="muted">${label}</span>
        <span class="pill">${tone === "expense" ? "saída" : tone === "income" ? "entrada" : "família"}</span>
      </div>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `;
}

function renderBill(tx) {
  const days = Math.ceil((new Date(`${tx.date}T12:00:00`) - new Date(`${today()}T12:00:00`)) / 86400000);
  const due = days === 1 ? "vence amanhã" : days === 0 ? "vence hoje" : `vence em ${days} dias`;
  return `
    <div class="bill-row">
      <div>
        <strong>${tx.description}</strong>
        <span class="muted">${tx.category} · ${due}</span>
      </div>
      <strong>${money(tx.amount)}</strong>
    </div>
  `;
}

function renderBudget(budget) {
  const spent = categorySpent(budget.category);
  const percent = Math.round((spent / budget.limit) * 100);
  const fillClass = percent >= 100 ? "danger" : percent >= 80 ? "warn" : "";
  return `
    <div class="budget-item">
      <div class="budget-head">
        <strong>${budget.category}</strong>
        <span class="muted">${money(spent)} / ${money(budget.limit)}</span>
      </div>
      <div class="progress-track" aria-label="${budget.category}: ${percent}% usado">
        <span class="progress-fill ${fillClass}" style="--value: ${Math.min(percent, 100)}%"></span>
      </div>
    </div>
  `;
}

function createInsight() {
  const food = categorySpent("Alimentação");
  const delivery = state.transactions
    .filter((tx) => tx.description.toLowerCase().includes("delivery"))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const leisure = categorySpent("Lazer");
  if (leisure > 650) {
    return {
      title: "Lazer está perto do limite.",
      text: `A família já usou ${money(leisure)} de ${money(800)} no orçamento de lazer. Reduzir uma saída no fim de semana evita ultrapassar o limite.`,
    };
  }
  return {
    title: "Alimentação merece atenção.",
    text: `Os gastos com alimentação estão em ${money(food)}. Delivery representa ${money(delivery)} desse total e explica boa parte do aumento do mês.`,
  };
}

function renderTransactions() {
  const filtered = state.transactions
    .filter((tx) => {
      if (state.filter === "all") return true;
      if (state.filter === "private") return tx.visibility === "private";
      return tx.type === state.filter;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  appContent.innerHTML = `
    <div class="view-title">
      <div>
        <p class="eyebrow">Movimentações</p>
        <h2>Receitas e despesas</h2>
        <p>Registre lançamentos familiares ou privados, acompanhe recorrências e mantenha o histórico organizado.</p>
      </div>
      <button class="primary-button" data-open-modal="transaction" type="button">Adicionar</button>
    </div>
    <div class="filter-row" role="tablist" aria-label="Filtros de transações">
      ${filterButton("all", "Todos")}
      ${filterButton("income", "Receitas")}
      ${filterButton("expense", "Despesas")}
      ${filterButton("private", "Privadas")}
    </div>
    <div class="stack">
      ${filtered.map(renderTransaction).join("") || empty("Nenhuma transação encontrada.")}
    </div>
  `;
}

function filterButton(filter, label) {
  return `<button class="${state.filter === filter ? "is-active" : ""}" data-filter="${filter}" type="button">${label}</button>`;
}

function renderTransaction(tx) {
  const category = categoryByName(tx.category);
  const amountClass = tx.type === "income" ? "amount-positive" : "amount-negative";
  const sign = tx.type === "income" ? "" : "- ";
  return `
    <article class="transaction-row">
      <div class="transaction-main">
        <span class="category-dot" style="background:${category.color}" aria-hidden="true"></span>
        <div>
          <h3>${escapeHtml(tx.description)}</h3>
          <div class="transaction-meta">
            <span class="badge ${tx.visibility}">${tx.visibility === "private" ? "Privada" : "Familiar"}</span>
            <span class="pill">${escapeHtml(tx.category)}</span>
            <span class="pill">${escapeHtml(tx.person)}</span>
            <span class="pill">${txDate(tx.date)}</span>
            ${tx.recurring ? '<span class="pill">Recorrente</span>' : ""}
            ${tx.sourceImportId ? '<span class="pill">Importado</span>' : ""}
          </div>
        </div>
      </div>
      <div class="transaction-actions">
        <strong class="${amountClass}">${sign}${money(tx.amount)}</strong>
        <button class="icon-button" data-delete-tx="${tx.id}" type="button" aria-label="Excluir ${escapeHtml(tx.description)}">×</button>
      </div>
    </article>
  `;
}

function renderReports() {
  const byCategory = categories
    .map((category) => ({
      category: category.name,
      spent: categorySpent(category.name),
    }))
    .filter((item) => item.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const max = Math.max(...byCategory.map((item) => item.spent), 1);
  const summary = calculateSummary();

  appContent.innerHTML = `
    <div class="view-title">
      <div>
        <p class="eyebrow">Relatórios</p>
        <h2>Comparativos do mês</h2>
        <p>Veja para onde o dinheiro foi, quais categorias mudaram e como isso afeta o saldo familiar.</p>
      </div>
      <span class="pill">${Math.round((summary.expenses / summary.income) * 100)}% da renda usada</span>
    </div>
    <div class="grid two-col">
      <section class="card">
        <div class="section-title">
          <h2>Gastos por categoria</h2>
          <span class="muted">${money(summary.expenses)}</span>
        </div>
        <div class="bar-chart">
          ${byCategory
            .map(
              (item) => `
                <div class="chart-row">
                  <strong>${item.category}</strong>
                  <div class="chart-bar"><span style="--value:${Math.round((item.spent / max) * 100)}%"></span></div>
                  <span>${money(item.spent)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="card">
        <div class="section-title">
          <h2>Resumo da IA</h2>
          <span class="pill">Outubro</span>
        </div>
        <p>${monthlyNarrative()}</p>
        <div class="stack">
          ${reportLine("Receita x despesas", money(summary.income), money(summary.expenses))}
          ${reportLine("Fixas previstas", money(fixedExpenses()), "novembro")}
          ${reportLine("Privadas nos totais", money(privateExpenses()), "descrição protegida")}
        </div>
      </section>
    </div>
    <section class="card table-card">
      <div class="section-title">
        <h2>Comparação entre meses</h2>
        <span class="muted">Dados demonstrativos</span>
      </div>
      <table>
        <thead>
          <tr><th>Categoria</th><th>Setembro</th><th>Outubro</th><th>Variação</th></tr>
        </thead>
        <tbody>
          ${comparisonRows()}
        </tbody>
      </table>
    </section>
  `;
}

function reportLine(label, left, right) {
  return `
    <div class="report-row">
      <span>${label}</span>
      <strong>${left}</strong>
      <span class="muted">${right}</span>
    </div>
  `;
}

function comparisonRows() {
  const rows = [
    ["Alimentação", 1420, categorySpent("Alimentação")],
    ["Transporte", 740, categorySpent("Transporte")],
    ["Lazer", 430, categorySpent("Lazer")],
    ["Contas", 510, categorySpent("Contas")],
  ];
  return rows
    .map(([category, previous, current]) => {
      const variation = Math.round(((current - previous) / previous) * 100);
      return `<tr><td>${category}</td><td>${money(previous)}</td><td>${money(current)}</td><td class="${variation > 0 ? "amount-negative" : "amount-positive"}">${variation > 0 ? "+" : ""}${variation}%</td></tr>`;
    })
    .join("");
}

function monthlyNarrative() {
  const food = categorySpent("Alimentação");
  const leisure = categorySpent("Lazer");
  const fixed = fixedExpenses();
  return `Outubro mostra boa sobra mensal, mas alimentação (${money(food)}) e lazer (${money(leisure)}) concentram os principais riscos. As despesas fixas recorrentes projetam ${money(fixed)} para novembro.`;
}

function fixedExpenses() {
  return state.transactions
    .filter((tx) => tx.type === "expense" && tx.recurring)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function privateExpenses() {
  return state.transactions
    .filter((tx) => tx.type === "expense" && tx.visibility === "private")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function renderImports() {
  const active = getActiveImport();
  const status = state.importStatus;
  const pending = state.imports.filter((item) => item.status === "review" || item.status === "needs_review").length;
  appContent.innerHTML = `
    <div class="view-title">
      <div>
        <p class="eyebrow">Arquivos e faturas</p>
        <h2>Importar dados financeiros</h2>
        <p>Envie PDF, foto, texto ou CSV. O app extrai o texto, sugere lançamentos e salva somente o que você confirmar.</p>
      </div>
      <span class="pill">${pending} em revisão</span>
    </div>

    <div class="grid two-col import-layout">
      <section class="card">
        <div class="section-title">
          <div>
            <h2>Novo arquivo</h2>
            <span class="muted">Fatura de cartão, recibo, comprovante ou extrato.</span>
          </div>
        </div>
        <label class="upload-zone" for="fileInput">
          <span class="upload-icon" aria-hidden="true">⇪</span>
          <strong>Selecionar PDF ou foto</strong>
          <span>PDF, JPG, PNG, TXT ou CSV. Para foto, use imagem nítida e bem iluminada.</span>
        </label>
        <input id="fileInput" class="sr-only" type="file" accept=".pdf,.txt,.csv,image/*,application/pdf,text/plain,text/csv" />
        ${
          status
            ? `<div class="import-status">
                <div class="split-row"><strong>${escapeHtml(status.fileName)}</strong><span>${status.progress || 0}%</span></div>
                <div class="progress-track"><span class="progress-fill" style="--value:${status.progress || 0}%"></span></div>
                <span class="muted">${escapeHtml(status.message)}</span>
              </div>`
            : ""
        }
      </section>

      <section class="card">
        <div class="section-title">
          <h2>Arquivos importados</h2>
          <span class="muted">${state.imports.length} no histórico</span>
        </div>
        <div class="stack">
          ${state.imports.map(renderImportHistoryItem).join("") || empty("Nenhum arquivo importado ainda.")}
        </div>
      </section>
    </div>

    ${active ? renderImportReview(active) : ""}
  `;
}

function renderImportHistoryItem(item) {
  const count = item.suggestedTransactions?.length || 0;
  const imported = item.importedTransactionIds?.length || 0;
  const statusLabel = item.status === "imported" ? "salvo" : item.status === "error" ? "erro" : "revisar";
  return `
    <button class="import-history-item ${state.activeImportId === item.id ? "is-active" : ""}" data-select-import="${item.id}" type="button">
      <span>
        <strong>${escapeHtml(compactText(item.fileName, 42))}</strong>
        <small class="muted">${fileSize(item.fileSize)} · ${count} encontrados · ${imported} salvos</small>
      </span>
      <span class="badge ${item.status === "imported" ? "family" : "private"}">${statusLabel}</span>
    </button>
  `;
}

function renderImportReview(item) {
  const rows = item.suggestedTransactions || [];
  const unsaved = rows.filter((tx) => !item.importedTransactionIds?.includes(tx.id));
  const total = rows.reduce((sum, tx) => sum + (tx.type === "expense" ? tx.amount : -tx.amount), 0);
  return `
    <section class="card import-review">
      <div class="section-title">
        <div>
          <p class="eyebrow">Revisão</p>
          <h2>${escapeHtml(item.fileName)}</h2>
          <span class="muted">${rows.length} possíveis lançamentos · ${money(total)} em saídas líquidas</span>
        </div>
        <div class="import-actions">
          <button class="secondary-button" data-open-stored-file="${item.id}" type="button">Abrir arquivo</button>
          <button class="primary-button" data-save-import="${item.id}" type="button" ${unsaved.length ? "" : "disabled"}>Salvar lançamentos</button>
        </div>
      </div>
      ${
        item.status === "error"
          ? `<div class="empty-state">${escapeHtml(item.error || "Não foi possível ler esse arquivo.")}</div>`
          : rows.length
            ? renderImportTable(item, rows)
            : `<div class="empty-state">Não encontrei linhas com data e valor. Confira o texto extraído abaixo ou registre manualmente.</div>`
      }
      <details class="source-text">
        <summary>Texto extraído</summary>
        <pre>${escapeHtml((item.extractedText || "Sem texto extraído.").slice(0, 8000))}</pre>
      </details>
    </section>
  `;
}

function renderImportTable(item, rows) {
  return `
    <div class="table-card import-table">
      <table>
        <thead>
          <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Confiança</th><th>Valor</th></tr>
        </thead>
        <tbody>
          ${rows
            .map((tx) => {
              const saved = item.importedTransactionIds?.includes(tx.id);
              const amountClass = tx.type === "expense" ? "amount-negative" : "amount-positive";
              return `
                <tr class="${saved ? "is-saved" : ""}">
                  <td>${txDate(tx.date)}</td>
                  <td>
                    <strong>${escapeHtml(tx.description)}</strong>
                    <small class="muted">${saved ? "salvo" : escapeHtml(compactText(tx.rawLine, 80))}</small>
                  </td>
                  <td>${escapeHtml(tx.category)}</td>
                  <td>${tx.confidence || 70}%</td>
                  <td class="${amountClass}">${tx.type === "expense" ? "- " : ""}${money(tx.amount)}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAssistant() {
  appContent.innerHTML = `
    <div class="view-title">
      <div>
        <p class="eyebrow">Family AI</p>
        <h2>Assistente financeiro</h2>
        <p>Faça perguntas sobre os dados da família ou peça para preparar uma despesa. Nada é salvo sem confirmação.</p>
      </div>
      <span class="pill">Contexto familiar</span>
    </div>
    <div class="assistant-layout">
      <section class="card">
        <div class="chat-window" id="chatWindow">
          ${state.assistant.map((message) => `<div class="assistant-message ${message.role}">${message.text}</div>`).join("")}
        </div>
        <form class="chat-form" id="chatForm">
          <input name="prompt" placeholder="Ex.: Adiciona 89 reais de gasolina hoje" autocomplete="off" />
          <button class="primary-button" type="submit">Enviar</button>
        </form>
        <div class="suggestion-list">
          ${["Quanto gastamos com alimentação?", "Tem alguma assinatura pesando?", "Se continuarmos assim, quanto sobra?", "Adiciona 89 reais de gasolina hoje"].map((item) => `<button data-suggestion="${item}" type="button">${item}</button>`).join("")}
        </div>
      </section>
      <aside class="card">
        <div class="section-title">
          <h2>Leitura rápida</h2>
        </div>
        <div class="stack">
          ${aiCapability("Perguntas", "Responde usando receitas, despesas, metas e orçamentos da família.")}
          ${aiCapability("Categorização", "Sugere categoria a partir de descrições como Uber, Drogasil ou Netflix.")}
          ${aiCapability("Comandos", "Prepara lançamentos e pede confirmação antes de salvar.")}
        </div>
      </aside>
    </div>
  `;
  const chatWindow = document.querySelector("#chatWindow");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function aiCapability(title, text) {
  return `<div class="category-row"><div><strong>${title}</strong><span class="muted">${text}</span></div></div>`;
}

function answerAssistant(prompt) {
  const normalized = prompt.toLowerCase();
  const command = parseAiTransaction(prompt);
  if (command) {
    stagedAiEntry = command;
    openConfirmModal(command);
    return "Preparei uma despesa para revisão. Confira os dados e confirme se estiver tudo certo.";
  }
  if (normalized.includes("aliment")) {
    const food = categorySpent("Alimentação");
    return `Neste mês, a família gastou ${money(food)} com alimentação. Delivery responde por ${money(categorySpent("Alimentação") - 600)} desse total.`;
  }
  if (normalized.includes("assinatura")) {
    return "Encontrei três cobranças recorrentes que parecem assinaturas ou contas fixas: Internet, energia e serviços digitais. Elas somam aproximadamente R$ 446,90 por mês.";
  }
  if (normalized.includes("sobra") || normalized.includes("continuarmos")) {
    const summary = calculateSummary();
    return `Se o ritmo atual continuar, a sobra estimada do mês fica perto de ${money(summary.saving)} antes de novas contas não previstas.`;
  }
  if (normalized.includes("meta") || normalized.includes("viagem")) {
    const goal = state.goals[0];
    const remaining = goal.target - goal.saved;
    return `Para a meta "${goal.name}", ainda faltam ${money(remaining)}. Guardar cerca de ${money(remaining / 14)} por mês até dezembro de 2027 manteria a família no prazo.`;
  }
  return createInsight().text;
}

function parseAiTransaction(prompt) {
  const normalized = prompt.toLowerCase();
  if (!/(adiciona|coloca|registra|lança)/.test(normalized)) return null;
  const amountMatch = normalized.match(/(\d+(?:[,.]\d{1,2})?)/);
  if (!amountMatch) return null;
  const amount = parseMoney(amountMatch[1]);
  const category = inferCategory(normalized);
  const description = inferDescription(normalized, category);
  return {
    id: crypto.randomUUID(),
    type: "expense",
    amount,
    description,
    category,
    person: "Gabriel",
    account: "Nubank",
    date: today(),
    visibility: "family",
    recurring: normalized.includes("todo dia") || normalized.includes("mensal"),
  };
}

function inferCategory(text) {
  if (/(uber|gasolina|combust|transporte)/.test(text)) return "Transporte";
  if (/(mercado|supermercado|comida|delivery|restaurante)/.test(text)) return "Alimentação";
  if (/(drogasil|farmácia|remédio|consulta)/.test(text)) return "Saúde";
  if (/(netflix|spotify|assinatura)/.test(text)) return "Assinaturas";
  if (/(internet|energia|água|conta)/.test(text)) return "Contas";
  if (/(cinema|jogo|passeio|lazer)/.test(text)) return "Lazer";
  return "Outros";
}

function inferDescription(text, category) {
  if (text.includes("gasolina")) return "Gasolina";
  if (text.includes("uber")) return "Uber";
  if (text.includes("internet")) return "Internet";
  if (text.includes("mercado")) return "Mercado";
  if (text.includes("drogasil")) return "Drogasil";
  return category;
}

function getActiveImport() {
  return state.imports.find((item) => item.id === state.activeImportId) || state.imports[0] || null;
}

function updateImportStatus(fileName, message, progress) {
  state.importStatus = { fileName, message, progress };
  persist();
  if (state.view === "imports") renderImports();
}

async function processUploadedFile(file) {
  if (!file) return;
  const id = crypto.randomUUID();
  const record = {
    id,
    fileName: file.name || "arquivo",
    fileType: file.type || "desconhecido",
    fileSize: file.size || 0,
    createdAt: new Date().toISOString(),
    status: "processing",
    extractedText: "",
    suggestedTransactions: [],
    importedTransactionIds: [],
    totals: null,
    error: "",
  };
  state.imports = [record, ...state.imports].slice(0, 20);
  state.activeImportId = id;
  updateImportStatus(record.fileName, "Guardando arquivo no navegador...", 8);
  renderImports();

  try {
    await saveFileBlob(id, file);
    const text = await extractFileText(file, (message, progress) => updateImportStatus(record.fileName, message, progress));
    const parsed = parseStatementText(text, record.fileName, id);
    record.extractedText = text.trim();
    record.suggestedTransactions = parsed.transactions;
    record.totals = parsed.totals;
    record.status = parsed.transactions.length ? "review" : "needs_review";
    state.importStatus = null;
    persist();
    renderImports();
    showToast(parsed.transactions.length ? `${parsed.transactions.length} lançamentos encontrados.` : "Arquivo lido. Revise o texto extraído.");
  } catch (error) {
    record.status = "error";
    record.error = error?.message || "Não foi possível processar esse arquivo.";
    state.importStatus = null;
    persist();
    renderImports();
    showToast("Não consegui ler esse arquivo.");
  }
}

async function extractFileText(file, update) {
  const type = file.type || "";
  const name = file.name.toLowerCase();
  if (type.includes("pdf") || name.endsWith(".pdf")) return extractPdfText(file, update);
  if (type.startsWith("image/")) return extractImageText(file, update);
  if (type.includes("text") || name.endsWith(".txt") || name.endsWith(".csv")) {
    update("Lendo texto do arquivo...", 55);
    return file.text();
  }
  throw new Error("Formato ainda não suportado. Use PDF, foto, TXT ou CSV.");
}

async function extractPdfText(file, update) {
  if (!window.pdfjsLib) {
    await loadExternalScript("pdfjs", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  }
  if (!window.pdfjsLib) throw new Error("Leitor de PDF indisponível no navegador.");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  update("Abrindo PDF...", 15);
  const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const progress = Math.round(15 + (pageNumber / pdf.numPages) * 65);
    update(`Lendo página ${pageNumber} de ${pdf.numPages}...`, progress);
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    let pageText = textContent.items.map((item) => item.str).join(" ");
    if (pageText.trim().length < 24 && window.Tesseract) {
      update(`Aplicando OCR na página ${pageNumber}...`, progress);
      pageText = await ocrPdfPage(page);
    }
    pages.push(pageText);
  }
  update("Organizando dados encontrados...", 90);
  return pages.join("\n");
}

async function ocrPdfPage(page) {
  if (!window.Tesseract) {
    await loadExternalScript("tesseract", "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
  }
  const viewport = page.getViewport({ scale: 1.7 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport }).promise;
  const result = await window.Tesseract.recognize(canvas, "por+eng");
  return result.data.text || "";
}

async function extractImageText(file, update) {
  if (!window.Tesseract) {
    await loadExternalScript("tesseract", "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
  }
  if (!window.Tesseract) throw new Error("OCR de imagem indisponível no navegador.");
  update("Lendo texto da imagem...", 12);
  const result = await window.Tesseract.recognize(file, "por+eng", {
    logger(event) {
      if (event.status === "recognizing text") {
        update("Reconhecendo texto da imagem...", Math.round(15 + (event.progress || 0) * 75));
      }
    },
  });
  update("Organizando dados encontrados...", 92);
  return result.data.text || "";
}

function loadExternalScript(key, src) {
  if (!scriptLoaders[key]) {
    scriptLoaders[key] = new Promise((resolve, reject) => {
      const existing = [...document.scripts].find((script) => script.src === src);
      if (existing?.dataset.loaded === "true") {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => reject(new Error("Não consegui carregar o leitor do arquivo."));
      document.head.appendChild(script);
    });
  }
  return scriptLoaders[key];
}

function parseStatementText(text, fileName, importId) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const transactions = [];
  const amountRegex = /(?:R\$\s*)?-?\d{1,3}(?:\.\d{3})*,\d{2}|(?:R\$\s*)?-?\d+,\d{2}/g;
  const dateRegex = /\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    const amountMatches = [...line.matchAll(amountRegex)];
    if (!dateMatch || !amountMatches.length) continue;

    const amountToken = amountMatches.at(-1)[0];
    const amount = Math.abs(parseMoney(amountToken));
    if (!amount) continue;

    const rawDescription = line
      .replace(dateMatch[0], " ")
      .replace(amountToken, " ")
      .replace(/\b(parcela|compra|credito|crédito|debito|débito)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (rawDescription.length < 2) continue;

    const type = isCreditLine(line) ? "income" : "expense";
    const description = compactText(rawDescription, 64);
    const category = type === "income" ? "Receita" : inferCategory(description.toLowerCase());
    transactions.push({
      id: crypto.randomUUID(),
      sourceImportId: importId,
      sourceFileName: fileName,
      type,
      amount,
      description,
      category,
      person: "Gabriel",
      account: "Nubank",
      date: normalizeImportedDate(dateMatch),
      visibility: "family",
      recurring: false,
      rawLine: line,
      confidence: scoreImportedLine(line, description, amount),
    });
  }

  const unique = dedupeImportedTransactions(transactions).slice(0, 80);
  const expenseTotal = unique.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const creditTotal = unique.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  return {
    transactions: unique,
    totals: { expenseTotal, creditTotal, count: unique.length },
  };
}

function normalizeImportedDate(match) {
  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const baseYear = today().slice(0, 4);
  const year = match[3] ? (match[3].length === 2 ? `20${match[3]}` : match[3]) : baseYear;
  return `${year}-${month}-${day}`;
}

function isCreditLine(line) {
  return /(pagamento|crédito|credito|estorno|reembolso|cashback|ajuste|recebido)/i.test(line);
}

function scoreImportedLine(line, description, amount) {
  let score = 62;
  if (description.length > 5) score += 14;
  if (amount > 0) score += 10;
  if (/R\$/i.test(line)) score += 7;
  if (/(nubank|visa|master|elo|cartão|cartao|fatura|compra)/i.test(line)) score += 4;
  return Math.min(score, 96);
}

function dedupeImportedTransactions(transactions) {
  const seen = new Set();
  return transactions.filter((tx) => {
    const key = `${tx.date}|${tx.description.toLowerCase()}|${tx.amount}|${tx.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function saveImportedTransactions(importId) {
  const record = state.imports.find((item) => item.id === importId);
  if (!record) return;
  const alreadySaved = new Set(record.importedTransactionIds || []);
  const toSave = (record.suggestedTransactions || []).filter((tx) => !alreadySaved.has(tx.id));
  if (!toSave.length) {
    showToast("Nada novo para salvar.");
    return;
  }
  for (const tx of toSave) {
    addTransactionWithoutRender(tx);
    alreadySaved.add(tx.id);
  }
  record.importedTransactionIds = [...alreadySaved];
  record.status = "imported";
  persist();
  render();
  showToast(`${toSave.length} lançamentos salvos.`);
}

function addTransactionWithoutRender(tx) {
  state.transactions = [tx, ...state.transactions];
  const account = state.accounts.find((item) => item.name === tx.account);
  if (account) account.balance += tx.type === "income" ? tx.amount : -tx.amount;
}

async function saveFileBlob(id, file) {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(fileStoreName, "readwrite");
    tx.objectStore(fileStoreName).put({
      id,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      savedAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function openStoredFile(id) {
  const db = await openFileDb();
  const stored = await new Promise((resolve, reject) => {
    const tx = db.transaction(fileStoreName, "readonly");
    const request = tx.objectStore(fileStoreName).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (!stored?.file) {
    showToast("Arquivo original não está mais neste navegador.");
    return;
  }
  const url = URL.createObjectURL(stored.file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function openFileDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(fileDbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(fileStoreName)) db.createObjectStore(fileStoreName, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function renderSidePanel() {
  document.querySelector("#memberRow").innerHTML = state.members
    .map(
      (member) => `
        <div class="member-item">
          <span class="avatar">${member.initials}</span>
          <div><strong>${member.name}</strong><span class="muted">${member.role}</span></div>
          <span class="badge family">Ativo</span>
        </div>
      `,
    )
    .join("");

  const importList = document.querySelector("#importList");
  if (importList) {
    const recentImports = state.imports.slice(0, 3);
    importList.innerHTML =
      recentImports
        .map((item) => {
          const pending = item.status === "review" || item.status === "needs_review";
          return `
            <button class="account-item side-import" data-select-import="${item.id}" type="button">
              <div class="split-row">
                <div><strong>${escapeHtml(compactText(item.fileName, 32))}</strong><span class="muted">${item.suggestedTransactions?.length || 0} lançamentos</span></div>
                <span class="badge ${pending ? "private" : "family"}">${pending ? "revisar" : "ok"}</span>
              </div>
            </button>
          `;
        })
        .join("") || empty("Sem arquivos.");
  }

  document.querySelector("#goalList").innerHTML = state.goals
    .map((goal) => {
      const percent = Math.round((goal.saved / goal.target) * 100);
      return `
        <div class="goal-item">
          <div class="budget-head">
            <strong>${goal.name}</strong>
            <span class="muted">${percent}%</span>
          </div>
          <div class="progress-track">
            <span class="progress-fill" style="--value:${percent}%"></span>
          </div>
          <small class="muted">${money(goal.saved)} / ${money(goal.target)} · ${goal.due}</small>
        </div>
      `;
    })
    .join("");

  document.querySelector("#accountList").innerHTML = state.accounts
    .map(
      (account) => `
        <div class="account-item">
          <div class="split-row">
            <div><strong>${account.name}</strong><span class="muted">${account.type}</span></div>
            <strong>${money(account.balance)}</strong>
          </div>
        </div>
      `,
    )
    .join("");
}

function empty(message) {
  return `<div class="empty-state">${message}</div>`;
}

function openEntryModal() {
  entryForm.reset();
  entryForm.elements.date.value = today();
  fillFormOptions();
  entryModal.hidden = false;
  entryForm.elements.amount.focus();
}

function closeEntryModal() {
  entryModal.hidden = true;
}

function openGoalModal() {
  goalForm.reset();
  goalModal.hidden = false;
  goalForm.elements.name.focus();
}

function closeGoalModal() {
  goalModal.hidden = true;
}

function fillFormOptions() {
  const categorySelect = entryForm.elements.category;
  const personSelect = entryForm.elements.person;
  const accountSelect = entryForm.elements.account;
  categorySelect.innerHTML = categories.map((category) => `<option>${category.name}</option>`).join("");
  personSelect.innerHTML = state.members.map((member) => `<option>${member.name}</option>`).join("");
  accountSelect.innerHTML = state.accounts.map((account) => `<option>${account.name}</option>`).join("");
}

function addTransaction(tx) {
  state.transactions = [tx, ...state.transactions];
  const account = state.accounts.find((item) => item.name === tx.account);
  if (account) {
    account.balance += tx.type === "income" ? tx.amount : -tx.amount;
  }
  persist();
  render();
}

function removeTransaction(id) {
  const tx = state.transactions.find((item) => item.id === id);
  if (!tx) return;
  const account = state.accounts.find((item) => item.name === tx.account);
  if (account) {
    account.balance += tx.type === "income" ? -tx.amount : tx.amount;
  }
  state.transactions = state.transactions.filter((item) => item.id !== id);
  persist();
  render();
}

function handleEntrySubmit(event) {
  event.preventDefault();
  const data = new FormData(entryForm);
  const tx = {
    id: crypto.randomUUID(),
    type: data.get("type"),
    amount: parseMoney(data.get("amount")),
    description: data.get("description").trim(),
    category: data.get("type") === "income" ? "Receita" : data.get("category"),
    person: data.get("person"),
    account: data.get("account"),
    date: data.get("date"),
    visibility: data.get("visibility"),
    recurring: data.get("recurring") === "on",
  };
  if (!tx.amount || !tx.description) {
    showToast("Preencha valor e descrição.");
    return;
  }
  addTransaction(tx);
  closeEntryModal();
  showToast("Lançamento salvo.");
}

function openConfirmModal(tx) {
  document.querySelector("#confirmPreview").innerHTML = `
    <div class="split-row"><span>Descrição</span><strong>${tx.description}</strong></div>
    <div class="split-row"><span>Valor</span><strong>${money(tx.amount)}</strong></div>
    <div class="split-row"><span>Categoria</span><strong>${tx.category}</strong></div>
    <div class="split-row"><span>Data</span><strong>${txDate(tx.date)}</strong></div>
    <div class="split-row"><span>Conta</span><strong>${tx.account}</strong></div>
  `;
  confirmModal.hidden = false;
}

function closeConfirmModal() {
  confirmModal.hidden = true;
  stagedAiEntry = null;
}

function handleChatSubmit(event) {
  event.preventDefault();
  const input = event.target.elements.prompt;
  const prompt = input.value.trim();
  if (!prompt) return;
  state.assistant.push({ role: "user", text: prompt });
  state.assistant.push({ role: "system", text: answerAssistant(prompt) });
  input.value = "";
  persist();
  renderAssistant();
}

function handleGoalSubmit(event) {
  event.preventDefault();
  const data = new FormData(goalForm);
  const goal = {
    id: crypto.randomUUID(),
    name: data.get("name").trim(),
    target: parseMoney(data.get("target")),
    saved: parseMoney(data.get("saved")),
    due: data.get("due").trim(),
  };
  if (!goal.name || !goal.target || !goal.due) {
    showToast("Preencha nome, valor alvo e prazo.");
    return;
  }
  state.goals = [goal, ...state.goals];
  persist();
  render();
  closeGoalModal();
  showToast("Meta criada.");
}

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const report = (error) => console.warn("WebMCP", error);
  try {
    Promise.resolve(
      context.registerTool({
        name: "read_family_finance_summary",
        title: "Ler resumo financeiro",
        description: "Retorna o resumo financeiro atual da família exibido no app.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute() {
          return calculateSummary();
        },
      }),
    ).catch(report);
    Promise.resolve(
      context.registerTool({
        name: "read_family_imports",
        title: "Ler importações",
        description: "Retorna um resumo dos arquivos importados e quantos lançamentos foram encontrados.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute() {
          return state.imports.map((item) => ({
            id: item.id,
            fileName: item.fileName,
            status: item.status,
            suggestedTransactions: item.suggestedTransactions?.length || 0,
            savedTransactions: item.importedTransactionIds?.length || 0,
          }));
        },
      }),
    ).catch(report);
    Promise.resolve(
      context.registerTool({
        name: "stage_family_transaction",
        title: "Preparar lançamento",
        description: "Prepara uma despesa familiar com confirmação visível antes de salvar.",
        inputSchema: {
          type: "object",
          properties: {
            description: { type: "string" },
            amount: { type: "number", exclusiveMinimum: 0 },
            category: { type: "string" },
          },
          required: ["description", "amount", "category"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const allowedCategories = categories.map((category) => category.name);
          if (
            !input ||
            typeof input.description !== "string" ||
            typeof input.amount !== "number" ||
            !allowedCategories.includes(input.category)
          ) {
            throw new Error("Informe descrição, valor e uma categoria válida.");
          }
          stagedAiEntry = {
            id: crypto.randomUUID(),
            type: "expense",
            amount: input.amount,
            description: input.description,
            category: input.category,
            person: "Gabriel",
            account: "Nubank",
            date: today(),
            visibility: "family",
            recurring: false,
          };
          openConfirmModal(stagedAiEntry);
          return { status: "staged", transaction: stagedAiEntry };
        },
      }),
    ).catch(report);
  } catch (error) {
    report(error);
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.view) setView(target.dataset.view);
  if (target.dataset.selectImport) {
    state.activeImportId = target.dataset.selectImport;
    setView("imports");
  }
  if (target.dataset.saveImport) saveImportedTransactions(target.dataset.saveImport);
  if (target.dataset.openStoredFile) await openStoredFile(target.dataset.openStoredFile);
  if (target.matches("#mainAddButton") || target.dataset.openModal === "transaction") openEntryModal();
  if (target.dataset.openModal === "goal") openGoalModal();
  if (target.dataset.closeModal !== undefined) closeEntryModal();
  if (target.dataset.closeConfirm !== undefined) closeConfirmModal();
  if (target.dataset.closeGoal !== undefined) closeGoalModal();
  if (target.dataset.filter) {
    state.filter = target.dataset.filter;
    persist();
    renderTransactions();
  }
  if (target.dataset.deleteTx) {
    removeTransaction(target.dataset.deleteTx);
    showToast("Transação removida.");
  }
  if (target.dataset.suggestion) {
    const form = document.querySelector("#chatForm");
    form.elements.prompt.value = target.dataset.suggestion;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }
  if (target.matches("#confirmAiEntry") && stagedAiEntry) {
    addTransaction(stagedAiEntry);
    state.assistant.push({ role: "system", text: `${stagedAiEntry.description} foi salvo em ${stagedAiEntry.category}.` });
    persist();
    closeConfirmModal();
    setView("transactions");
    showToast("Lançamento confirmado.");
  }
  if (target.matches("#themeToggle")) {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = state.theme;
    persist();
  }
  if (target.matches("#inviteButton")) {
    navigator.clipboard?.writeText("FAMILY-CASTRO-2026");
    showToast("Código de convite copiado: FAMILY-CASTRO-2026");
  }
});

entryForm.addEventListener("submit", handleEntrySubmit);
goalForm.addEventListener("submit", handleGoalSubmit);
document.addEventListener("change", (event) => {
  if (event.target.matches("#fileInput")) {
    const [file] = event.target.files || [];
    void processUploadedFile(file);
    event.target.value = "";
  }
});
document.addEventListener("submit", (event) => {
  if (event.target.matches("#chatForm")) handleChatSubmit(event);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeEntryModal();
    closeConfirmModal();
    closeGoalModal();
  }
});

render();
registerWebMcpTools();
