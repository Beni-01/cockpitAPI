import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, DeleteTransactionObjectDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataformater } from 'src/utilities/data-formater.class';
import { Repository } from 'typeorm';


@Injectable()
export class TransactionsService {

  constructor(
    private httpDataFormater:Dataformater<any>,
    @InjectRepository(Transaction)  private readonly transactionRepository : Repository<Transaction>,
  

  ){
    
  }

  async create(createTransactionDto: CreateTransactionDto) {
    try{
      const transaction = this.transactionRepository.create(createTransactionDto)

      if(await this.isTransactionExist(createTransactionDto)==false){
         return await this.transactionRepository.save(transaction)
      }
      else{
        return {message:'Cette transaction existe déjà '}
      }
    
   }
   catch(error){
    console.error('ERREUR SERVICE =>', error);
     throw new BadRequestException()
   }
 
  }

  async findAll() {
    try{
      const transaction=await this.transactionRepository.find({
        relations:{
          //centre:true
        }
      })
      return  this.httpDataFormater.format(transaction, HttpStatus.OK) 
    }
    catch(error){
      throw new NotFoundException()
    }
  }

  async findOne(id: number) {
    try{
      const transaction=await this.transactionRepository.find({
        where:{
          id
        },
        relations:{
         // centre:true
        }
      })
      return  this.httpDataFormater.format(transaction, HttpStatus.OK) 
    }
    catch(error){
      throw new NotFoundException()
    }
  }


  async isTransactionExist(createTransactionDto: CreateTransactionDto): Promise<boolean> {
    try {
        const {
            description,
            centreId,
            depense,
            devise,
            ref,
            agent
        } = createTransactionDto;

        // Version sécurisée avec QueryBuilder (recommandée)
        const transaction = await this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.centreId = :centreId', { centreId })
            .andWhere('transaction.depense = :depense', { depense })
            .andWhere('transaction.devise = :devise', { devise })
            .andWhere('transaction.description = :description', { description })
            .andWhere('transaction.ref = :ref', { ref })
            .andWhere('transaction.agent = :agent', { agent })
            .getOne();

        return !!transaction; // Retourne true si trouvé, false sinon

    } catch (error) {
        console.error('Error checking transaction existence:', error);
        throw new InternalServerErrorException(
            "Une erreur est survenue lors de la vérification de l'existence de la transaction"
        );
    }
}

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async remove(ref: string) {
    try{
      const alltransactionByRef=await this.transactionRepository.find({
        where:{
          ref
        }
      });
  
      if(alltransactionByRef.length>0){
        alltransactionByRef.forEach((value:Transaction)=>{
          this.transactionRepository.softRemove(value)
        })
      }
    }
    catch(error){
      throw new NotFoundException({message:"La transaction n'est pas trouvée "})
    }

  }

    // Méthode pour supprimer une transaction
  async removeId(id: number): Promise<void> {
    const result = await this.transactionRepository.softDelete(id); // Supprime le TDR par son id
    if (result.affected === 0) {
      throw new NotFoundException(`TDR avec l'id ${id} introuvable`); // Lève une exception si aucun TDR n'est supprimé
    }
  }

  // Méthode pour supprimer des transactions à partir d'une liste d'IDs
 async removeByIds(ids: number[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestException(
      'La liste des identifiants ne doit pas être vide',
    );
  }

  const result = await this.transactionRepository.softDelete(ids);

  if (!result.affected || result.affected === 0) {
    throw new NotFoundException(
      `Aucune transaction trouvée pour les identifiants fournis`,
    );
  }
}

async removeMultiple(
  transactions: DeleteTransactionObjectDto[],
): Promise<void> {

  if (!transactions || transactions.length === 0) {
    throw new BadRequestException('Le tableau des transactions est vide');
  }

  let totalDeleted = 0;

  for (const tx of transactions) {

    const hasCriteria =
      tx.ref ||
      tx.description ||
      tx.devise ||
      tx.devise_convert ||
      tx.depense !== undefined;

    if (!hasCriteria) {
      throw new BadRequestException(
        'Chaque objet doit contenir au moins un critère',
      );
    }

    const query = this.transactionRepository
      .createQueryBuilder()
      .update()
      .set({
        centreId: null,
        deletedAt: () => 'CURRENT_TIMESTAMP',
      });

    // critères dynamiques
    if (tx.ref) {
      query.andWhere('ref = :ref', { ref: tx.ref });
    }

    if (tx.description) {
      query.andWhere('description = :description', {
        description: tx.description,
      });
    }

    if (tx.devise) {
      query.andWhere('devise = :devise', { devise: tx.devise });
    }

    if (tx.devise_convert) {
      query.andWhere('devise_convert = :devise_convert', {
        devise_convert: tx.devise_convert,
      });
    }

    if (tx.depense !== undefined) {
      query.andWhere('depense = :depense', {
        depense: tx.depense,
      });
    }

    // éviter de retraiter des lignes déjà supprimées
    query.andWhere('deletedAt IS NULL');

    const result = await query.execute();
    totalDeleted += result.affected ?? 0;
  }

  if (totalDeleted === 0) {
    throw new NotFoundException(
      'Aucune transaction correspondante trouvée dans le tableau fourni.',
    );
  }
}





// Total consommé
async getTotalDepense(year: number) {
  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.depense)', 'totalDepense')
      .where('YEAR(transaction.createdAt) = :year', { year }) // Filtre sur l'année
      .getRawOne();

