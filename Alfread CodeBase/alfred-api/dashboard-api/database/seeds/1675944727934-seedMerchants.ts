import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedMerchants1675944727934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const cityIds = await queryRunner.manager.query(
      `select id from cities`
    );
    const getCityId = () => {
      return cityIds[Math.floor(Math.random() * cityIds.length)].id
    }
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('merchants')
      .values([
        {
          version: 1,
          name: 'Merchant 1',
          coordinates: '12.3456,78.9012',
          cityId: getCityId(),
          taxRate: 0.10,
          contactEmail: 'merchant1@example.com',
          contactPhone: '123-456-7890',
          addressNumber: '123',
          addressStreet: 'Main St',
          addressTown: 'Anytown',
          addressZipCode: '12345',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          version: 1,
          name: 'Merchant 2',
          coordinates: '23.4567,89.0123',
          cityId: getCityId(),
          taxRate: 0.12,
          contactEmail: 'merchant2@example.com',
          contactPhone: '456-789-0123',
          addressNumber: '456',
          addressStreet: 'Second St',
          addressTown: 'Anytown',
          addressZipCode: '23456',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          version: 1,
          name: 'Merchant 3',
          coordinates: '67.8901,23.4567',
          cityId: getCityId(),
          taxRate: 0.22,
          contactEmail: 'merchant6@example.com',
          contactPhone: '678-901-2345',
          addressNumber: '678',
          addressStreet: 'Sixth St',
          addressTown: 'Anytown',
          addressZipCode: '67890',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          version: 1,
          name: 'Merchant 4',
          coordinates: '78.9012,34.5678',
          cityId: getCityId(),
          taxRate: 0.25,
          contactEmail: 'merchant7@example.com',
          contactPhone: '901-234-5678',
          addressNumber: '901',
          addressStreet: 'Seventh St',
          addressTown: 'Anytown',
          addressZipCode: '78901',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }
    ]).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query('DELETE FROM merchants where name in (\'Merchant 1\', \'Merchant 2\', \'Merchant 3\', \'Merchant 4\', \'Merchant 5\', \'Merchant 6\', \'Merchant 7\')');
  }
}
