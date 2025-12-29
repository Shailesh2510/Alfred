import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { AWS_DEFAULT_REGION } from "../../constants";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly logger = new Logger();
  constructor() {
    this.client = new S3Client({
      region: AWS_DEFAULT_REGION,
    });
  }

  async putObject(input: PutObjectCommandInput) {
    try {
      const command = new PutObjectCommand({
        ...input
      });
      const response = await this.client.send(command);
      this.logger.log(`Uploaded object at bucket ${input.Bucket} with key ${input.Key}`)
      this.logger.log(`Input body: ${input}`)
      return response;
    } catch (error) {
      this.logger.log(`[Failed uploading to s3]: ${error}`)
    }
  }

  async createPresignedUrl({ bucket, key, expiresIn, contentType }) {
    try {
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ...(contentType ? {ContentType: contentType} : null) });
      return getSignedUrl(this.client, command, { expiresIn });
    } catch (err) {
      this.logger.log(`[Failed generating presign url]: ${err}`)
    }
    throw new HttpException(`Failed to generate presign url`, HttpStatus.CONFLICT)
  };
}
