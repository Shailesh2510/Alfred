import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  PG_DATA_SOURCE,
  ROLE_HOTEL_REPOSITORY,
  ROLE_MERCHANT_REPOSITORY,
  ROLE_PERMISSION_REPOSITORY,
  ROLE_REPOSITORY,
} from '../../constants';
import {
  Role,
  RoleHotel,
  RoleMerchant,
  RolePermission,
} from 'database/entities/role.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { RoleType } from '../../database/enums/roletype';
import { InjectableUser } from '../../database/entities/user.entity';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RoleService {
  @Inject(ROLE_REPOSITORY)
  private readonly roleRepository: Repository<Role>;
  @Inject(ROLE_MERCHANT_REPOSITORY)
  private readonly roleMerchantRepository: Repository<RoleMerchant>;
  @Inject(ROLE_HOTEL_REPOSITORY)
  private readonly roleHotelRepository: Repository<RoleHotel>;
  @Inject(ROLE_PERMISSION_REPOSITORY)
  private readonly rolePermissionRepository: Repository<RolePermission>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(PermissionService)
  private readonly permissionService: PermissionService;

  async create(
    authUser: InjectableUser,
    createRoleDTO: CreateRoleDTO,
    type: RoleType,
  ) {
    const entity = await this.roleRepository.save({
      ...createRoleDTO,
      type,
    });
    try {
      await this.saveRolePermissions(entity.id, createRoleDTO.permissionIds);
    } catch (err) {
      console.log('[RoleService@create]: ', err);
      await this.roleRepository.delete(entity.id);
      throw new HttpException(
        'Permission does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    switch (type) {
      case RoleType.TENANT_ROLE:
        break;
      case RoleType.HOTEL_ROLE:
        await this.saveHotelRole(authUser.hotelId, entity.id);
        break;
      case RoleType.MERCHANT_ROLE:
        await this.saveMerchantRole(authUser.merchantId, entity.id);
        break;
    }
    return entity;
  }

  async saveHotelRole(hotelId: number, roleId: number) {
    await this.roleHotelRepository.save({
      roleId,
      hotelId,
    });
  }

  async saveMerchantRole(merchantId: number, roleId: number) {
    await this.roleMerchantRepository.save({
      roleId,
      merchantId,
    });
  }

  async saveRolePermissions(roleId: number, permissionIds: number[]) {
    await this.rolePermissionRepository.save(
      permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    );
  }

  async deleteRolePermissions(roleId: number) {
    await this.rolePermissionRepository.delete({
      roleId,
    });
  }

  private getRoleVMQueryBuilder() {
    return this.connection
      .createQueryBuilder()
      .select(
        `
        r.id,
        r.version,
        r.name,
        r.type,
        rh.hotel_id,
        rm.merchant_id
      `,
      )
      .from('roles', 'r')
      .leftJoin('role_hotel', 'rh', 'rh.role_id = r.id')
      .leftJoin('role_merchant', 'rm', 'rm.role_id = r.id');
  }

  async getByUserId(userId: number) {
    return this.connection
      .createQueryBuilder()
      .select(`r.*`)
      .from('roles', 'r')
      .innerJoin('user_role', 'ur', 'ur.role_id = r.id')
      .where('ur.user_id = :userId')
      .setParameter('userId', userId)
      .getRawMany()
  }

  async findAll(type: RoleType, authUser: InjectableUser) {
    const queryBuilder = this.getRoleVMQueryBuilder();
    switch (type) {
      case RoleType.TENANT_ROLE:
        return await queryBuilder.getRawMany();
      case RoleType.HOTEL_ROLE:
        return await queryBuilder
          .where('rh.hotel_id = :hotelId')
          .setParameters({
            hotelId: authUser.hotelId,
          })
          .getRawMany();
      case RoleType.MERCHANT_ROLE:
        return await queryBuilder
          .where('rm.merchant_id = :merchantId')
          .setParameters({
            merchantId: authUser.merchantId,
          })
          .getRawMany();
    }
  }

  async findOne(id: number, type: RoleType, authUser: InjectableUser) {
    const queryBuilder = this.getRoleVMQueryBuilder()
      .andWhere('r.id = :roleId')
      .setParameters({
        roleId: id,
      });
    let role = null;
    switch (type) {
      case RoleType.TENANT_ROLE:
        role = await queryBuilder.getRawOne();
        break;
      case RoleType.HOTEL_ROLE:
        role = await queryBuilder
          .andWhere('rh.hotel_id = :hotelId')
          .setParameters({
            hotelId: authUser.hotelId,
          })
          .getRawOne();
        break;
      case RoleType.MERCHANT_ROLE:
        role = await queryBuilder
          .andWhere('rm.merchant_id = :merchantId')
          .setParameters({
            merchantId: authUser.merchantId,
          })
          .getRawOne();
        break;
    }
    const permissions = await this.permissionService.getByRoleId(id);
    return {
      ...role,
      permissions
    };
  }

  async update(
    id: number,
    version: number,
    updateRoleDTO: UpdateRoleDTO,
    type: RoleType,
    authUser: InjectableUser,
  ) {
    const existingRole = await this.findOne(id, type, authUser);
    if (!existingRole) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    const roleEntity = await this.roleRepository.update({
      id,
    }, {
      ...updateRoleDTO
    });
    await this.deleteRolePermissions(id);
    await this.saveRolePermissions(id, updateRoleDTO.permissionIds);
    return roleEntity;
  }

  async remove(id: number) {
    try {
      await this.roleRepository.softDelete({
        id,
      });
    } catch (err) {
      console.log(`RoleService@remove: ${err.message}`)
      throw new HttpException(`Could not delete role`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
    
    return true
  }
}
