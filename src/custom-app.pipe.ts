import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // Désactive la validation stricte pour permettre `performedId`
    });
  }

  override async transform(value: any, metadata: ArgumentMetadata) {
    let performedId: number | undefined;
  
    if (typeof value === 'object' && value !== null) {
      performedId = value.performedId; // Sauvegarde `performedId`
      delete value.performedId; // Supprime `performedId` pour éviter la validation
    }
  
    const transformedValue = await super.transform(value, metadata); // Valide et transforme
  
    if (performedId !== undefined) {
      transformedValue.performedId = performedId; // Réinjecte `performedId`
    }
  
    return transformedValue;
  }
}