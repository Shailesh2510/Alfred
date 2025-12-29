import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Repository, DataSource } from "typeorm";
import { BaseService } from "../base.service";
import { PG_DATA_SOURCE, REFERRAL_REPOSITORY } from "../../constants";
import { Referral } from "../../database/entities/referral.entity";
import { ReferralVM } from "./vm/referral.vm";
import axios from "axios";
import { CreateReferralDTO } from "./dto/create-referral.dto";
import { PostAmbassadorReferralDto } from "./dto/post-referral-record.dto";
import { CampaignService } from "src/campaign/campaign.service";
import { UpdateReferralDTO } from "./dto/update-referral.dto";

@Injectable()
export class ReferralService extends BaseService<Referral, {}, {}> {
  @Inject(REFERRAL_REPOSITORY)
  protected _repository: Repository<Referral>;
  @Inject(PG_DATA_SOURCE)
  private readonly connection: DataSource;
  @Inject(CampaignService)
  private readonly campaignService: CampaignService;

  async create(dto: CreateReferralDTO) {
    try {
      const campaign = await this.campaignService.findByCampaignId(
        dto.campaign_id
      );

      const existing = await this._repository.findOne({
        where: {
          ambassador_id: dto.ambassador_id,
          campaign_id: campaign.id,
          short_code: dto.short_code,
        },
      });

      if (existing) {
        throw new HttpException(
          "Referral ID already exists",
          HttpStatus.CONFLICT
        );
      }

      const referral = await this._repository.save({
        ...dto,
        campaign_id: campaign.id,
      });
      return new ReferralVM(referral).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to create referral",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async fetchAmbassadorCode(
    webCode: string,
    airportCode: string,
    ambassadorId: string
  ) {
    try {
      const result = await this.connection
        .createQueryBuilder("referrals", "r")
        .select("r.*")
        .innerJoin("hotels", "h", "h.web_code = :webCode", { webCode })
        .innerJoin(
          "areas",
          "a",
          "a.postal_codes SIMILAR TO '%' || h.address_zip_code || '%'"
        )
        .innerJoin("campaign_area", "ca", "ca.area_id = a.id ")
        .where("r.campaign_id = ca.campaign_id")
        .andWhere("ca.airport_code = :airportCode", { airportCode })
        .andWhere("LOWER(r.ambassador_id) = LOWER(:ambassadorId)", {
          ambassadorId,
        })
        .getRawOne();

      if (!result) {
        throw new HttpException("Referral not found", HttpStatus.NOT_FOUND);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch referral and campaign details",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByCode(hotelId: string, code: string, airportCode: string) {
    try {
      const referral = await this.fetchAmbassadorCode(
        hotelId,
        code,
        airportCode
      );

      return new ReferralVM(referral).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to find referral",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: string) {
    try {
      const referral = await this._repository
        .createQueryBuilder("referral")
        .where("referral.id = :id", { id })
        .andWhere("referral.deleted_at IS NULL")
        .getOne();

      if (!referral) {
        throw new HttpException("Referral not found", HttpStatus.NOT_FOUND);
      }

      return new ReferralVM(referral).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to find referral",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    try {
      const referrals = await this._repository
        .createQueryBuilder("referral")
        .where("referral.deleted_at IS NULL")
        .getMany();

      return new ReferralVM(referrals).build();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch referrals",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async postAmbassadorReferralRecord(referralData: PostAmbassadorReferralDto) {
    const referralApiUrl = `https://api.getambassador.com/api/v2/${process.env.AMBASSADOR_API_USERNAME}/${process.env.AMBASSADOR_API_TOKEN}/json/event/record/`;
    console.log(
      "Referral creation triggered with payload:",
      JSON.stringify(referralData)
    );

    const payload = {
      ...referralData,
      is_approved: referralData.is_approved ? 1 : 0,
    };

    try {
      const response = await axios.post(referralApiUrl, payload);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating referral with Referral API:",
        error.response?.data?.response?.errors?.error
      );
      throw new HttpException(
        "Failed to create referral with Referral API.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async _update(id: number, dto: UpdateReferralDTO) {
    const referral = await this._repository.findOne({
      where: { id },
    });

    if (!referral) {
      throw new HttpException("Referral not found", HttpStatus.NOT_FOUND);
    }

    const existing = await this._repository.findOne({
      where: {
        ambassador_id: dto.ambassador_id,
        campaign_id: dto.campaign_id,
        short_code: dto.short_code,
      },
    });

    if (existing) {
      throw new HttpException(
        "Referral ID already exists",
        HttpStatus.CONFLICT
      );
    }

    const campaign = await this.campaignService.findByCampaignId(
      dto.campaign_id
    );

    await this._repository.update(
      {
        id,
      },
      {
        ...dto,
        campaign_id: campaign.id,
      }
    );
    return await this._repository.findOne({
      where: { id },
    });
  }

  async _delete(id: number) {
    const referral = await this._repository.findOne({ where: { id } });

    if (!referral) {
      throw new HttpException("Referral not found", HttpStatus.NOT_FOUND);
    }

    await this._repository.delete(id);
  }
}
