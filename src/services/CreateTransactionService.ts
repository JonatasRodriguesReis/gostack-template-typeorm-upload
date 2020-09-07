import AppError from '../errors/AppError';
import {getRepository, getCustomRepository} from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request{
  title:string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if (type !== 'income' && type !== 'outcome')
      throw new AppError('Type of transaction is not income neither outcome.');

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.income)
    throw new AppError(
      'Outcome transaction could not be created. Value is greater than total balance',
      );

    var findCategory = await categoryRepository.findOne({where:{title:category}});
    if(!findCategory){

      findCategory = categoryRepository.create({title: category})
      await categoryRepository.save(findCategory);
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: findCategory.id
    });

    await transactionsRepository.save(transaction);
    transaction.category = findCategory;

    return transaction;
  }
}

export default CreateTransactionService;
