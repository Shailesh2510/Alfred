import { Test, TestingModule } from '@nestjs/testing';
import {
  PG_DATA_SOURCE,
  ROLE_HOTEL_REPOSITORY,
  ROLE_MERCHANT_REPOSITORY,
  ROLE_PERMISSION_REPOSITORY,
  ROLE_REPOSITORY,
} from '../../constants';
import { MockType } from 'helpers';
import { Repository } from 'typeorm';
import { RoleService } from './role.service';
import {
  Role,
  RoleHotel,
  RoleMerchant,
  RolePermission,
} from 'database/entities/role.entity';
import { InjectableUser } from 'database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RoleType } from '../../database/enums/roletype';

const roleList = [{
//todo: add roles here
}]

const RoleRepositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    delete: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    findAll: jest.fn(() => roleList)
  }),
);

const ConnectionMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    createQueryBuilder: jest.fn(() => ConnectionMockFactory()),
    select: jest.fn(() => ConnectionMockFactory()),
    where: jest.fn(() => ConnectionMockFactory()),
    andWhere: jest.fn(() => ConnectionMockFactory()),
    from: jest.fn(() => ConnectionMockFactory()),
    leftJoin: jest.fn(() => ConnectionMockFactory()),
    setParameter: jest.fn(() => ConnectionMockFactory()),
    setParameters: jest.fn(() => ConnectionMockFactory()),
    getRawMany: () => [
      //todo: add filtered results if needed
    ],
    getRawOne: () => {
      //todo: add filtered results if needed
    },
  }),
);

const defaultTenantUser: InjectableUser = {
  email: 'test@gmail.com',
  id: 1,
  type: UserType.TENANT_USER,
  firstName: '',
  lastName: '',
  isActive: false
}

describe('RoleService', () => {
  let service: RoleService;
  let roleRepositoryMock: MockType<Repository<Role>>;
  let rolePermissionRepositoryMock: MockType<Repository<RolePermission>>;
  let roleMerchantRepositoryMock: MockType<Repository<RoleMerchant>>;
  let roleHotelRepositoryMock: MockType<Repository<RoleHotel>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: ROLE_REPOSITORY,
          useFactory: RoleRepositoryMockFactory,
        },
        {
          provide: ROLE_MERCHANT_REPOSITORY,
          useFactory: RoleRepositoryMockFactory,
        },
        {
          provide: ROLE_HOTEL_REPOSITORY,
          useFactory: RoleRepositoryMockFactory,
        },
        {
          provide: ROLE_PERMISSION_REPOSITORY,
          useFactory: RoleRepositoryMockFactory,
        },
        {
          provide: PG_DATA_SOURCE,
          useFactory: ConnectionMockFactory,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepositoryMock = module.get(ROLE_REPOSITORY);
    rolePermissionRepositoryMock = module.get(ROLE_PERMISSION_REPOSITORY);
    roleMerchantRepositoryMock = module.get(ROLE_MERCHANT_REPOSITORY);
    roleHotelRepositoryMock = module.get(ROLE_HOTEL_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(roleRepositoryMock).toBeDefined();
  });

  it('should delete role permissions', async () => {
    const deleteSpy = jest.spyOn(rolePermissionRepositoryMock, 'delete');
    await service.deleteRolePermissions(1);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should save role permissions', async () => {
    const saveSpy = jest.spyOn(rolePermissionRepositoryMock, 'save');
    await service.saveRolePermissions(1, [1, 2, 3]);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should save merchant role', async () => {
    const saveSpy = jest.spyOn(roleMerchantRepositoryMock, 'save');
    await service.saveMerchantRole(1, 1);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should save hotel role', async () => {
    const saveSpy = jest.spyOn(roleHotelRepositoryMock, 'save');
    await service.saveHotelRole(1, 1);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should delete role permissions', async () => {
    const spy = jest.spyOn(rolePermissionRepositoryMock, 'delete');
    await service.deleteRolePermissions(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should create role for tenant successfully', async () => {
    const saveSpy = jest.spyOn(roleRepositoryMock, 'save');
    const rolePermissionsSaveSpy = jest.spyOn(rolePermissionRepositoryMock, 'save');
    const testRole = {
      name: 'TestRole',
      permissionIds: [1, 2, 3],
    };
    const roleVM = await service.create(defaultTenantUser, testRole, RoleType.TENANT_ROLE);
    expect(saveSpy).toHaveBeenCalled();
    expect(rolePermissionsSaveSpy).toHaveBeenCalled()
    expect(roleVM.name).toEqual(testRole.name);
  })

  it('should delete role if error happens saving role permissions', async () => {
    const deleteRoleSpy = jest.spyOn(roleRepositoryMock, 'delete');
    const testRole = {
      name: 'TestRole',
      permissionIds: [1, 2, 3],
    };
    const saveRolePermissionsSpy = jest.spyOn(service, 'saveRolePermissions');
    saveRolePermissionsSpy.mockImplementationOnce(() => {
      throw new Error('Something bad');
    });

    try {
      await service.create(defaultTenantUser, testRole, RoleType.TENANT_ROLE);
    } catch (err) {
      expect(err.message).toBe('Permission does not exist');
    }
    expect(deleteRoleSpy).toHaveBeenCalled();
  });

  it('should update role', async () => {
    const testRole = {
      id: 1,
      version: 1,
      name: 'TestRole',
      permissionIds: [1, 2, 3],
    };
    const serviceFindOneSpy = jest.spyOn(service, 'findOne');
    serviceFindOneSpy.mockImplementationOnce(async () => testRole);

    const saveRoleSpy = jest.spyOn(roleRepositoryMock, 'save');
    const deleteRolePermissionsSpy = jest.spyOn(service, 'deleteRolePermissions');
    deleteRolePermissionsSpy.mockImplementationOnce(async () => null);
    const saveRolePermissionsSpy = jest.spyOn(service, 'saveRolePermissions');
    saveRolePermissionsSpy.mockImplementationOnce(async () => null);

    const updated = await service.update(1, testRole.version, testRole, RoleType.TENANT_ROLE, defaultTenantUser);
    expect(serviceFindOneSpy).toHaveBeenCalled();
    expect(saveRoleSpy).toHaveBeenCalled();
    expect(deleteRolePermissionsSpy).toHaveBeenCalled();
    expect(saveRolePermissionsSpy).toHaveBeenCalled();
    expect(updated.name).toEqual(testRole.name);
    expect(updated.id).toEqual(testRole.id);
  });
});
