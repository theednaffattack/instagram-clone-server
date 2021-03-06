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
  CreateProductResolver,
} from "../modules/user/CreateUser";
import { ProfilePictureResolver } from "../modules/user/ProfilePictureUpload";
import { CreatePost } from "../modules/posts/CreatePost";
// import { GetAllMyImagesResolver } from "../modules/user/GetMyImages";
import { GetAllMyImagesResolver } from "../modules/user/GetMyImagesResolver";
import { EditUserInfoResolver } from "../modules/user/EditUserInfo";
import { GetThoseIFollowAndTheirPostsResolver } from "../modules/posts/GetThoseIFollowAndTheirPostsResolver";
import { FollowUser } from "../modules/user/FollowUser";
import { GetMyMessagesFromUserResolver } from "../modules/messages/GetMyMessagesFromUser";
import { SendMessageResolver } from "../modules/messages/SendMessages";
import { GetGlobalPostsResolver } from "../modules/posts/GetGlobalFeed";
import { GetGlobalPostById } from "../modules/posts/GetGlobalPostById";

import { UnFollowUser } from "../modules/user/UnFollowUser";
import { MeAndAllFollowers } from "../modules/user/GetMyFollowers";
import { MyFollowingPostsResolver } from "../modules/posts/GetMyPosts";
import { GetMyFollowingPostById } from "../modules/posts/GetMyFollowingPostById";

import { GetAllMessagesResolver } from "../modules/messages/GetAllMyMessages";
import { GetMessageThreadsResolver } from "../modules/messages/GetMessageThreads";
import { CreateMessageThreadResolver } from "../modules/messages/CreateMessageThreads";
import { AddMessageToThreadResolver } from "../modules/messages/AddMessageToThreads";

import { GetListToCreateThread } from "../modules/messages/GetListToCreateThread";
import { SignS3 } from "../modules/aws-s3/s3-sign-mutation";
import { GetOnlyThreads } from "../modules/messages/GetOnlyThreads";
import { GetMessagesByThreadId } from "../modules/messages/GetMessagesByThreadId";
import { NewMessageByThreadIdResolver } from "../modules/messages/NewMessageByThreadId";
import { CreateOrUpdateLikes } from "../modules/posts/likes/updateLikes.resolver";
import { AddCommentToPost } from "../modules/posts/comments/createNewComment.resolver";
import { CommentCountResolver } from "../modules/posts/comments/commentCount.subscription.resolver";
import { LikesCountResolver } from "../modules/posts/likes/likesCount.subscription.resolver";
import { pubSub } from "../redis";
import { ResendConfirmationEmailResolver } from "../modules/user/resend-confirmation-email";
import { GetGlobalPostsRelayResolver } from "../modules/posts/GetGlobalFeedRelay";
import { GetGlobalPostsSimplePaginationResolver } from "../modules/posts/get-global-feed-simple-pagination";

export const createSchema = () =>
  buildSchema({
    resolvers: [
      AddMessageToThreadResolver,
      ChangePasswordResolver,
      CommentCountResolver,
      ConfirmUserResolver,
      CreateOrUpdateLikes,
      CreatePost,
      CreateProductResolver,
      CreateMessageThreadResolver,
      AddCommentToPost,
      CreateUserResolver,
      EditUserInfoResolver,
      FollowUser,
      ForgotPasswordResolver,
      GetMyFollowingPostById,
      GetGlobalPostById,
      GetGlobalPostsResolver,
      GetGlobalPostsRelayResolver,
      GetGlobalPostsSimplePaginationResolver,
      GetAllMessagesResolver,
      GetOnlyThreads,
      GetMessageThreadsResolver,
      GetMyMessagesFromUserResolver,
      GetAllMyImagesResolver,
      GetListToCreateThread,
      GetThoseIFollowAndTheirPostsResolver,
      GetMessagesByThreadId,
      LikesCountResolver,
      LoginResolver,
      LogoutResolver,
      MeResolver,
      MeAndAllFollowers,
      MyFollowingPostsResolver,
      NewMessageByThreadIdResolver,
      ProfilePictureResolver,
      RegisterResolver,
      ResendConfirmationEmailResolver,
      SendMessageResolver,
      SignS3,
      UnFollowUser,
    ],
    pubSub,
    authChecker: ({ context: { req } }) => {
      // I can read context here
      // cehck permission vs what's in the db "roles" argument
      // that comes from `@Authorized`, eg,. ["ADMIN", "MODERATOR"]
      return !!req.session.userId;
    },
  });
