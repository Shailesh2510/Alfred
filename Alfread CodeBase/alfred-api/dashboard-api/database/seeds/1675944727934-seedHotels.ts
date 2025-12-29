import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedHotels1675944727934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('hotels')
      .values([
        {
          version: 1,
          name: 'Hotel 1',
          formalName: 'The Grand Hotel',
          addressNumber: '123',
          addressStreet: 'Main St',
          addressTown: 'Anytown',
          addressZipCode: '12345',
          contactName: 'John Smith',
          contactEmail: 'john.smith@example.com',
          contactPhone: '123-456-7890',
          code: 'HOTEL1',
          webCode: 'GRAND',
          allowCreditCard: true,
          allowRoomCharge: true,
          isTaxExempt: false,
          rooms: 50,
          coordinates: '12.3456,78.9012',
          isActive: true,
          deliveryInstructions: 'Leave at front desk',
          isWebEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          version: 1,
          name: 'Hotel 2',
          formalName: 'The Plaza Hotel',
          addressNumber: '456',
          addressStreet: 'Second St',
          addressTown: 'Anytown',
          addressZipCode: '23456',
          contactName: 'Jane Doe',
          contactEmail: 'jane.doe@example.com',
          contactPhone: '456-789-0123',
          code: 'HOTEL2',
          webCode: 'PLAZA',
          allowCreditCard: true,
          allowRoomCharge: true,
          isTaxExempt: false,
          rooms: 75,
          coordinates: '23.4567,89.0123',
          isActive: true,
          deliveryInstructions: 'Call when delivering',
          isWebEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          version: 1,
          name: 'Hotel 3',
          formalName: 'The Regency Hotel',
          addressNumber: '789',
          addressStreet: 'Third St',
          addressTown: 'Anytown',
          addressZipCode: '34567',
          contactName: 'Bob Johnson',
          contactEmail: 'bob.johnson@example.com',
          contactPhone: '789-012-3456',
          code: 'HOTEL3',
          webCode: 'REGENCY',
          allowCreditCard: true,
          allowRoomCharge: true,
          isTaxExempt: false,
          rooms: 100,
          coordinates: '34.5678,90.1234',
          isActive: true,
          deliveryInstructions: 'Ask for front desk',
          isWebEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }
      ]
    ).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM hotels where name in (\'Hotel 1\', \'Hotel 2\', \'Hotel 3\')');
  }
}
