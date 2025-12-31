import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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

        // Alternative avec .query() sécurisée si vraiment nécessaire
        /*
        const query = `
            SELECT * FROM transaction 
            WHERE centreId = ? 
            AND depense = ? 
            AND devise = ? 
            AND description = ? 
            AND ref = ? 
            AND agentId = ?
            LIMIT 1;
        `;
        
        const results = await this.transactionRepository.query(query, [
            centreId, 
            depense, 
            devise, 
            description, 
            ref, 
            agentId
        ]);
        
        return results.length > 0;
        */
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

// Total consommé par direction
async getDepenseParDirectionAvecAnnee(year: number) {
  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre') // Joindre CentreCout
      .leftJoinAndSelect('centre.direction', 'direction') // Joindre Direction
      .select('direction.direction', 'direction') // Sélectionner le nom de la direction
      .addSelect('direction.id', 'direction_id') // Sélectionner le ID de la direction
      .addSelect('SUM(transaction.depense)', 'totalDepense') // Calculer la somme des dépenses
      .where('YEAR(transaction.createdAt) = :year', { year }) // Filtrer par année
      .groupBy('direction.id') // Grouper par direction
      .getRawMany();

  // Formater le résultat
  return result.map((row) => ({
      direction: row.direction,
      direction_id:row.direction_id,
      totalDepense: parseFloat(row.totalDepense).toFixed(2), // Convertir en nombre décimal avec 2 décimales
  }));
}

// total consommé par direction année actuelle
async getDepensesParDirectionByActualYear() {
  const today = new Date(); // Date du jour
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Début du mois
  const startOfYear = new Date(today.getFullYear(), 0, 1); // Début de l'année

  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre')
      .leftJoinAndSelect('centre.direction', 'direction')
      .select('direction.direction', 'direction')
      .addSelect('direction.id', 'direction_id') // Sélectionner le ID de la direction
      .addSelect('SUM(CASE WHEN DATE(transaction.createdAt) = DATE(:today) THEN transaction.depense ELSE 0 END)', 'depense_jour')
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfMonth THEN transaction.depense ELSE 0 END)', 'depense_mois')
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfYear THEN transaction.depense ELSE 0 END)', 'depense_annuelle')
      .setParameters({ today, startOfMonth, startOfYear })
      .groupBy('direction.id')
      .getRawMany();

  return result.map((row) => ({
      direction: row.direction,
      direction_id:row.direction_id,
      depense_jour: parseFloat(row.depense_jour).toFixed(2),
      depense_mois: parseFloat(row.depense_mois).toFixed(2),
      depense_annuelle: parseFloat(row.depense_annuelle).toFixed(2),
  }));
}

// total consommé par direction precision année  M2
async getDepensesParDirectionByYearPrecision2(year: number) {
  const today = new Date(); // Date du jour
  const startOfMonth = new Date(year, today.getMonth(), 1); // Début du mois pour l'année spécifiée
  const startOfYear = new Date(year, 0, 1); // Début de l'année spécifiée

  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre')
      .leftJoinAndSelect('centre.direction', 'direction')
      .select('direction.direction', 'direction') // Sélectionner le nom de la direction
      .addSelect('direction.id', 'direction_id') // Sélectionner le ID de la direction
      .addSelect('SUM(CASE WHEN DATE(transaction.createdAt) = DATE(:today) THEN transaction.depense ELSE 0 END)', 'depense_jour') // Dépense du jour
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfMonth AND YEAR(transaction.createdAt) = :year THEN transaction.depense ELSE 0 END)', 'depense_mois') // Dépense du mois
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfYear AND YEAR(transaction.createdAt) = :year THEN transaction.depense ELSE 0 END)', 'depense_annuelle') // Dépense de l'année
      .setParameters({ today, startOfMonth, startOfYear, year }) // Paramètres de date
      .groupBy('direction.id') // Grouper par direction
      .getRawMany();

  // Formater le résultat
  return result.map((row) => ({
      direction: row.direction,
      direction_id:row.direction_id,
      depense_jour: parseFloat(row.depense_jour).toFixed(2), // Dépense du jour
      depense_mois: parseFloat(row.depense_mois).toFixed(2), // Dépense du mois
      depense_annuelle: parseFloat(row.depense_annuelle).toFixed(2), // Dépense de l'année
  }));
}

