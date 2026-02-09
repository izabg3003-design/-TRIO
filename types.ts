
export enum Specialty {
  Pedreiro = 'Pedreiro',
  Canalizador = 'Canalizador',
  Eletricista = 'Eletricista',
  Pladur = 'Profissional de Pladur',
  Capoto = 'Capoto',
  Pintura = 'Pintura',
  Carpinteiro = 'Carpinteiro',
  Estuque = 'Estuque',
  Outro = 'Outro'
}

export type PlanType = 'Free' | 'Premium';
export type UserStatus = 'Active' | 'Suspended' | 'Blocked';
export type UserRole = 'User' | 'Master';
export type NotificationTarget = 'All' | 'Premium' | 'Free';

export type CountryCode = 'PT' | 'BR' | 'ES' | 'DE' | 'CH' | 'US' | 'IT';

export interface User {
  id: string;
  email: string;
  password?: string;
  companyId: string;
  isVerified: boolean;
  role: UserRole;
  status: UserStatus;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  nif: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  specialties: Specialty[];
  plan: PlanType;
  country: CountryCode;
  subscriptionExpiryDate?: string; // ISO Date String
}

export interface Client {
  name: string;
  contactName: string;
  address: string;
  email: string;
  phone: string;
  nif: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  category: Specialty;
}

export interface ExpenseItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  proofBase64?: string;
  proofFileName?: string;
  notes?: string;
}

export interface Budget {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  companyId: string;
  client: Client;
  items: BudgetItem[];
  expenses?: ExpenseItem[];
  notes: string;
  status: 'Draft' | 'Approved' | 'Rejected';
  taxRate: number;
  isVatEnabled?: boolean;
  incomeTaxRate?: number;
  socialTaxRate?: number;
  payments?: PaymentRecord[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  expiresAt: string;
  target: NotificationTarget;
  type: 'Info' | 'Warning' | 'Premium' | 'System';
  isAuto?: boolean;
  isBanner?: boolean;
  bannerImage?: string;
}
