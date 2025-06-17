import {TournamentDTO} from "./TournamentDTO";
import {PlayerDTO} from "./playerDTO";

export interface prizeDTO {

  name: string;
  description: string;
  value: number;
  tournament: TournamentDTO
  player: PlayerDTO;

}
