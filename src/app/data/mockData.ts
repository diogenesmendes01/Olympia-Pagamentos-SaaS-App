export const currentUser = {
  name: "Rafael Oliveira",
  email: "rafael@olympiapag.com.br",
  role: "Administrador",
  avatar: "RO",
  company: "Olympia Pagamentos",
  cnpj: "12.345.678/0001-90",
};

export const kpiData = {
  recebidoMes: 284500.0,
  recebidoMesTrend: 12.4,
  aReceber30d: 156200.0,
  aReceber30dTrend: 8.2,
  apagarProx30d: 89300.0,
  apagarProx30dTrend: -3.1,
  saldoConta: 342150.0,
  saldoContaTrend: 18.7,
  taxaInadimplencia: 3.2,
  taxaInadimplenciaTrend: -0.8,
  dso: 28,
  dsoTrend: -2,
};

export const cashFlowChartData = [
  { mes: "Nov", recebido: 45200, pago: 31800, saldo: 13400 },
  { mes: "Dez", recebido: 62400, pago: 41200, saldo: 21200 },
  { mes: "Jan", recebido: 58100, pago: 38500, saldo: 19600 },
  { mes: "Fev", recebido: 71300, pago: 45600, saldo: 25700 },
  { mes: "Mar", recebido: 84500, pago: 52100, saldo: 32400 },
  { mes: "Abr", recebido: 92000, pago: 61200, saldo: 30800 },
];

export const cashProjectionData = [
  { dia: "Hoje", saldo: 342150 },
  { dia: "7d", saldo: 358400 },
  { dia: "15d", saldo: 371200 },
  { dia: "30d", saldo: 395800 },
  { dia: "45d", saldo: 412300 },
  { dia: "60d", saldo: 445600 },
  { dia: "75d", saldo: 478900 },
  { dia: "90d", saldo: 512400 },
];

export const receivablesByMethod = [
  { name: "Pix", value: 42, color: "#00C49F" },
  { name: "Boleto", value: 28, color: "#3B82F6" },
  { name: "Cartão", value: 18, color: "#8B5CF6" },
  { name: "TED/DOC", value: 12, color: "#F59E0B" },
];

export const alerts = [
  {
    id: 1,
    type: "danger",
    title: "3 faturas vencidas hoje",
    description: "Total de R$ 12.400,00 em atraso — Clientes: Grupo Nexus, Tech Solutions, MK Distribuidora",
    time: "Agora",
  },
  {
    id: 2,
    type: "warning",
    title: "Saldo insuficiente para pagamento amanhã",
    description: "DARF de R$ 8.340,00 vence em 24h — saldo projetado: R$ 6.200,00",
    time: "1h atrás",
  },
  {
    id: 3,
    type: "info",
    title: "Boleto recebido automaticamente",
    description: "R$ 4.500,00 — Empresa Alfa Ltda — conciliado via Open Finance",
    time: "2h atrás",
  },
  {
    id: 4,
    type: "success",
    title: "Pix recebido R$ 18.200,00",
    description: "Beta Indústria S/A — Fatura #1042 quitada antecipadamente",
    time: "3h atrás",
  },
];

export type Receivable = {
  id: string;
  cliente: string;
  cnpj: string;
  descricao: string;
  valor: number;
  vencimento: string;
  emissao: string;
  status: "pago" | "pendente" | "vencido" | "agendado" | "parcial";
  metodo: "pix" | "boleto" | "cartao" | "ted" | "link";
  nfEmitida: boolean;
  parcelas?: number;
};

