import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RestApiResponse } from 'helpers';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { CityService } from './city.service';

@ApiTags('City (Public)')
@Controller('gateway/city/public')
@ApiBearerAuth()
export class PublicCityController {
  constructor(private readonly cityService: CityService) {}

  @Get(':uuid/time')
  @UseGuards(ApiKeyGuard)
  async getCityTime(
    @Param('uuid') uuid: string,
  ) {
    const city = await this.cityService.findOne({
      where: {
        _id: uuid,
      }
    })
    const dateString = new Date().toLocaleString("en-US", {
      timeZone: city.timezone,
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
    const datetime = new Date(Date.parse(dateString));
    const [datePart, timePart] = dateString.split(', ');
    const [month, day, year] = datePart.split('/');
    return RestApiResponse({
      timezone: city.timezone,
      localeString: dateString,
      utcDatetime: datetime,
      localTime: `${year}-${month}-${day} ${timePart}`,
    })
  }
}
