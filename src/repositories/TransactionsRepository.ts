import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance: Balance = transactions.reduce(
      (previous, transaction) => {
        const balanceObj = previous;

        if (transaction.type === 'income')
          balanceObj.income += transaction.value;
        else balanceObj.outcome += transaction.value;

        balanceObj.total = balanceObj.income - balanceObj.outcome;

        return balanceObj;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
