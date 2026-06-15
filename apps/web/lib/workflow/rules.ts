export type StageDef = {
  name: string
  order: number
  deadlineDays: number
  canAutoAdvance: boolean
}

export type ModalityDef = {
  stages: StageDef[]
}

const days = (n: number) => n

export const modalityRules: Record<string, ModalityDef> = {
  pregao: {
    stages: [
      { name: "Edital", order: 1, deadlineDays: days(8), canAutoAdvance: false },
      { name: "Sessão Pública", order: 2, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Lances", order: 3, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Recursos", order: 4, deadlineDays: days(3), canAutoAdvance: true },
      { name: "Homologação", order: 5, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Contrato", order: 6, deadlineDays: days(30), canAutoAdvance: false },
    ],
  },
  concorrencia: {
    stages: [
      { name: "Edital", order: 1, deadlineDays: days(45), canAutoAdvance: false },
      { name: "Propostas", order: 2, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Abertura", order: 3, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Análise", order: 4, deadlineDays: days(15), canAutoAdvance: true },
      { name: "Recursos", order: 5, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Homologação", order: 6, deadlineDays: days(10), canAutoAdvance: true },
      { name: "Contrato", order: 7, deadlineDays: days(30), canAutoAdvance: false },
    ],
  },
  tomada_precos: {
    stages: [
      { name: "Edital", order: 1, deadlineDays: days(30), canAutoAdvance: false },
      { name: "Propostas", order: 2, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Abertura", order: 3, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Análise", order: 4, deadlineDays: days(10), canAutoAdvance: true },
      { name: "Recursos", order: 5, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Homologação", order: 6, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Contrato", order: 7, deadlineDays: days(20), canAutoAdvance: false },
    ],
  },
  convite: {
    stages: [
      { name: "Edital", order: 1, deadlineDays: days(5), canAutoAdvance: false },
      { name: "Propostas", order: 2, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Abertura", order: 3, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Homologação", order: 4, deadlineDays: days(3), canAutoAdvance: true },
      { name: "Contrato", order: 5, deadlineDays: days(15), canAutoAdvance: false },
    ],
  },
  concurso: {
    stages: [
      { name: "Edital", order: 1, deadlineDays: days(45), canAutoAdvance: false },
      { name: "Propostas", order: 2, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Julgamento", order: 3, deadlineDays: days(30), canAutoAdvance: true },
      { name: "Homologação", order: 4, deadlineDays: days(10), canAutoAdvance: true },
      { name: "Contrato", order: 5, deadlineDays: days(20), canAutoAdvance: false },
    ],
  },
  leilao: {
    stages: [
      { name: "Edital", order: 1, deadlineDays: days(15), canAutoAdvance: false },
      { name: "Sessão", order: 2, deadlineDays: days(1), canAutoAdvance: true },
      { name: "Homologação", order: 3, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Contrato", order: 4, deadlineDays: days(15), canAutoAdvance: false },
    ],
  },
  dispensa: {
    stages: [
      { name: "Justificativa", order: 1, deadlineDays: days(3), canAutoAdvance: true },
      { name: "Cotação", order: 2, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Homologação", order: 3, deadlineDays: days(3), canAutoAdvance: true },
      { name: "Contrato", order: 4, deadlineDays: days(10), canAutoAdvance: false },
    ],
  },
  inexigibilidade: {
    stages: [
      { name: "Justificativa", order: 1, deadlineDays: days(3), canAutoAdvance: true },
      { name: "Homologação", order: 2, deadlineDays: days(5), canAutoAdvance: true },
      { name: "Contrato", order: 3, deadlineDays: days(15), canAutoAdvance: false },
    ],
  },
}

export function getStagesForModality(modality: string): StageDef[] {
  return modalityRules[modality]?.stages ?? modalityRules.pregao.stages
}

export function calculateDeadline(startDate: Date, deadlineDays: number): Date {
  const date = new Date(startDate)
  date.setDate(date.getDate() + deadlineDays)
  return date
}
