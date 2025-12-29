import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

export abstract class BaseEntity {
  build() {
    return Array.isArray(this) ? this.toEntityArray(this) : this.toEntity(this);
  }

  abstract toEntity<T>(input: T | T[]);

  construct<T>(input: T) {
    return this.toEntity(input);
  }

  toEntityArray<T>(input: T[]) {
    return input.map((v) => {
      return this.toEntity(v);
    });
  }
}

export abstract class AuditEntity extends BaseEntity {
  @VersionColumn()
  version: number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
    name: "updated_at",
  })
  public updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
  })
  deletedAt?: Date;
}
