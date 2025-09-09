export type Sender = 'user' | 'bot';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
}

export enum AgentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Complete = 'complete',
  Error = 'error',
  Skipped = 'skipped',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AgentState {
  id: number;
  name: string;
  description: string;
  status: AgentStatus;
  output: string;
  sources?: GroundingSource[];
}
