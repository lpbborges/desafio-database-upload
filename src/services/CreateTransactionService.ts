import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import CreateCategoryService from './CreateCategoryService';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createCategoryService = new CreateCategoryService();

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total - value < 0) {
        throw new AppError("You don't have enough balance.", 400);
      }
    }

    const transactionCategory = await createCategoryService.execute({
      title: category,
    });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