// total consommé par direction precision année  M#3
async getDepensesParDirectionByYearPrecision3(year: number) {
  const today = new Date(); // Date du jour
  const startOfMonth = new Date(year, today.getMonth(), 1); // Début du mois pour l'année spécifiée
  const startOfYear = new Date(year, 0, 1); // Début de l'année spécifiée

  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre')
      .leftJoinAndSelect('centre.direction', 'direction')
      .select('direction.direction', 'direction') // Sélectionner le nom de la direction
      .addSelect('direction.id', 'direction_id') // Sélectionner le ID de la direction
      .addSelect('SUM(CASE WHEN DATE(transaction.createdAt) = DATE(:today) THEN transaction.depense ELSE 0 END)', 'depense_jour') // Dépense du jour
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfMonth AND YEAR(transaction.createdAt) = :year THEN transaction.depense ELSE 0 END)', 'depense_mois') // Dépense du mois
      .addSelect('SUM(CASE WHEN transaction.createdAt >= :startOfYear AND YEAR(transaction.createdAt) = :year THEN transaction.depense ELSE 0 END)', 'depense_annuelle') // Dépense de l'année
      .addSelect(`(
          SELECT COALESCE(SUM(cc.montant), 0)
          FROM direction d
          LEFT JOIN centre_cout cc ON cc.directionId = d.id
          WHERE d.id = direction.id
      )`, 'total_budget_alloue') // Sous-requête pour le total_budget_alloue
      .setParameters({ today, startOfMonth, startOfYear, year }) // Paramètres de date
      .groupBy('direction.id') // Grouper par direction
      .getRawMany();

  // Formater le résultat
  return result.map((row) => ({
      direction: row.direction,
      direction_id: row.direction_id,
      depense_jour: parseFloat(row.depense_jour || 0).toFixed(2), // Dépense du jour (avec une valeur par défaut de 0)
      depense_mois: parseFloat(row.depense_mois || 0).toFixed(2), // Dépense du mois (avec une valeur par défaut de 0)
      depense_annuelle: parseFloat(row.depense_annuelle || 0).toFixed(2), // Dépense de l'année (avec une valeur par défaut de 0)
      total_budget_alloue: parseFloat(row.total_budget_alloue || 0).toFixed(2), // Total budget alloué (avec une valeur par défaut de 0)
  }));
}

// total consommé par direction precision année principale
async getDepensesParDirectionByYearPrecision(year: number) {
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
      .select('c.direction', 'direction')

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

      // Budget total par direction (depuis les centres)
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

      .groupBy('c.direction')
      .getRawMany();

    return result.map(row => ({
      direction: row.direction,
      depense_jour: Number(row.depense_jour).toFixed(2),
      depense_mois: Number(row.depense_mois).toFixed(2),
      depense_annuelle: Number(row.depense_annuelle).toFixed(2),
      total_budget_alloue: Number(row.total_budget_alloue).toFixed(2),
    }));

  } catch (error) {
    console.error(
      'Erreur lors de la récupération des dépenses par direction:',
      error,
    );
    throw new Error(
      'Une erreur est survenue lors de la récupération des dépenses.',
    );
  }
}



// total consommé par direction precision année trimestre
async getDepensesParDirectionEtTrimestre(year: number) {
  // Définir les dates de début et de fin pour chaque trimestre
  const trimestres = [
    { start: new Date(year, 0, 1), end: new Date(year, 2, 31) }, // Trimestre 1 (janvier - mars)
    { start: new Date(year, 3, 1), end: new Date(year, 5, 30) }, // Trimestre 2 (avril - juin)
    { start: new Date(year, 6, 1), end: new Date(year, 8, 30) }, // Trimestre 3 (juillet - septembre)
    { start: new Date(year, 9, 1), end: new Date(year, 11, 31) }, // Trimestre 4 (octobre - décembre)
  ];

  const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.centre', 'centre')
      .leftJoinAndSelect('centre.direction', 'direction')
      .select('direction.direction', 'direction') // Sélectionner le nom de la direction
      .addSelect('direction.direction', 'direction') // Sélectionner le nom de la direction
      .addSelect(
          'SUM(CASE WHEN transaction.createdAt >= :trimestre1_start AND transaction.createdAt <= :trimestre1_end THEN transaction.depense ELSE 0 END)',
          'trimestre_1',
      ) // Dépense du trimestre 1
      .addSelect(
          'SUM(CASE WHEN transaction.createdAt >= :trimestre2_start AND transaction.createdAt <= :trimestre2_end THEN transaction.depense ELSE 0 END)',
          'trimestre_2',
      ) // Dépense du trimestre 2
      .addSelect(
          'SUM(CASE WHEN transaction.createdAt >= :trimestre3_start AND transaction.createdAt <= :trimestre3_end THEN transaction.depense ELSE 0 END)',
          'trimestre_3',
      ) // Dépense du trimestre 3
      .addSelect(
          'SUM(CASE WHEN transaction.createdAt >= :trimestre4_start AND transaction.createdAt <= :trimestre4_end THEN transaction.depense ELSE 0 END)',
          'trimestre_4',
      ) // Dépense du trimestre 4
      .setParameters({
          trimestre1_start: trimestres[0].start,
          trimestre1_end: trimestres[0].end,
          trimestre2_start: trimestres[1].start,
          trimestre2_end: trimestres[1].end,
          trimestre3_start: trimestres[2].start,
          trimestre3_end: trimestres[2].end,
          trimestre4_start: trimestres[3].start,
          trimestre4_end: trimestres[3].end,
      })
      .groupBy('direction.id') // Grouper par direction
      .getRawMany();

  // Formater le résultat
  return result.map((row) => ({
      direction: row.direction,
      trimestre_1: parseFloat(row.trimestre_1).toFixed(2), // Dépense du trimestre 1
      trimestre_2: parseFloat(row.trimestre_2).toFixed(2), // Dépense du trimestre 2
      trimestre_3: parseFloat(row.trimestre_3).toFixed(2), // Dépense du trimestre 3
      trimestre_4: parseFloat(row.trimestre_4).toFixed(2), // Dépense du trimestre 4
  }));
}

}
