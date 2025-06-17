import {PlayerDTO} from "./playerDTO";
import {User} from "../../user-details/User";

export interface TournamentDTO {

  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  players?: PlayerDTO[];
  moderatorId: number;

}
