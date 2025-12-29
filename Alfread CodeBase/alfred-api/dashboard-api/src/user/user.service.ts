import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import {
  PG_DATA_SOURCE,
  USER_HOTEL_REPOSITORY,
  USER_MERCHANT_REPOSITORY,
  USER_REPOSITORY,
  USER_ROLE_REPOSITORY,
} from '../../constants';
import { DataSource, In, Repository } from 'typeorm';
import { CreateUserDTO, TenantCreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO, UpdateUserPasswordDTO } from './dto/update-user.dto';
import {
  InjectableUser,
  InjectableUserVM,
  User,
  UserHotel,
  UserMerchant,
  UserRole,
} from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { CognitoService } from '../aws/cognito.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  logger = new Logger();
  @Inject(USER_REPOSITORY)
  private readonly repository: Repository<User>;
  @Inject(USER_ROLE_REPOSITORY)
  private readonly userRoleRepository: Repository<UserRole>;
  @Inject(USER_HOTEL_REPOSITORY)
  private readonly userHotelRepository: Repository<UserHotel>;
  @Inject(USER_MERCHANT_REPOSITORY)
  private readonly userMerchantRepository: Repository<UserMerchant>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(CognitoService)
  private readonly cognitoService: CognitoService;
  @Inject(RoleService)
  private readonly roleService: RoleService;

  async getInjectableUser(email: string): Promise<InjectableUser> {
    const entity = await this.getUserVMQuerybuilder()
      .where('email = :email')
      .setParameters({
        email,
      })
      .getRawOne();
    return InjectableUserVM.toVM(entity);
  }

  async create(
    authUser: InjectableUser,
    createUserDTO: CreateUserDTO & TenantCreateUserDTO,
    type: UserType,
  ) {
    const exists = await this.repository.findOne({where: {
        email: createUserDTO.email
      }
    })
    if (exists) {
      throw new HttpException(`User with email ${createUserDTO.email} exists`, HttpStatus.BAD_REQUEST)
    }
    if (createUserDTO.merchantId && createUserDTO.hotelId) {
      throw new HttpException(`Can't assign the same user to merchant and hotel`, HttpStatus.BAD_REQUEST);
    }
    const entity = await this.repository.save({
      ...createUserDTO,
      username: createUserDTO.email,
      isActive: createUserDTO.isActive ?? false,
      type: (createUserDTO.merchantId) ? UserType.MERCHANT_USER : (createUserDTO.hotelId) ? UserType.HOTEL_USER : UserType.TENANT_USER,
    });
    let userRoles = null;
    try {
      userRoles = await this.saveUserRoles(entity.id, [createUserDTO.roleId]);
    } catch (err) {
      console.log('[UserService@create]: ', err);
      await this.repository.delete(entity.id);
      throw new HttpException('Role does not exist', HttpStatus.BAD_REQUEST);
    }
    let hotelUser = null;
    let merchantUser = null;
    try {
      switch (type) {
        case UserType.TENANT_USER:
          if (createUserDTO.merchantId) {
            merchantUser = await this.saveMerchantUser(createUserDTO.merchantId, entity.id);
          }
          if (createUserDTO.hotelId) {
            hotelUser = await this.saveHotelUser(createUserDTO.hotelId, entity.id);
          }
          break;
        case UserType.HOTEL_USER:
          hotelUser = await this.saveHotelUser(authUser.hotelId, entity.id);
          break;
        case UserType.MERCHANT_USER:
          merchantUser = await this.saveMerchantUser(authUser.merchantId, entity.id);
          break;
      }
    } catch (err) {
      this.logger.error(`error creating user: ${err.message}`)
      throw new HttpException(`Unable to create user`, HttpStatus.CONFLICT)
    }

    try {
      await this.cognitoService.createDefaultUser({
        username: createUserDTO.email,
        userPoolId: process.env.DASHBOARD_POOL_ID,
      });
      await this.cognitoService.updateAttributes({
        username: createUserDTO.email,
        userPoolId: process.env.DASHBOARD_POOL_ID,
      })
    } catch (err) {
      if (hotelUser) {
        await this.userHotelRepository.delete({
          id: hotelUser.id
        })
      }
      if (merchantUser) {
        await this.userMerchantRepository.delete({
          id: merchantUser.id
        })
      }

      console.log('userRoles: ', userRoles);
      console.log('userRoles-ids: ', userRoles.map(userRole => userRole.id));
      await this.userRoleRepository.delete({
        id: In(userRoles.map(userRole => userRole.id))
      })

      await this.repository.delete({
        id: entity.id
      })
      
      throw new HttpException('Failed to create account for user', HttpStatus.CONFLICT);
    }
    return entity;
  }

  private async saveMerchantUser(merchantId: number, userId: number) {
    return await this.userMerchantRepository.save({
      merchantId,
      userId,
    });
  }

  private async saveHotelUser(hotelId: number, userId: number) {
    return await this.userHotelRepository.save({
      hotelId,
      userId,
    });
  }

  private async saveUserRoles(userId: number, roleIds: number[]) {
    return await this.userRoleRepository.save(
      roleIds.map((roleId) => ({
        userId,
        roleId,
      })),
    );
  }

  async findAll(type: UserType, authUser: InjectableUser) {
    const queryBuilder = this.getUserVMQuerybuilder();
    switch (type) {
      case UserType.TENANT_USER:
        return await queryBuilder.getRawMany();
      case UserType.HOTEL_USER:
        return await queryBuilder
          .where('uh.hotel_id = :hotelId')
          .setParameters({
            hotelId: authUser.hotelId,
          })
          .getRawMany();
      case UserType.MERCHANT_USER:
        return await queryBuilder
          .where('um.merchant_id = :merchantId')
          .setParameters({
            merchantId: authUser.merchantId,
          })
          .getRawMany();
    }
  }

  private getUserVMQuerybuilder() {
    return this.connection
      .createQueryBuilder()
      .select(
        `
        u.id,
        u.version,
        u.first_name,
        u.last_name,
        u.email,
        u.type,
        uh.hotel_id,
        um.merchant_id,
        u.phone_number,
        u.is_active,
        m.name as merchant_name,
        h.name as hotel_name
      `,
      )
      .from('users', 'u')
      .leftJoin('user_hotel', 'uh', 'uh.user_id = u.id')
      .leftJoin('user_merchant', 'um', 'um.user_id = u.id')
      .leftJoin('merchants', 'm', 'm.id = um.merchant_id')
      .leftJoin('hotels', 'h', 'h.id = uh.hotel_id');
  }

  async findOne(id: number, type: UserType, authUser: InjectableUser) {
    const queryBuilder = this.getUserVMQuerybuilder()
      .andWhere('u.id = :userId')
      .setParameter('userId', id);
    let user = null
    switch (type) {
      case UserType.TENANT_USER:
        user = await queryBuilder.getRawOne();
        break;
      case UserType.HOTEL_USER:
        user = await queryBuilder
          .andWhere('uh.hotel_id = :hotelId')
          .setParameters({
            hotelId: authUser.hotelId,
          })
          .getRawOne();
        break;
      case UserType.MERCHANT_USER:
        user = await queryBuilder
          .andWhere('um.merchant_id = :merchantId')
          .setParameters({
            merchantId: authUser.merchantId,
          })
          .getRawOne();
        break;
    }
    const roles = await this.roleService.getByUserId(id);
    return {
      ...user,
      role: roles.length ? roles[0] : null
    }
  }

  async update(
    id: number,
    updateUserDTO: UpdateUserDTO,
    type: UserType,
    authUser: InjectableUser,
  ) {
    const existingUser = await this.findOne(id, type, authUser);
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (updateUserDTO.hotelId) {
      await this.userHotelRepository.delete({
        userId: existingUser.id,
      })
      await this.saveHotelUser(updateUserDTO.hotelId, existingUser.id);
    }
    if (updateUserDTO.merchantId) {
      await this.userMerchantRepository.delete({
        userId: existingUser.id,
      })
      await this.saveMerchantUser(updateUserDTO.merchantId, existingUser.id);
    }
    const entity = await this.repository.save({
      id,
      firstName: updateUserDTO.firstName,
      lastName: updateUserDTO.lastName,
      phoneNumber: updateUserDTO.phoneNumber,
      isActive: updateUserDTO.isActive
    });
    if (updateUserDTO.isActive) {
      await this.cognitoService.enableDisableUser({
        username: entity.email,
        userPoolId: process.env.DASHBOARD_POOL_ID,
      }, true)
    } else if (updateUserDTO.isActive == false) {
      await this.cognitoService.enableDisableUser({
        username: entity.email,
        userPoolId: process.env.DASHBOARD_POOL_ID,
      }, false)
    }
    // await this.deleteUserRoles(id);
    // await this.saveUserRoles(id, [updateUserDTO.roleId]);
    return entity;
  }

  async setUserPassword(
    id: number,
    dto: UpdateUserPasswordDTO,
  ) {
    const existingUser = await this.findOne(id, UserType.TENANT_USER, null);
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    await this.cognitoService.setUserPassword({
      username: existingUser.email,
      userPoolId: process.env.DASHBOARD_POOL_ID,
      password: dto.password,
      permanent: dto.permanent ?? false,
    })
  }

  async remove(id: number) {
    try {
      const user = await this.repository.findOne({
        where: {
          id,
        }
      })
      if (user) {
        await this.repository.softDelete({
          id,
        });
        await this.cognitoService.deleteUser({
          username: user.email,
          userPoolId: process.env.DASHBOARD_POOL_ID,
        })
      } else {
        return false;
      }
    } catch (err) {
      this.logger.error(`UserService@remove: ${err.message}`)
      throw new HttpException(`Failed to delete user`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
    
    return true
  }
}
