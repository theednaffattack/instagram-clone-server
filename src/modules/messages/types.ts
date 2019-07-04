import { User } from "../../entity/User";

export interface MessagePayload {
  id: string;
  message: string;
  created_at?: Date;
  updated_at?: Date;
  sentBy: User;
  user: User;
}
