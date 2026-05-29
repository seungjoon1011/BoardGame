import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { UploadResponseDto } from './dto/upload-response.dto';

const imageFilePipe = new ParseFilePipe({
  validators: [
    new FileTypeValidator({ fileType: /^image\/.+$/ }),
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
  ],
});

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('users/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadUserProfileImage(
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.s3Service.uploadImage(file, 'users/profile-images');
  }

  @Post('boardgames/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadBoardGameImage(
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    this.assertFile(file);
    return this.s3Service.uploadImage(file, 'boardgames/images');
  }

  private assertFile(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('업로드할 파일이 필요합니다.');
    }
  }
}
