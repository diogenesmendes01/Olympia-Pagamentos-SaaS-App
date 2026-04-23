/**
 * OLYMPIA PAGAMENTOS — Design Tokens (ERP)
 * Regra: azul para ação/estrutura · dourado para valor/destaque · cinzas/branco para base · semânticas só para feedback
 */

// ── Brand ──────────────────────────────────────────────────
export const PRIMARY       = "#1F3A5F";
export const PRIMARY_HOVER = "#274872";
export const PRIMARY_PRESS = "#162C47";
export const PRIMARY_SOFT  = "#EEF3F8";
export const GOLD          = "#C8A96B";
export const GOLD_SOFT     = "#F8F1E3";
export const GOLD_TEXT     = "#9A743C";
export const IVORY         = "#F4EFE6";

// ── Neutrals ───────────────────────────────────────────────
export const BG            = "#F8FAFC";
export const SURFACE       = "#FFFFFF";
export const BORDER        = "#E2E8F0";
export const DIVIDER       = "#CBD5E1";
export const TEXT_1        = "#1E293B";
export const TEXT_2        = "#334155";
export const TEXT_3        = "#64748B";
export const TEXT_4        = "#94A3B8";

// ── Semantic — sofisticados, nunca gritantes ────────────────
/** Sucesso / verde oliva */
export const SUCCESS       = "#5E7A5F";
export const SUCCESS_BG    = "#EDF4EE";
export const SUCCESS_BORDER= "#C9DEC9";

/** Atenção / âmbar envelhecido */
export const WARNING       = "#B8872F";
export const WARNING_BG    = "#FBF5E8";
export const WARNING_BORDER= "#E8D5B0";

/** Erro / terracota */
export const DANGER        = "#C65A46";
export const DANGER_BG     = "#FBEDEA";
export const DANGER_BORDER = "#F0C4BC";

/** Informativo (usa o próprio azul da marca) */
export const INFO          = PRIMARY;
export const INFO_BG       = PRIMARY_SOFT;
export const INFO_BORDER   = "#C3D0E4";

// ── Chart palette (prioridade da marca) ────────────────────
export const CHART_PRIMARY  = PRIMARY;       // série principal
export const CHART_COMPARE  = "#3D6B9C";     // comparação
export const CHART_GOLD     = GOLD;          // valor estratégico
export const CHART_SUCCESS  = SUCCESS;       // resultado positivo
export const CHART_DANGER   = DANGER;        // problema
export const CHART_WARNING  = WARNING;       // atenção

// ── Badge presets ───────────────────────────────────────────
export const BADGE_DEFAULT  = { bg: PRIMARY_SOFT, text: PRIMARY };
export const BADGE_PREMIUM  = { bg: GOLD_SOFT,    text: GOLD_TEXT };
export const BADGE_SUCCESS  = { bg: SUCCESS_BG,   text: SUCCESS };
export const BADGE_WARNING  = { bg: WARNING_BG,   text: WARNING };
export const BADGE_DANGER   = { bg: DANGER_BG,    text: DANGER };