export const receivables: Receivable[] = [
  { id: "REC-1042", cliente: "Beta Indústria S/A", cnpj: "23.456.789/0001-10", descricao: "Serviços de Consultoria - Mar/26", valor: 18200.0, vencimento: "2026-04-15", emissao: "2026-03-30", status: "pago", metodo: "pix", nfEmitida: true },
  { id: "REC-1043", cliente: "Grupo Nexus Ltda", cnpj: "34.567.890/0001-21", descricao: "Licença Software Anual", valor: 5600.0, vencimento: "2026-04-22", emissao: "2026-04-01", status: "vencido", metodo: "boleto", nfEmitida: true },
  { id: "REC-1044", cliente: "Tech Solutions ME", cnpj: "45.678.901/0001-32", descricao: "Implementação ERP - Módulo Financeiro", valor: 32000.0, vencimento: "2026-04-22", emissao: "2026-04-10", status: "vencido", metodo: "ted", nfEmitida: false },
  { id: "REC-1045", cliente: "MK Distribuidora Eireli", cnpj: "56.789.012/0001-43", descricao: "Manutenção Mensal - Abr/26", valor: 3800.0, vencimento: "2026-04-22", emissao: "2026-04-01", status: "vencido", metodo: "pix", nfEmitida: true },
  { id: "REC-1046", cliente: "Alfa Comércio Ltda", cnpj: "67.890.123/0001-54", descricao: "Fornecimento Equipamentos", valor: 41500.0, vencimento: "2026-04-30", emissao: "2026-04-15", status: "pendente", metodo: "boleto", nfEmitida: true },
  { id: "REC-1047", cliente: "Construtora Horizonte", cnpj: "78.901.234/0001-65", descricao: "Projeto Arquitetônico - Fase 2", valor: 85000.0, vencimento: "2026-05-05", emissao: "2026-04-20", status: "pendente", metodo: "ted", nfEmitida: false },
  { id: "REC-1048", cliente: "Logística Rápida S/A", cnpj: "89.012.345/0001-76", descricao: "Serviços Logística - Abr/26", valor: 12400.0, vencimento: "2026-05-10", emissao: "2026-04-20", status: "agendado", metodo: "pix", nfEmitida: false },
  { id: "REC-1049", cliente: "StartupBR Tecnologia", cnpj: "90.123.456/0001-87", descricao: "Mensalidade SaaS - Mai/26", valor: 2900.0, vencimento: "2026-05-15", emissao: "2026-04-22", status: "agendado", metodo: "cartao", nfEmitida: false },
  { id: "REC-1050", cliente: "Farmácia Saúde Total", cnpj: "11.222.333/0001-98", descricao: "Consultoria Fiscal Q2/26", valor: 7800.0, vencimento: "2026-05-20", emissao: "2026-04-22", status: "pendente", metodo: "pix", nfEmitida: false },
  { id: "REC-1051", cliente: "Academia Fitness Pro", cnpj: "22.333.444/0001-01", descricao: "Sistema de Gestão - Jun/26", valor: 1490.0, vencimento: "2026-06-01", emissao: "2026-04-22", status: "agendado", metodo: "cartao", nfEmitida: false },
  { id: "REC-1052", cliente: "Omega Engenharia Ltda", cnpj: "33.444.555/0001-12", descricao: "Laudo Técnico + Projetos", valor: 24600.0, vencimento: "2026-04-28", emissao: "2026-04-18", status: "pendente", metodo: "ted", nfEmitida: true },
  { id: "REC-1053", cliente: "Clínica Bem Estar", cnpj: "44.555.666/0001-23", descricao: "Software Clínico - Abr/26", valor: 3200.0, vencimento: "2026-04-10", emissao: "2026-03-28", status: "pago", metodo: "pix", nfEmitida: true },
];

export type Payable = {
  id: string;
  fornecedor: string;
  cnpj: string;
  descricao: string;
  valor: number;
  vencimento: string;
  categoria: string;
  status: "pago" | "pendente" | "vencido" | "agendado" | "aprovacao";
  metodo: "pix" | "boleto" | "ted" | "debito";
  aprovacao: "aprovado" | "pendente" | "rejeitado" | "automatico";
};

