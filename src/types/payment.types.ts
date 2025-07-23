export interface Payment {
    paymentId: string;
    amount: number;
    currency: string;
  }

  export interface PaymentRepository {
    getById(paymentId: string): Promise<Payment | null>;
    create(payment: Payment): Promise<void>;
    listAll(): Promise<Payment[]>;
    listByCurrency(currency: string): Promise<Payment[]>;
  }
      