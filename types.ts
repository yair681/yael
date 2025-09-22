
export enum TransactionType {
  MyMoney = 'myMoney',
  DadsDebt = 'dadsDebt',
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
}