export const payables: Payable[] = [
  { id: "PAG-0521", fornecedor: "AWS Brasil", cnpj: "23.195.454/0001-84", descricao: "Infraestrutura Cloud - Abr/26", valor: 3540.0, vencimento: "2026-04-30", categoria: "Tecnologia", status: "pendente", metodo: "pix", aprovacao: "aprovado" },
  { id: "PAG-0522", fornecedor: "Receita Federal (DARF)", cnpj: "00.000.000/0001-00", descricao: "IRPJ + CSLL - 1º Trimestre", valor: 8340.0, vencimento: "2026-04-23", categoria: "Impostos", status: "vencido", metodo: "boleto", aprovacao: "automatico" },
  { id: "PAG-0523", fornecedor: "Folha de Pagamento", cnpj: "12.345.678/0001-90", descricao: "Salários + Encargos - Abr/26", valor: 45200.0, vencimento: "2026-04-30", categoria: "Recursos Humanos", status: "agendado", metodo: "ted", aprovacao: "aprovado" },
  { id: "PAG-0524", fornecedor: "Aluguel - Edifício Platinum", cnpj: "55.666.777/0001-34", descricao: "Aluguel Sala Comercial - Mai/26", valor: 8500.0, vencimento: "2026-05-05", categoria: "Infraestrutura", status: "agendado", metodo: "ted", aprovacao: "automatico" },
  { id: "PAG-0525", fornecedor: "Google Workspace", cnpj: "06.990.590/0001-23", descricao: "Licenças G Suite - Mai/26", valor: 1240.0, vencimento: "2026-05-01", categoria: "Tecnologia", status: "pendente", metodo: "cartao" as any, aprovacao: "automatico" },
  { id: "PAG-0526", fornecedor: "Fornecedora TI Ativa", cnpj: "77.888.999/0001-45", descricao: "Manutenção Servidores", valor: 6800.0, vencimento: "2026-04-25", categoria: "Tecnologia", status: "aprovacao", metodo: "pix", aprovacao: "pendente" },
  { id: "PAG-0527", fornecedor: "GPS - INSS", cnpj: "00.000.000/0001-00", descricao: "Contribuição Previdenciária - Mar/26", valor: 12400.0, vencimento: "2026-04-25", categoria: "Impostos", status: "pago", metodo: "boleto", aprovacao: "automatico" },
  { id: "PAG-0528", fornecedor: "Seguradora Proteção Total", cnpj: "88.999.000/0001-56", descricao: "Seguro Empresarial Anual", valor: 4200.0, vencimento: "2026-05-15", categoria: "Seguros", status: "pendente", metodo: "boleto", aprovacao: "pendente" },
  { id: "PAG-0529", fornecedor: "Contabilidade Precisão", cnpj: "99.000.111/0001-67", descricao: "Serviços Contábeis - Abr/26", valor: 3800.0, vencimento: "2026-04-28", categoria: "Serviços", status: "pendente", metodo: "pix", aprovacao: "aprovado" },
  { id: "PAG-0530", fornecedor: "ISS Municipal", cnpj: "00.000.000/0001-00", descricao: "ISS Competência Mar/26", valor: 2100.0, vencimento: "2026-04-22", categoria: "Impostos", status: "pago", metodo: "boleto", aprovacao: "automatico" },
];

export const users = [
  { id: 1, nome: "Rafael Oliveira", email: "rafael@olympiapag.com.br", role: "Administrador", status: "ativo", ultimoAcesso: "Agora", mfa: true, avatar: "RO" },
  { id: 2, nome: "Carolina Mendes", email: "carolina@olympiapag.com.br", role: "Financeiro", status: "ativo", ultimoAcesso: "2h atrás", mfa: true, avatar: "CM" },
  { id: 3, nome: "Bruno Santos", email: "bruno@olympiapag.com.br", role: "Operacional", status: "ativo", ultimoAcesso: "1d atrás", mfa: false, avatar: "BS" },
  { id: 4, nome: "Juliana Costa", email: "juliana@olympiapag.com.br", role: "Visualizador", status: "ativo", ultimoAcesso: "3d atrás", mfa: true, avatar: "JC" },
  { id: 5, nome: "Pedro Alves", email: "pedro.alves@escritoriocontabil.com.br", role: "Contador Externo", status: "ativo", ultimoAcesso: "5d atrás", mfa: false, avatar: "PA" },
  { id: 6, nome: "Mariana Silva", email: "mariana@olympiapag.com.br", role: "Financeiro", status: "inativo", ultimoAcesso: "15d atrás", mfa: false, avatar: "MS" },
];

