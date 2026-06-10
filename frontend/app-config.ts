export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;
  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;
  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;
  agentName?: string;
  sandboxId?: string;
}
export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'New India Fine Dine',
  pageTitle: 'New India Fine Dine - Voice Assistant',
  pageDescription: 'Book your table at New India Fine Dine using our AI voice host',
  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,
  logo: '/favicon.ico',
  accent: '#a27b5c',
  logoDark: '/favicon.ico',
  accentDark: '#e5ba73',
  startButtonText: 'Talk to Booking Host',
  agentName: process.env.AGENT_NAME ?? undefined,
  sandboxId: undefined,
};
