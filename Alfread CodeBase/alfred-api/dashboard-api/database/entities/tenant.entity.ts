import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const UNIQUE_TENANT_NAME_CONSTRAINT = 'unique_tenants_name_constraint';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'jsonb' })
  keys: { [key: string]: any }[];

  @Column({
    name: 'dashboard_pool_id',
  })
  dashboardPoolId: string;

  @Column({
    name: 'user_pool_id',
  })
  userPoolId: string;

  @Column({
    name: 'dashboard_pool_client_id',
  })
  dashboardPoolClientId: string;

  @Column({
    name: 'user_pool_client_id',
  })
  userPoolClientId: string;
}
