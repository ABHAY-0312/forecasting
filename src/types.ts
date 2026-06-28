export interface IdeaLog {
  timestamp: string;
  agent: 'Market' | 'Competitor' | 'Risk' | 'SWOT' | 'System';
  message: string;
}

export interface CompetitorInsight {
  name: string;
  description: string;
  weakness: string;
  differentiation: string;
}

export interface RiskAnalysis {
  category: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface StartupIdea {
  id: string;
  title: string;
  description: string;
  targetMarket: string;
  extraContext?: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  logs: IdeaLog[];
  
  // Results populated when completed
  viabilityScore?: number;
  subScores?: {
    marketDemand: number;
    feasibility: number;
    riskMitigation: number;
    competitiveAdvantage: number;
  };
  marketAnalysis?: {
    trends: string[];
    audienceInsights: string;
    opportunities: string[];
  };
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors?: CompetitorInsight[];
  risks?: RiskAnalysis[];
  recommendations?: Recommendation[];
}
