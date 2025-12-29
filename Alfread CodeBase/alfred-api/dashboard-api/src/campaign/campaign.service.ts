import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Repository, FindOneOptions } from "typeorm";
import { BaseService } from "../base.service";
import { CAMPAIGN_REPOSITORY } from "../../constants";
import { Campaign } from "../../database/entities/campaign.entity";
import { CampaignVM } from "./vm/campaign.vm";
import { CreateCampaignDTO } from "./dto/create-campaign.dto";
import { UpdateCampaignDTO } from "./dto/update-campaign.dto";

@Injectable()
export class CampaignService extends BaseService<Campaign, {}, {}> {
  @Inject(CAMPAIGN_REPOSITORY)
  protected _repository: Repository<Campaign>;

  async create(dto: CreateCampaignDTO) {
    try {
      const existing = await this._repository.findOne({
        where: {
          id: dto.id,
          name: dto.name,
          description: dto.description,
        },
      });

      if (existing) {
        throw new HttpException(
          "Campaign ID already exists",
          HttpStatus.CONFLICT
        );
      }

      const campaign = await this._repository.save(dto);
      return new CampaignVM(campaign).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to create campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByCode(
    airportCode: string,
    pickUpOrDropOff: string,
    hotelId: string
  ) {
    try {
      const campaign = await this._repository
        .createQueryBuilder("campaign")
        .andWhere("LOWER(campaign.airport_code) = LOWER(:airportCode)", {
          airportCode,
        })
        .andWhere("campaign.pickup_dropoff = :pickUpOrDropOff", {
          pickUpOrDropOff,
        })
        .andWhere("campaign.hotel_id = :hotelId", { hotelId })
        .andWhere("campaign.deleted_at IS NULL")
        .getOne();

      if (!campaign) {
        throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
      }

      return new CampaignVM(campaign).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to find campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: string) {
    try {
      const campaign = await this._repository
        .createQueryBuilder("campaign")
        .where("campaign.id = :id", { id })
        .andWhere("campaign.deleted_at IS NULL")
        .getOne();

      if (!campaign) {
        throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
      }

      return new CampaignVM(campaign).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to find campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByCampaignId(campaignId: string) {
    try {
      const campaign = await this._repository
        .createQueryBuilder("campaign")
        .where("campaign.id = :campaignId", { campaignId })
        .andWhere("campaign.deleted_at IS NULL")
        .getOne();

      if (!campaign) {
        throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
      }

      return new CampaignVM(campaign).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to find campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    try {
      const campaigns = await this._repository
        .createQueryBuilder("campaigns")
        .where("campaigns.deleted_at IS NULL")
        .getMany();

      return new CampaignVM(campaigns).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch campaigns",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async _update(id: number, dto: UpdateCampaignDTO) {
    const campaign = await this._repository.findOne({
      where: { id },
    });

    if (!campaign) {
      throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
    }

    const existing = await this._repository.findOne({
      where: {
        name: dto.name,
        description: dto.description,
        id: dto.id,
      },
    });

    if (existing) {
      throw new HttpException("Campaign already exists", HttpStatus.CONFLICT);
    }

    await this._repository.update(
      {
        id,
      },
      {
        ...dto,
      }
    );
    return await this._repository.findOne({
      where: { id },
    });
  }

  async _delete(id: number) {
    const referral = await this._repository.findOne({ where: { id } });

    if (!referral) {
      throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
    }

    await this._repository.delete(id);
  }
}
