import { ApolloError } from "apollo-server-express";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { ArgumentValidationError } from "type-graphql";

export function formatGraphQLError(error: GraphQLError): GraphQLFormattedError {
  const { extensions = {}, locations, message, path } = error;

  if (message.includes("Not authenticated")) {
    return error;
  }

  if (error.originalError instanceof ApolloError) {
    return error;
  }

  if (error.originalError instanceof ArgumentValidationError) {
    // Add a custom error code
    extensions.code = "GRAPHQL_VALIDATION_FAILED";
    // Strip off the validation erros created by
    // decorator-style field validators.
    const { validationErrors } = extensions.exception;
    const valErrorsCache = [];

    // Loop over the validation errors and
    // create a custom error shape that's easier to
    // digest later.
    for (const error of validationErrors) {
      valErrorsCache.push({
        field: error.property,
        message: Object.values(error.constraints)[0],
      });
    }

    // Add the new error shape to extensions.
    extensions.valErrors = valErrorsCache;

    return {
      extensions,
      locations,
      message,
      path,
    };
  }

  //   error.message = "Internal Server Error";

  let getStacktrace = extensions.exception
    ? extensions.exception.stacktrace[0].replace("Error: ", "")
    : "Undetermined error";

  return {
    message: getStacktrace,
    path,
    locations,
    // extensions
  };
}
