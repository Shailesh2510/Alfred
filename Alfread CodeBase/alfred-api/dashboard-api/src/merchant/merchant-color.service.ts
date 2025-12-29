import { Inject, Injectable } from "@nestjs/common";import { MERCHANT_REPOSITORY } from "../../constants";
import { Repository } from "typeorm";
import { Merchant } from "../../database/entities/merchant.entity";

@Injectable()
export class MerchantColorService {
  private readonly usedColors: Set<string> = new Set();
  private isUsedColorsInitialized = false;

  constructor(
    @Inject(MERCHANT_REPOSITORY)
    private readonly merchantRepository: Repository<Merchant>
  ) {}

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }

  private calculateLuminance([r, g, b]: number[]): number {
    return [r, g, b]
      .map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      })
      .reduce(
        (lum, channel, index) =>
          lum + channel * [0.2126, 0.7152, 0.0722][index],
        0
      );
  }

  private calculateContrast(luminance1: number, luminance2: number): number {
    const [brightest, darkest] = [luminance1, luminance2].sort((a, b) => b - a);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  private async initializeUsedColors(): Promise<void> {
    if (!this.isUsedColorsInitialized) {
      const merchants = await this.merchantRepository.find({
        select: ["color"],
      });
      merchants.forEach(({ color }) => {
        if (color) {
          this.usedColors.add(color.toLowerCase());
        }
      });
      this.isUsedColorsInitialized = true;
    }
  }

  private generateRandomColor(): {
    color: string;
    rgb: [number, number, number];
  } {
    const rgb: [number, number, number] = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ];
    const color = `#${rgb
      .map((val) => val.toString(16).padStart(2, "0"))
      .join("")}`;
    return { color: color.toLowerCase(), rgb };
  }

  private hasSufficientContrastWithBlack(
    newColorRgb: [number, number, number]
  ): boolean {
    const newColorLuminance = this.calculateLuminance(newColorRgb);
    const contrast = this.calculateContrast(0, newColorLuminance);
    return contrast >= 4.5; // Minimum contract of 4.5 with black(text color)
  }

  private colorDifference(
    rgb1: [number, number, number],
    rgb2: [number, number, number]
  ): number {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  private isDistinctFromUsedColors(
    newColorRgb: [number, number, number]
  ): boolean {
    const threshold = 100; // Minimum color difference threshold

    for (const usedColor of this.usedColors) {
      const usedColorRgb = this.hexToRgb(usedColor);
      const difference = this.colorDifference(newColorRgb, usedColorRgb);

      if (difference < threshold) {
        return false;
      }
    }
    return true;
  }

  async generateUniqueColor(): Promise<string> {
    await this.initializeUsedColors();

    let colorData: { color: string; rgb: [number, number, number] };

    do {
      colorData = this.generateRandomColor();
    } while (
      this.usedColors.has(colorData.color) ||
      !this.hasSufficientContrastWithBlack(colorData.rgb) ||
      !this.isDistinctFromUsedColors(colorData.rgb)
    );

    this.usedColors.add(colorData.color);
    return colorData.color;
  }
}
