import {
  // Arg,
  ClassType,
  Query,
  Resolver,
  UseMiddleware,
  Ctx
} from "type-graphql";

import { logger } from "../../middleware/logger";
import { isAuth } from "../../middleware/isAuth";
import { MyContext } from "../../../types/MyContext";

export function getBaseResolver<T extends ClassType>(
  suffix: string,
  // returnType: T,
  // inputType: X,
  entity: any,
  objectTypeCls: T,
  relations: any[]
) {
  @Resolver({ isAbstract: true })
  abstract class BaseResolver {
    // I should use below for dependency injection at the entity level?
    // for some reason I can't get the Typorm Repository to work. I may need
    // to think about how I'm using the connection manager.

    @UseMiddleware(isAuth, logger)
    @Query(() => [objectTypeCls], { name: `getAll${suffix}`, nullable: true })
    // @ts-ignore
    async getAll(@Ctx() { req }: MyContext) {
      const dbQuery = {
        relations: [...relations]
      };
      //Promise<T[]> {
      return await entity.find(dbQuery);
    }
  }
  return BaseResolver;
}
