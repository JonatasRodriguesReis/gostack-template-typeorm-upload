import { Router } from 'express';
import {getCustomRepository} from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import multer from 'multer';
import uploadConfig from '../config/upload';

// import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig)

transactionsRouter.get('/', async (request, response) => {
  try {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const allTransactions = await transactionsRepository.find()
    const balance = await transactionsRepository.getBalance();

    return response
      .status(200)
      .json({ transactions: allTransactions, balance });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  try{
    const {title, value, type, category} = request.body

    const createService = new CreateTransactionService();
    const transaction = await createService.execute({title, value, type, category});

    return response.status(200).json(transaction);
  }
  catch(error){
    return response.status(400).json({
        status: 'error',
        message: error.message,
      })
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  const {id} = request.params
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  await transactionsRepository.delete({id:id})

  return response.status(204).json({})
});

transactionsRouter.post('/import', upload.single('file') ,async (request, response) => {
  try{
    const importService = new ImportTransactionsService()
    const transactions = await importService.execute(request.file.filename)

    return response.status(200).json(transactions)

  }catch(error){
    return response.status(400).json({error:error.message})
  }


});

export default transactionsRouter;