export const auditLog = [
  { id: 1, usuario: "Rafael Oliveira", acao: "Aprovou pagamento PAG-0527 (R$ 12.400,00)", ip: "177.52.34.12", horario: "22/04/26 09:14" },
  { id: 2, usuario: "Carolina Mendes", acao: "Criou cobrança REC-1052 para Omega Engenharia", ip: "189.32.54.21", horario: "22/04/26 08:52" },
  { id: 3, usuario: "Bruno Santos", acao: "Enviou lembrete de cobrança para MK Distribuidora", ip: "201.18.45.67", horario: "22/04/26 08:30" },
  { id: 4, usuario: "Rafael Oliveira", acao: "Login realizado — novo dispositivo MacBook Pro", ip: "177.52.34.12", horario: "22/04/26 08:01" },
  { id: 5, usuario: "Sistema", acao: "Conciliação automática — 3 pagamentos confirmados via Open Finance", ip: "—", horario: "22/04/26 07:00" },
];

export const recentTransactions = [
  { id: "REC-1042", tipo: "recebido", cliente: "Beta Indústria S/A", valor: 18200.0, metodo: "pix", horario: "09:32" },
  { id: "PAG-0527", tipo: "pago", cliente: "GPS - INSS", valor: -12400.0, metodo: "boleto", horario: "09:14" },
  { id: "REC-1053", tipo: "recebido", cliente: "Clínica Bem Estar", valor: 3200.0, metodo: "pix", horario: "08:47" },
  { id: "PAG-0530", tipo: "pago", cliente: "ISS Municipal", valor: -2100.0, metodo: "boleto", horario: "08:22" },
  { id: "REC-1041", tipo: "recebido", cliente: "Zeta Comercial Ltda", valor: 7650.0, metodo: "ted", horario: "Ontem" },
  { id: "PAG-0519", tipo: "pago", cliente: "Aluguel - Edifício Platinum", valor: -8500.0, metodo: "ted", horario: "Ontem" },
];

export const integrations = [
  { id: 1,  nome: "Open Finance",             descricao: "Conecte suas contas bancárias e automatize a conciliação",          icone: "landmark",      status: "conectado",  bancos: ["Itaú", "Bradesco", "Nubank"] },
  { id: 2,  nome: "Pix Cobrança",             descricao: "Gere QR Codes dinâmicos e Pix Copia e Cola com vencimento",         icone: "qrCode",        status: "conectado",  bancos: [] },
  { id: 3,  nome: "Boleto Registrado",        descricao: "Emissão de boletos registrados com Bolepix",                        icone: "fileText",      status: "conectado",  bancos: [] },
  { id: 4,  nome: "WhatsApp Business",        descricao: "Envie cobranças e lembretes via WhatsApp",                          icone: "messageCircle", status: "conectado",  bancos: [] },
  { id: 5,  nome: "NF-e / NFS-e",            descricao: "Emissão automática de notas fiscais integrada ao governo",           icone: "receipt",       status: "pendente",   bancos: [] },
  { id: 6,  nome: "Omie ERP",                descricao: "Sincronize financeiro com o ERP Omie",                               icone: "database",      status: "disponivel", bancos: [] },
  { id: 7,  nome: "Conta Azul",              descricao: "Integração completa com Conta Azul",                                 icone: "barChart2",     status: "disponivel", bancos: [] },
  { id: 8,  nome: "Bling ERP",              descricao: "Gestão financeira integrada com Bling",                               icone: "packageOpen",   status: "disponivel", bancos: [] },
  { id: 9,  nome: "CNAB 240/400",           descricao: "Envio e recepção de arquivos de remessa e retorno",                   icone: "folderSync",    status: "conectado",  bancos: [] },
  { id: 10, nome: "DDA Automático",         descricao: "Busca automática de boletos via Débito Direto Autorizado",            icone: "searchCode",    status: "disponivel", bancos: [] },
  { id: 11, nome: "Totvs / SAP",           descricao: "Integração enterprise via API REST",                                   icone: "building2",     status: "disponivel", bancos: [] },
  { id: 12, nome: "E-commerce / Marketplace",descricao: "WooCommerce, Shopify, Mercado Pago, PagSeguro",                     icone: "shoppingCart",  status: "disponivel", bancos: [] },
];

