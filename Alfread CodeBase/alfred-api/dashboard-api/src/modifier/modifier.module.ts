import { Module } from '@nestjs/common';
import { ModifierService } from './modifier.service';
import { modifierProviders } from './modifier.providers';
import { DatabaseModule } from 'database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { TenantModifierController } from './modifier.tenant.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TenantModifierController],
  providers: [ModifierService, ...modifierProviders],
  exports: [ModifierService]
})
export class ModifierModule {}
