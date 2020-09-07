import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {

  public async execute(filename:string): Promise<Transaction[]> {
    const createService = new CreateTransactionService()
    const pathFile = path.resolve(__dirname, '..','..','tmp',filename);
    const readCSVStream = fs.createReadStream(pathFile);
    const transactions: Transaction[] = [];

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    /* parseCSV.on('data',async line => {
      const transaction = await createService.execute({title:line[0], type: line[1], value: line[2], category: line[3]});
      console.log(transaction.title)
      lines.push(transaction);
    }); */

    parseCSV.on('data', line => {

      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    for (const key in lines) {
      const line = lines[key]
      const transaction = await createService.execute({title:line[0], type: line[1], value: line[2], category: line[3]});

      transactions.push(transaction);
    }
    return transactions;
  }

}

export default ImportTransactionsService;