  // Convertir le résultat en nombre décimal
  const totalDepense = parseFloat(result.totalDepense) || 0;

  return { total_consomme: totalDepense }; // Retourne un nombre décimal
}

// Total consommé par department
async getDepensePardepartmentAvecAnnee(year: number) {
  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre') // Joindre CentreCout
      .select('centre.department', 'department') // Sélectionner le nom de la department
      .addSelect('SUM(transaction.depense)', 'totalDepense') // Calculer la somme des dépenses
      .where('YEAR(transaction.createdAt) = :year', { year }) // Filtrer par année
      .groupBy('department.id') // Grouper par department
      .getRawMany();

  // Formater le résultat
  return result.map((row) => ({
      department: row.department,
      totalDepense: parseFloat(row.totalDepense).toFixed(2), // Convertir en nombre décimal avec 2 décimales
  }));
}

// total consommé par department année actuelle
async getDepensesPardepartmentByActualYear() {
  const today = new Date(); // Date du jour
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Début du mois
  const startOfYear = new Date(today.getFullYear(), 0, 1); // Début de l'année

  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre')
      .select('centre.department', 'department')
      .addSelect('SUM(CASE WHEN DATE(transaction.createdAt) = DATE(:today) THEN transaction.depense ELSE 0 END)', 'depense_jour')
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfMonth THEN transaction.depense ELSE 0 END)', 'depense_mois')
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfYear THEN transaction.depense ELSE 0 END)', 'depense_annuelle')
      .setParameters({ today, startOfMonth, startOfYear })
      .groupBy('department.id')
      .getRawMany();

  return result.map((row) => ({
      department: row.department,
      depense_jour: parseFloat(row.depense_jour).toFixed(2),
      depense_mois: parseFloat(row.depense_mois).toFixed(2),
      depense_annuelle: parseFloat(row.depense_annuelle).toFixed(2),
  }));
}


// total consommé par department precision année principale
async getDepensesPardepartmentByYearPrecision(year: number) {
  try {
    if (!year || isNaN(year)) {
      throw new Error('Année invalide fournie');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(year, new Date().getMonth(), 1);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const result = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoin('t.centre', 'c')
      .select('c.department', 'department')

      // Dépense du jour
      .addSelect(
        `
        COALESCE(SUM(
          CASE 
            WHEN t.createdAt >= :startOfDay 
            THEN t.depense 
            ELSE 0 
          END
        ), 0)
        `,
        'depense_jour',
      )

      // Dépense du mois
      .addSelect(
        `
        COALESCE(SUM(
          CASE 
            WHEN t.createdAt >= :startOfMonth 
             AND t.createdAt < :endOfYear
            THEN t.depense 
            ELSE 0 
          END
        ), 0)
        `,
        'depense_mois',
      )

      // Dépense annuelle
      .addSelect(
        `
        COALESCE(SUM(
          CASE 
            WHEN t.createdAt >= :startOfYear 
             AND t.createdAt < :endOfYear
            THEN t.depense 
            ELSE 0 
          END
        ), 0)
        `,
        'depense_annuelle',
      )

      // Budget total par department (depuis les centres)
      .addSelect(
        `
        COALESCE(SUM(c.montant), 0)
        `,
        'total_budget_alloue',
      )

      .setParameters({
        startOfDay,
        startOfMonth,
        startOfYear,
        endOfYear,
      })

      .groupBy('c.department')
      .getRawMany();

    return result.map(row => ({
      department: row.department,
      depense_jour: Number(row.depense_jour).toFixed(2),
      depense_mois: Number(row.depense_mois).toFixed(2),
      depense_annuelle: Number(row.depense_annuelle).toFixed(2),
      total_budget_alloue: Number(row.total_budget_alloue).toFixed(2),
    }));

  } catch (error) {
    console.error(
      'Erreur lors de la récupération des dépenses par department:',
      error,
    );
    throw new Error(
      'Une erreur est survenue lors de la récupération des dépenses.',
    );
  }
}




}
