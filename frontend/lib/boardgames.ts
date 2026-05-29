export type BoardGame = {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  minPlayer: number;
  maxPlayer: number;
  genres: string[];
  imageKey?: string;
  imageUrl?: string;
  preferred?: boolean;
  played?: boolean;
};

export type BoardGamePayload = Omit<BoardGame, 'id' | 'preferred' | 'played'>;

export type MyBoardGames = {
  preferred: BoardGame[];
  played: BoardGame[];
};
