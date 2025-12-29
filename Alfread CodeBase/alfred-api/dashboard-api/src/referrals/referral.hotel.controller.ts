import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { RestApiResponse } from "helpers";
import { CreateReferralDTO } from "./dto/create-referral.dto";
import { UpdateReferralDTO } from "./dto/update-referral.dto";
import { ReferralService } from "./referral.service";

@ApiTags("Referral")
@ApiBearerAuth()
@Controller("hotel/referral")
export class HotelReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateReferralDTO) {
    try {
      const referral = await this.referralService.create(dto);
      return RestApiResponse(referral);
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

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    try {
      const data = await this.referralService.findAll();
      return RestApiResponse(data);
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

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(@Param("id") id: string) {
    try {
      const data = await this.referralService.findById(id);
      return RestApiResponse(data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch referral",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(@Param("id") id: string, @Body() dto: UpdateReferralDTO) {
    try {
      const referral = await this.referralService._update(+id, dto);
      return RestApiResponse(referral);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update referral",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string) {
    try {
      await this.referralService._delete(+id);
      return RestApiResponse({ message: "Referral deleted successfully" });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete referral",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