export const dreData = [
  { categoria: "Receita Bruta de Serviços", valor: 284500, tipo: "receita" },
  { categoria: "(-) Deduções (ISS, PIS, COFINS)", valor: -17280, tipo: "deducao" },
  { categoria: "= Receita Líquida", valor: 267220, tipo: "resultado" },
  { categoria: "(-) Custos dos Serviços Prestados", valor: -89300, tipo: "custo" },
  { categoria: "= Lucro Bruto", valor: 177920, tipo: "resultado" },
  { categoria: "(-) Despesas Operacionais", valor: -54200, tipo: "despesa" },
  { categoria: "(-) Despesas Administrativas", valor: -18400, tipo: "despesa" },
  { categoria: "(-) Despesas Financeiras", valor: -3200, tipo: "despesa" },
  { categoria: "= EBITDA", valor: 102120, tipo: "resultado" },
  { categoria: "(-) Depreciação e Amortização", valor: -4800, tipo: "despesa" },
  { categoria: "= EBIT (Lucro Operacional)", valor: 97320, tipo: "resultado" },
  { categoria: "(-) IRPJ + CSLL", valor: -22380, tipo: "imposto" },
  { categoria: "= Lucro Líquido", valor: 74940, tipo: "resultado" },
];

export const agingData = [
  { faixa: "A vencer +60d", valor: 98400, qtd: 8 },
  { faixa: "A vencer 31-60d", valor: 42100, qtd: 5 },
  { faixa: "A vencer 1-30d", valor: 15700, qtd: 3 },
  { faixa: "Vencido 1-15d", valor: 8200, qtd: 2 },
  { faixa: "Vencido 16-30d", valor: 5400, qtd: 1 },
  { faixa: "Vencido +30d", valor: 3800, qtd: 1 },
];

export type InvoiceItem = {
  id: string;
  descricao: string;
  qtd: number;
  unitario: number;
  total: number;
};

export type Invoice = {
  id: string;
  numero: string;
  cliente: string;
  cnpj: string;
  email: string;
  descricao: string;
  valor: number;
  impostos: number;
  valorLiquido: number;
  emissao: string;
  vencimento: string;
  status: "emitida" | "enviada" | "paga" | "cancelada" | "rascunho";
  tipo: "nfe" | "nfse";
  chaveAcesso?: string;
  items: InvoiceItem[];
};

