import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse } from 'helpers';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/user.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { CategoryVM } from './vm/category.vm';

@ApiBearerAuth()
@ApiTags('Category (Merchant)')
@Controller('merchant/category')
@ApiExcludeController() //exclude on purpose
export class MerchantCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createCategoryDTO: CreateCategoryDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    throw new HttpException(`Functionality not implemented`, HttpStatus.BAD_REQUEST);
    const category = await this.categoryService._create(createCategoryDTO, authUser.merchantId);
    return RestApiResponse(new CategoryVM(category).build())
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser) {
    throw new HttpException(`Functionality not implemented`, HttpStatus.BAD_REQUEST);
    const categories = await this.categoryService.find({where: {
      merchantId: authUser.merchantId
    }});
    return RestApiResponse(new CategoryVM(categories).build())
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser) {
    throw new HttpException(`Functionality not implemented`, HttpStatus.BAD_REQUEST);
    const category = await this.categoryService.findOne({where: {
      id: +id, 
      merchantId: authUser.merchantId
    }});
    return RestApiResponse(new CategoryVM(category).build())
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDTO: UpdateCategoryDTO,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    throw new HttpException(`Functionality not implemented`, HttpStatus.BAD_REQUEST);
    const category = await this.categoryService.update(
      {id: +id, merchantId: authUser.merchantId},
      updateCategoryDTO
    );
    return RestApiResponse(new CategoryVM(category).build())
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @AuthUser(UserType.MERCHANT_USER) authUser: InjectableUser
  ) {
    throw new HttpException(`Functionality not implemented`, HttpStatus.BAD_REQUEST);
    return await this.categoryService.softDelete({
      id: +id,
      merchantId: authUser.merchantId
    });
  }
}
