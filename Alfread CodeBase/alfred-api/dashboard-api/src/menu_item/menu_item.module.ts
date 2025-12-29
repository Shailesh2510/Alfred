import { Module } from '@nestjs/common';
import { MenuItemService } from './menu_item.service';
import { menuItemProviders } from './menu_item.providers';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ItemModule } from '../item/item.module';
import { MenuCategoryModule } from '../menu_category/menu_category.module';
import { MenuModule } from '../menu/menu.module';
import { TenantMenuItemController } from './menu_item.tenant.controller';

@Module({
  imports: [DatabaseModule, AuthModule, MenuModule, ItemModule, MenuCategoryModule],
  controllers: [TenantMenuItemController],
  providers: [MenuItemService, ...menuItemProviders]
})
export class MenuItemModule {}
