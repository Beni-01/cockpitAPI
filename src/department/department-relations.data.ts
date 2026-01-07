export const DEPARTMENT_RELATIONS = [
  {
    ids: [2, 3],
    direction: 'ETUDES',
    divisions: 'ETUDES ECOSYSTEME',
    codes: ['ET', 'EO']
  },
  {
    ids: [4],
    direction: 'ACCES A LA JUSTICE',
    divisions: null,
    codes: ['AJ']
  },
  {
    ids: [5],
    direction: 'REPARATION',
    divisions: null,
    codes: ['RE']
  },
  {
    ids: [6, 16],
    direction: 'COMMUNICATION',
    divisions: 'GENOCOST',
    codes: ['CO', 'GO']
  },
  {
    ids: [7, 17],
    direction: 'DIRECTION GÉNÉRALE',
    divisions: 'PLAIDOYER INTERNATIONAL',
    codes: ['DG', 'PI']
  },
  {
    ids: [8],
    direction: "CONSEIL D'ADMINISTRATION",
    divisions: null,
    codes: ['CA']
  },
  {
    ids: [9],
    direction: 'DIRECTION FINANCIÈRE',
    divisions: null,
    codes: ['FI']
  },
  {
    ids: [10],
    direction: 'AUDIT INTERNE',
    divisions: null,
    codes: ['AU']
  },
  {
    ids: [11, 12, 15],
    direction: 'RESSOURCES HUMAINES',
    divisions: 'JURIDIQUE, SECURITÉ',
    codes: ['RH', 'RJ', 'SC']
  },
  {
    ids: [13],
    direction: 'SERVICES GENERAUX & ADM',
    divisions: null,
    codes: ['AM']
  },
  {
    ids: [14],
    direction: 'PASSATION DE MARCHE',
    divisions: null,
    codes: ['PM']
  },
  {
    ids: [18],
    direction: 'MEDIATION',
    divisions: null,
    codes: ['ME']
  }
];

// Helper function to get all related department IDs for a given code
export function getRelatedDepartmentIds(code: string): number[] {
  const relation = DEPARTMENT_RELATIONS.find(r => r.codes.includes(code));
  return relation ? relation.ids : [];
}

// Helper function to get all codes for a given department ID
export function getRelatedCodes(code: string): string[] | 'ALL' {
  // DG and PM should return all departments
  if (code === 'DG' || code === 'PM') {
    return 'ALL';
  }
  
  const relation = DEPARTMENT_RELATIONS.find(r => r.codes.includes(code));
  return relation ? relation.codes : [];
}
