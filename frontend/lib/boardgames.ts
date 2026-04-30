export type BoardGame = {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  minPlayer: number;
  maxPlayer: number;
  genres: string[];
};

export type BoardGamePayload = Omit<BoardGame, "id">;

