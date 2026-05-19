export interface IcmChecklistTaskResponse {
  questionId: number;
  code: string; // T1, T2... (will be generated or from question)
  category: string;
  label: string;
  periodicity: string;
  expectedProof: string;
  conformityLevel: string;
  realised: boolean;
  score: number;
  proof: string | null;
  comment: string | null;
}

export interface IcmChecklistDataResponse {
  checklistId: number;
  coordinationId: number;
  coordinationName: string;
  submittedAt: string | null;
  status: string;
  score: number;
  scoreStatus: string;
  summary: {
    totalTasks: number;
    conformes: number;
    partielles: number;
    nonConformes: number;
  };
  tasks: IcmChecklistTaskResponse[];
}

export interface IcmChecklistsPaginatedResponse {
  period: {
    month: number;
    year: number;
    label: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IcmChecklistDataResponse[];
}
