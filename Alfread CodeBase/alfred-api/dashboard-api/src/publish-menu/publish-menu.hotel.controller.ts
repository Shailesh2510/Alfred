import { Controller, Post, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/user.decorator';
import { InjectableUser } from '../../database/entities/user.entity';
import { UserType } from '../../database/enums/usertype';
import { RestApiResponse, TenantImpersonateQueryParams } from 'helpers';
import { PublishMenuService } from './publish-menu.service';

@ApiTags('Publish Menu (Hotel)')
@Controller('hotel/menu')
@ApiBearerAuth()
export class HotelPublishMenuController {
  constructor(
    private readonly publishMenuService: PublishMenuService
  ) {}

  @Post(':id/publish')
  @UseGuards(AuthGuard)
  async publish(
    @Param('id') id: string,
    @AuthUser(UserType.HOTEL_USER) authUser: InjectableUser,
    @Query() _: TenantImpersonateQueryParams,
  ) {
    const published = await this.publishMenuService.publishToS3(+id, authUser.hotelId);
    return RestApiResponse({
      published
    });
  }
}
