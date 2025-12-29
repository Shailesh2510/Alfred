import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { PERMISSION_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { AccessType, IRoute } from '../route.interface';
import { DataSource, Repository } from 'typeorm';
import { Permission } from '../../database/entities/permission.entity';
import { CreatePermissionDTO } from './dto/create-permission.dto';
import * as uuidv5 from 'uuidv5';
import { InjectableUser } from '../../database/entities/user.entity';

@Injectable()
export class PermissionService {
  @Inject(PERMISSION_REPOSITORY)
  private readonly permissionRepository: Repository<Permission>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  private logger = new Logger();

  async createBatch(routes: IRoute[]) {
    const mapCounter = {};
    const entities: CreatePermissionDTO[] = routes.map((route: IRoute) => {
      const id = this.generateRandom(`${route.path}@${route.method}`);
      if (mapCounter[id]) {
        mapCounter[id].counter++;
      } else {
        mapCounter[id] = {
          counter: 1,
          path: `${route.path}@${route.method}`
        };
      }
      const ob = {
        id,
        path: route.path.toLowerCase(),
        method: route.method.toLowerCase(),
        name: `${route.path}@${route.method}`,
      };
      return ob;
    });
    try {
      await this.permissionRepository.save(entities);
    } catch (err) {
      this.logger.error('Error creating permissions');
      this.logger.error(err.message);
    }
    // console.log(`map-counter: `, mapCounter);
  }

  generateRandom(stringParam: string) {
    const uid = uuidv5('null', stringParam);
    const numbers = uid.match(/\d+/g); //get only the numbers
    const reducedNumber = numbers.reduce((a, b) => Number(a) + Number(b), 0);
    let numberToStrArr = reducedNumber.toString().split('');
    const maxIdLength = 7;
    if (numberToStrArr.length > maxIdLength) {
      numberToStrArr = numberToStrArr.slice(0, maxIdLength)
      this.generateRandom(numberToStrArr.join(''));
    }
    const num = +numberToStrArr.join('');
    return num;
  }

  async getPermissionsByUserId(userId: number): Promise<Permission[]> {
    const data = await this.connection
      .createQueryBuilder()
      .select('p.*')
      .from('permissions', 'p')
      .innerJoin('role_permission', 'rp', 'p.id = rp.permission_id')
      .innerJoin('user_role', 'ur', 'rp.role_id = ur.role_id')
      .where(`ur.user_id = :userId`)
      .setParameter('userId', userId)
      .getRawMany();
    return data;
  }

  async permissionExists(
    userId: number,
    path: string,
    method: string,
  ): Promise<boolean> {
    const data = await this.connection
      .createQueryBuilder()
      .select('p.*')
      .from('permissions', 'p')
      .innerJoin('role_permission', 'rp', 'p.id = rp.permission_id')
      .innerJoin('user_role', 'ur', 'rp.role_id = ur.role_id')
      .where(`ur.user_id = :userId`)
      .andWhere(`p.path = :path`)
      .andWhere(`p.method = :method`)
      .setParameters({
        userId: userId,
        path: path.toLowerCase(),
        method: method.toLowerCase(),
      })
      .getRawOne();
    return data != null;
  }

  async getByRoleId(roleId: number) {
    const data = await this.connection
      .createQueryBuilder()
      .select('p.*')
      .from('permissions', 'p')
      .innerJoin('role_permission', 'rp', 'p.id = rp.permission_id')
      .where(`rp.role_id = :roleId`)
      .setParameter('roleId', roleId)
      .getRawMany();
    return data;
  }

  async findAll(accessType: AccessType, authUser: InjectableUser) {
    let qb = this.connection.createQueryBuilder().select('p.*').from('permissions', 'p');
    switch (accessType) {
      case AccessType.TENANT:
        break;
      case AccessType.HOTEL:
      case AccessType.MERCHANT:
        throw new HttpException('Unsupported access type', HttpStatus.FORBIDDEN);
    }
    return await qb.getRawMany();
  }
}
