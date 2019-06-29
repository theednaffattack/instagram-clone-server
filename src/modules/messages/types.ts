import { User } from "../../entity/User";

export interface MessagePayload {
  id: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  sentBy: User;
  user: User;
}
