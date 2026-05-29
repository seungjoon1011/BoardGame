import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { UploadResponseDto } from './dto/upload-response.dto';

export type R2Folder = 'users/profile-images' | 'boardgames/images';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.getRequiredConfig('R2_ACCOUNT_ID');
    this.bucketName = this.getRequiredConfig('R2_BUCKET_NAME');
    this.publicBaseUrl = this.getRequiredConfig('R2_PUBLIC_BASE_URL').replace(
      /\/$/,
      '',
    );

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.getRequiredConfig('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.getRequiredConfig('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: R2Folder,
  ): Promise<UploadResponseDto> {
    const key = this.createObjectKey(file.originalname, folder);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      folder,
      key,
      url: `${this.publicBaseUrl}/${key}`,
      contentType: file.mimetype,
      size: file.size,
    };
  }

  private createObjectKey(filename: string, folder: R2Folder) {
    const extension = extname(filename).toLowerCase();
    return `${folder}/${randomUUID()}${extension}`;
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured`);
    }

    return value;
  }
}
