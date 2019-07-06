import { buildSchema } from "type-graphql";

import { ChangePasswordResolver } from "../modules/user/ChangePassword";
import { ConfirmUserResolver } from "../modules/user/ConfirmUser";
import { ForgotPasswordResolver } from "../modules/user/ForgotPassword";
import { LoginResolver } from "../modules/user/Login";
import { LogoutResolver } from "../modules/user/Logout";
import { MeResolver } from "../modules/user/Me";
import { RegisterResolver } from "../modules/user/Register";
import {
  CreateUserResolver,
  CreateProductResolver
} from "../modules/user/CreateUser";
import { ProfilePictureResolver } from "../modules/user/ProfilePictureUpload";
import { CreatePostResolver } from "../modules/user/CreatePostResolver";
// import { GetAllMyImagesResolver } from "../modules/user/GetMyImages";
import { GetAllMyImagesResolver } from "../modules/user/GetMyImagesResolver";
import { GetThoseIFollowAndTheirPostsResolver } from "../modules/user/GetThoseIFollowAndTheirPostsResolver";
import { FollowUser } from "../modules/user/FollowUser";
import { GetMyMessagesFromUserResolver } from "../modules/messages/GetMyMessagesFromUser";
import { SendMessageResolver } from "../modules/messages/SendMessages";
import { GetGlobalPostsResolver } from "../modules/user/GetGlobalFeed";
import { UnFollowUser } from "../modules/user/UnFollowUser";
import { MeAndAllFollowers } from "../modules/user/GetMyFollowers";
import { MyFollowingPostsResolver } from "../modules/user/GetMyPosts";
import { GetAllMessagesResolver } from "../modules/messages/GetAllMyMessages";
import { GetMessageThreadsResolver } from "../modules/messages/GetMessageThreads";
import { CreateMessageThreadResolver } from "../modules/messages/CreateMessageThreads";
import { AddMessageToThreadResolver } from "../modules/messages/AddMessageToThreads";
import { GetListToCreateThread } from "../modules/user/GetListToCreateThread";

export const createSchema = () =>
  buildSchema({
    resolvers: [
      AddMessageToThreadResolver,
      ChangePasswordResolver,
      ConfirmUserResolver,
      CreatePostResolver,
      CreateProductResolver,
      CreateMessageThreadResolver,
      CreateUserResolver,
      FollowUser,
      ForgotPasswordResolver,
      GetGlobalPostsResolver,
      GetAllMessagesResolver,
      GetMyMessagesFromUserResolver,
      GetAllMyImagesResolver,
      GetListToCreateThread,
      GetMessageThreadsResolver,
      GetThoseIFollowAndTheirPostsResolver,
      LoginResolver,
      LogoutResolver,
      MeResolver,
      MeAndAllFollowers,
      MyFollowingPostsResolver,
      ProfilePictureResolver,
      RegisterResolver,
      SendMessageResolver,
      UnFollowUser
    ],
    authChecker: ({ context: { req } }) => {
      // I can read context here
      // cehck permission vs what's in the db "roles" argument
      // that comes from `@Authorized`, eg,. ["ADMIN", "MODERATOR"]
      return !!req.session.userId;
    }
  });
