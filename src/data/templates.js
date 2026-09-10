export const BRAND_PRESETS = {
  acme: {
    name: 'Acme Modern Blue',
    primary: '#2563EB',
    secondary: '#10B981',
    bgLight: '#F8FAFC',
    bgDark: '#0F172A',
    cardLight: '#FFFFFF',
    cardDark: '#1E293B',
    textLight: '#0F172A',
    textDark: '#F8FAFC',
    font: 'Inter, sans-serif',
    radius: 12,
  },
  spectrum: {
    name: 'Adobe Spectrum Dark',
    primary: '#FA0F00',
    secondary: '#2680EB',
    bgLight: '#FFFFFF',
    bgDark: '#111113',
    cardLight: '#F5F5F7',
    cardDark: '#1C1C1F',
    textLight: '#111113',
    textDark: '#E8E8ED',
    font: 'system-ui, sans-serif',
    radius: 8,
  },
  cyberpunk: {
    name: 'Neo Cyberpunk',
    primary: '#06B6D4',
    secondary: '#EC4899',
    bgLight: '#FAF5FF',
    bgDark: '#0B0A1A',
    cardLight: '#FFFFFF',
    cardDark: '#171433',
    textLight: '#0B0A1A',
    textDark: '#F0F9FF',
    font: 'JetBrains Mono, monospace',
    radius: 16,
  },
  emerald: {
    name: 'Nordic Forest',
    primary: '#059669',
    secondary: '#D97706',
    bgLight: '#F0FDF4',
    bgDark: '#064E3B',
    cardLight: '#FFFFFF',
    cardDark: '#042F2E',
    textLight: '#064E3B',
    textDark: '#ECFDF5',
    font: 'Inter, sans-serif',
    radius: 10,
  }
};

export const INITIAL_UI_BLOCKS = [
  {
    id: 'hero-balance',
    type: 'card',
    label: 'Total Balance Card',
    content: ',500.00',
    subContent: 'Total Net Liquidity',
    badge: '+14.2% this month',
    styles: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: '#1E3A8A',
      textColor: '#FFFFFF',
      fontSize: 28,
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
    }
  },
  {
    id: 'action-transfer',
    type: 'button',
    label: 'Primary CTA Button',
    content: 'Send Money',
    styles: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#2563EB',
      textColor: '#FFFFFF',
      fontSize: 14,
      width: 'auto',
      borderWidth: 0,
      borderColor: 'transparent'
    }
  },
  {
    id: 'metric-inflow',
    type: 'metric',
    label: 'Monthly Income',
    content: '+,240.00',
    subContent: 'Upwork & Stripe payouts',
    badge: 'Verified',
    styles: {
      padding: 18,
      borderRadius: 12,
      backgroundColor: '#1E293B',
      textColor: '#34D399',
      fontSize: 20,
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)'
    }
  },
  {
    id: 'metric-outflow',
    type: 'metric',
    label: 'Monthly Spend',
    content: '-,190.50',
    subContent: 'SaaS tools & equipment',
    badge: 'Under Budget',
    styles: {
      padding: 18,
      borderRadius: 12,
      backgroundColor: '#1E293B',
      textColor: '#F87171',
      fontSize: 20,
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)'
    }
  }
];

export const INITIAL_GRAPHIC_BLOCKS = [
  {
    id: 'gd-headline',
    type: 'text',
    label: 'Campaign Title',
    content: 'THE FUTURE OF DIGITAL BANKING.',
    subContent: 'Zero branch visits. Autonomous wealth orchestration.',
    styles: {
      padding: 20,
      borderRadius: 8,
      backgroundColor: 'transparent',
      textColor: '#FFFFFF',
      fontSize: 36,
      width: '100%',
      borderWidth: 0,
      borderColor: 'transparent'
    }
  },
  {
    id: 'gd-badge',
    type: 'badge',
    label: 'Launch Tag',
    content: 'NOW IN BETA 2.0',
    styles: {
      padding: 8,
      borderRadius: 9999,
      backgroundColor: '#EC4899',
      textColor: '#FFFFFF',
      fontSize: 11,
      width: 'auto',
      borderWidth: 0,
      borderColor: 'transparent'
    }
  },
  {
    id: 'gd-cta',
    type: 'button',
    label: 'Hero Action',
    content: 'Claim Early Access',
    styles: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#06B6D4',
      textColor: '#0B0A1A',
      fontSize: 15,
      width: 'auto',
      borderWidth: 0,
      borderColor: 'transparent'
    }
  }
];
