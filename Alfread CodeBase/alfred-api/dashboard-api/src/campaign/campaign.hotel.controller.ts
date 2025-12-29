import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Patch,
  Delete,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { RestApiResponse } from "helpers";
import { CreateCampaignDTO } from "./dto/create-campaign.dto";
import { CampaignService } from "./campaign.service";
import { UpdateCampaignDTO } from "./dto/update-campaign.dto";

@ApiTags("Campaign")
@ApiBearerAuth()
@Controller("campaign/hotel")
export class HotelCampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateCampaignDTO) {
    try {
      const campaign = await this.campaignService.create(dto);
      return RestApiResponse(campaign);
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

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    try {
      const data = await this.campaignService.findAll();
      return RestApiResponse(data);
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

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(@Param("id") id: string) {
    try {
      const data = await this.campaignService.findById(id);
      return RestApiResponse(data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(@Param("id") id: string, @Body() dto: UpdateCampaignDTO) {
    try {
      const updateCampaign = await this.campaignService._update(+id, dto);
      return RestApiResponse(updateCampaign);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string) {
    try {
      await this.campaignService._delete(+id);
      return RestApiResponse({ message: "Campaign deleted successfully" });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete Campaign",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
