export interface Acronym {
  acronym: string;
  definition: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export const acronyms: Acronym[] = [
  { acronym: 'SLAPP', definition: 'Strategic Lawsuit Against Public Participation' },
  { acronym: 'OSINT', definition: 'Open-Source Intelligence' },
  { acronym: 'MIL', definition: 'Media and Information Literacy' },
  { acronym: 'LLM', definition: 'Large Language Model' },
  { acronym: 'VPN', definition: 'Virtual Private Network' },
  { acronym: 'E2EE', definition: 'End-to-End Encryption' },
  { acronym: 'GDPR', definition: 'General Data Protection Regulation' },
  { acronym: 'AAEA', definition: 'Association of African Electoral Authorities' },
  { acronym: 'CPJ', definition: 'Committee to Protect Journalists' },
  { acronym: 'FOI', definition: 'Freedom of Information' },
  { acronym: 'GHG', definition: 'Greenhouse Gas' },
  { acronym: 'COP', definition: 'Conference of the Parties' },
  { acronym: 'NDC', definition: 'Nationally Determined Contribution' },
  { acronym: 'EIA', definition: 'Environmental Impact Assessment' },
  { acronym: 'ESG', definition: 'Environmental, Social, and Governance' },
  { acronym: 'NAREP', definition: 'Natural Resources and Extractives Project' },
  { acronym: 'LDJ', definition: 'Law, Democracy and Journalism' },
  { acronym: 'MEL', definition: 'Monitoring, Evaluation, and Learning' },
  { acronym: 'DAIDAC', definition: 'Digital Technology, Artificial Intelligence, and Disinformation Analysis Centre' },
  { acronym: 'CIPE', definition: 'Centre for International Private Enterprise' }
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}