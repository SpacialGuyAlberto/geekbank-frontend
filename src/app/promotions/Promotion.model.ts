import {User} from "../user-details/User";

export interface Promotion {
  id: number;
  discountPorcentage: number;
  code: string;
  user: User;
}
