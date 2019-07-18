"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const ChangePassword_1 = require("../modules/user/ChangePassword");
const ConfirmUser_1 = require("../modules/user/ConfirmUser");
const ForgotPassword_1 = require("../modules/user/ForgotPassword");
const Login_1 = require("../modules/user/Login");
const Logout_1 = require("../modules/user/Logout");
const Me_1 = require("../modules/user/Me");
const Register_1 = require("../modules/user/Register");
const CreateUser_1 = require("../modules/user/CreateUser");
const ProfilePictureUpload_1 = require("../modules/user/ProfilePictureUpload");
const CreatePostResolver_1 = require("../modules/user/CreatePostResolver");
const GetMyImagesResolver_1 = require("../modules/user/GetMyImagesResolver");
const GetThoseIFollowAndTheirPostsResolver_1 = require("../modules/user/GetThoseIFollowAndTheirPostsResolver");
const FollowUser_1 = require("../modules/user/FollowUser");
const GetMyMessagesFromUser_1 = require("../modules/messages/GetMyMessagesFromUser");
const SendMessages_1 = require("../modules/messages/SendMessages");
const GetGlobalFeed_1 = require("../modules/user/GetGlobalFeed");
const UnFollowUser_1 = require("../modules/user/UnFollowUser");
const GetMyFollowers_1 = require("../modules/user/GetMyFollowers");
const GetMyPosts_1 = require("../modules/user/GetMyPosts");
const GetAllMyMessages_1 = require("../modules/messages/GetAllMyMessages");
const GetMessageThreads_1 = require("../modules/messages/GetMessageThreads");
const CreateMessageThreads_1 = require("../modules/messages/CreateMessageThreads");
const AddMessageToThreads_1 = require("../modules/messages/AddMessageToThreads");
const GetListToCreateThread_1 = require("../modules/user/GetListToCreateThread");
const s3_sign_mutation_1 = require("../modules/aws-s3/s3-sign-mutation");
exports.createSchema = () => type_graphql_1.buildSchema({
    resolvers: [
        AddMessageToThreads_1.AddMessageToThreadResolver,
        ChangePassword_1.ChangePasswordResolver,
        ConfirmUser_1.ConfirmUserResolver,
        CreatePostResolver_1.CreatePostResolver,
        CreateUser_1.CreateProductResolver,
        CreateMessageThreads_1.CreateMessageThreadResolver,
        CreateUser_1.CreateUserResolver,
        FollowUser_1.FollowUser,
        ForgotPassword_1.ForgotPasswordResolver,
        GetGlobalFeed_1.GetGlobalPostsResolver,
        GetAllMyMessages_1.GetAllMessagesResolver,
        GetMessageThreads_1.GetMessageThreadsResolver,
        GetMyMessagesFromUser_1.GetMyMessagesFromUserResolver,
        GetMyImagesResolver_1.GetAllMyImagesResolver,
        GetListToCreateThread_1.GetListToCreateThread,
        GetThoseIFollowAndTheirPostsResolver_1.GetThoseIFollowAndTheirPostsResolver,
        Login_1.LoginResolver,
        Logout_1.LogoutResolver,
        Me_1.MeResolver,
        GetMyFollowers_1.MeAndAllFollowers,
        GetMyPosts_1.MyFollowingPostsResolver,
        ProfilePictureUpload_1.ProfilePictureResolver,
        Register_1.RegisterResolver,
        SendMessages_1.SendMessageResolver,
        s3_sign_mutation_1.SignS3,
        UnFollowUser_1.UnFollowUser
    ],
    authChecker: ({ context: { req } }) => {
        return !!req.session.userId;
    }
});
//# sourceMappingURL=createSchema.js.map