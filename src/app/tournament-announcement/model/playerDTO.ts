import {User} from "../../user-details/User";
import {TournamentDTO} from "./TournamentDTO";

export interface PlayerDTO {
  tournaments: TournamentDTO[];
  gamePlayerID: string;
  gamePlayerName: string;
  teamName: string;
}
