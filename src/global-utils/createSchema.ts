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
import {
  GetAllMyImagesResolver,
  GetThoseIFollowAndTheirPostsResolver
} from "../modules/user/GetMyImagesResolver";
import { FollowUser } from "../modules/user/FollowUser";

export const createSchema = () =>
  buildSchema({
    resolvers: [
      ChangePasswordResolver,
      ConfirmUserResolver,
      CreatePostResolver,
      CreateProductResolver,
      CreateUserResolver,
      FollowUser,
      ForgotPasswordResolver,
      GetAllMyImagesResolver,
      GetThoseIFollowAndTheirPostsResolver,
      LoginResolver,
      LogoutResolver,
      MeResolver,
      ProfilePictureResolver,
      RegisterResolver
    ],
    authChecker: ({ context: { req } }) => {
      // I can read context here
      // cehck permission vs what's in the db "roles" argument
      // that comes from `@Authorized`, eg,. ["ADMIN", "MODERATOR"]
      return !!req.session.userId;
    }
  });
