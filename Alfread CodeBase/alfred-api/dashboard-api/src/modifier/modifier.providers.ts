import { ITEM_MODIFIER_REPOSITORY, MODIFIER_OPTION_REPOSITORY, MODIFIER_REPOSITORY, PG_DATA_SOURCE } from '../../constants';
import { DataSource } from 'typeorm';
import { Modifier } from '../../database/entities/modifier.entity';
import { ModifierOption } from '../../database/entities/modifier_option.entity';
import { ItemModifier } from '../../database/entities/item.entity';

export const modifierProviders = [
  {
    provide: MODIFIER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Modifier),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: MODIFIER_OPTION_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ModifierOption),
    inject: [PG_DATA_SOURCE],
  },
  {
    provide: ITEM_MODIFIER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ItemModifier),
    inject: [PG_DATA_SOURCE],
  },
];
