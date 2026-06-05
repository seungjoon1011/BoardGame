import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('boardgames/:boardGameId/reviews')
  findAllByBoardGame(@Param('boardGameId') boardGameId: string) {
    return this.reviewService.findAllByBoardGame(Number(boardGameId));
  }

  @Post('boardgames/:boardGameId/reviews')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('boardGameId') boardGameId: string,
    @Req() req: AuthenticatedRequest,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(
      Number(boardGameId),
      req.user.id,
      createReviewDto,
    );
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.update(
      Number(id),
      req.user.id,
      updateReviewDto,
    );
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.reviewService.delete(Number(id), req.user.id);
  }
}