export const invoices: Invoice[] = [
  {
    id: "INV-2601",
    numero: "2601",
    cliente: "Beta Indústria S/A",
    cnpj: "23.456.789/0001-10",
    email: "financeiro@beta.com.br",
    descricao: "Serviços de Consultoria — Mar/26",
    valor: 18200.0,
    impostos: 1456.0,
    valorLiquido: 16744.0,
    emissao: "2026-03-30",
    vencimento: "2026-04-15",
    status: "paga",
    tipo: "nfse",
    chaveAcesso: "35260412345678000190550010000026011234567890",
    items: [
      { id: "i1", descricao: "Consultoria Financeira — 20h", qtd: 20, unitario: 910.0, total: 18200.0 },
    ],
  },
  {
    id: "INV-2602",
    numero: "2602",
    cliente: "Alfa Comércio Ltda",
    cnpj: "67.890.123/0001-54",
    email: "contas@alfacomercio.com.br",
    descricao: "Fornecimento de Equipamentos",
    valor: 41500.0,
    impostos: 3320.0,
    valorLiquido: 38180.0,
    emissao: "2026-04-15",
    vencimento: "2026-04-30",
    status: "enviada",
    tipo: "nfe",
    chaveAcesso: "35260467890123000154550010000026021234567891",
    items: [
      { id: "i1", descricao: "Servidor Dell PowerEdge R750", qtd: 2, unitario: 18000.0, total: 36000.0 },
      { id: "i2", descricao: "Switch Cisco 24 portas", qtd: 1, unitario: 5500.0, total: 5500.0 },
    ],
  },
  {
    id: "INV-2603",
    numero: "2603",
    cliente: "Construtora Horizonte",
    cnpj: "78.901.234/0001-65",
    email: "adm@horizonteconstrutora.com.br",
    descricao: "Projeto Arquitetônico — Fase 2",
    valor: 85000.0,
    impostos: 6800.0,
    valorLiquido: 78200.0,
    emissao: "2026-04-20",
    vencimento: "2026-05-05",
    status: "emitida",
    tipo: "nfse",
    chaveAcesso: "35260478901234000165550010000026031234567892",
    items: [
      { id: "i1", descricao: "Projeto Arquitetônico — Fase 2", qtd: 1, unitario: 55000.0, total: 55000.0 },
      { id: "i2", descricao: "Compatibilização BIM", qtd: 1, unitario: 30000.0, total: 30000.0 },
    ],
  },
  {
    id: "INV-2604",
    numero: "2604",
    cliente: "Tech Solutions ME",
    cnpj: "45.678.901/0001-32",
    email: "pagamentos@techsolutions.com.br",
    descricao: "Implementação ERP — Módulo Financeiro",
    valor: 32000.0,
    impostos: 2560.0,
    valorLiquido: 29440.0,
    emissao: "2026-04-10",
    vencimento: "2026-04-22",
    status: "cancelada",
    tipo: "nfse",
    items: [
      { id: "i1", descricao: "Implementação ERP — Módulo Financeiro", qtd: 1, unitario: 32000.0, total: 32000.0 },
    ],
  },
  {
    id: "INV-2605",
    numero: "2605",
    cliente: "Omega Engenharia Ltda",
    cnpj: "33.444.555/0001-12",
    email: "financeiro@omega.eng.br",
    descricao: "Laudo Técnico + Projetos",
    valor: 24600.0,
    impostos: 1968.0,
    valorLiquido: 22632.0,
    emissao: "2026-04-18",
    vencimento: "2026-04-28",
    status: "emitida",
    tipo: "nfse",
    items: [
      { id: "i1", descricao: "Laudo Técnico de Estrutura", qtd: 1, unitario: 14600.0, total: 14600.0 },
      { id: "i2", descricao: "Projeto Estrutural Complementar", qtd: 1, unitario: 10000.0, total: 10000.0 },
    ],
  },
  {
    id: "INV-2606",
    numero: "2606",
    cliente: "Farmácia Saúde Total",
    cnpj: "11.222.333/0001-98",
    email: "adm@saudetotal.com.br",
    descricao: "Consultoria Fiscal Q2/26",
    valor: 7800.0,
    impostos: 624.0,
    valorLiquido: 7176.0,
    emissao: "2026-04-22",
    vencimento: "2026-05-20",
    status: "rascunho",
    tipo: "nfse",
    items: [
      { id: "i1", descricao: "Consultoria Fiscal — Abr/26", qtd: 8, unitario: 975.0, total: 7800.0 },
    ],
  },
];