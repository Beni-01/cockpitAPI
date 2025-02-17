import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { AuditLogService } from './audit-log.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@EventSubscriber()
@Injectable() // Rendre AuditSubscriber injectable
export class AuditSubscriber implements EntitySubscriberInterface<any>{
  constructor(
    private readonly auditLogService: AuditLogService // Injection directe du service
  ) {}

  
//   // Méthode appelée avant l'insertion de l'entité dans la base de données
//   async beforeInsert(event: InsertEvent<any>) {
//     const logBoddy={
//         "tableName": event.metadata.tableName,
//         "entityId": event.entity.id,
//         "action": "CREATE",
//         "oldData": null,
//         "newData": event.entity,
//         "performedBy": event.queryRunner.data?.userId || null,
    
//       }
      
//     console.log('after insert');
//     await this.ReplicateUserData('http://localhost:6002/activity', logBoddy , 'POST')
//   }

// Méthode appelée après l'insertion de l'entité dans la base de données
  async afterInsert(event: InsertEvent<any>) {

    console.log('event ', event.queryRunner.data)
    const logBoddy={
        tableName: event.metadata.tableName,
        entityId: event.entity.id,
        action: "CREATE",
        oldData: null,
        newData: null,
        performedBy: event.queryRunner.data?.userId || null,
      }
      
    console.log('after insert', logBoddy);
}

  // Méthode appelée après la mise à jour de l'entité dans la base de données
  async afterUpdate(event: UpdateEvent<any>) {
    console.log('after update');
    if (!this.auditLogService) {
      console.error('AuditLogService est undefined');
      return;
    }

    await this.auditLogService.log(
      event.metadata.tableName,
      event.entity.id,
      'UPDATE',
      event.databaseEntity, // Anciennes données
      event.entity, // Nouvelles données
      event.queryRunner.data?.userId || null,
    );
  }

  // Méthode appelée après la suppression de l'entité dans la base de données
  async afterRemove(event: RemoveEvent<any>) {
    console.log('after remove');
    if (!this.auditLogService) {
      console.error('AuditLogService est undefined');
      return;
    }

    await this.auditLogService.log(
      event.metadata.tableName,
      event.entityId,
      'DELETE',
      event.databaseEntity, // Données supprimées
      null,
      event.queryRunner.data?.userId || null,
    );
  }


  async ReplicateUserData(uri:string,body:any, method:string){

    var myHeaders = new Headers();
    
    myHeaders.append('content-Type', "application/json")
   
      var requestOptions:any = {
        method: method,
        headers: myHeaders, 
        body:JSON.stringify(body)
      };
      
      try{
        
        console.log(' body resquest ', requestOptions)
        const request= await fetch(`${uri}`,requestOptions)
    
        const response = await request.json()

          console.log(' Je viens de repliquer les data', response)
        
        return response
   
      }
      catch(err){
    
        console.log('error send file', err)
      }
      
    }
}


