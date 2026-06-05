import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { User } from '../user/entities/user.entity';
import { BoardGame } from '../boardgame/entity/boardgame.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BoardGame)
    private readonly boardgameRepository: Repository<BoardGame>,
  ) {}

  async findAllByBoardGame(boardGameId: number): Promise<Review[]> {
    const reviews = await this.reviewRepository.find({
      where: { boardGame: { id: boardGameId } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    // 민감한 사용자 정보 제거
    return reviews.map((review) => {
      if (review.user) {
        const { password, refreshToken, ...safeUser } = review.user;
        review.user = safeUser as User;
      }
      return review;
    });
  }

  async create(
    boardGameId: number,
    userId: number,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const boardGame = await this.boardgameRepository.findOne({
      where: { id: boardGameId },
    });
    if (!boardGame) {
      throw new NotFoundException('보드게임을 찾을 수 없습니다.');
    }

    const review = this.reviewRepository.create({
      content: dto.content,
      user,
      boardGame,
    });

    const savedReview = await this.reviewRepository.save(review);
    
    // 민감한 사용자 정보 제거
    if (savedReview.user) {
      const { password, refreshToken, ...safeUser } = savedReview.user;
      savedReview.user = safeUser as User;
    }
    return savedReview;
  }

  async update(
    reviewId: number,
    userId: number,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: { user: true },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    review.content = dto.content;
    const updatedReview = await this.reviewRepository.save(review);

    // 민감한 사용자 정보 제거
    if (updatedReview.user) {
      const { password, refreshToken, ...safeUser } = updatedReview.user;
      updatedReview.user = safeUser as User;
    }
    return updatedReview;
  }

  async delete(reviewId: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: { user: true },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.reviewRepository.remove(review);
  }
}
