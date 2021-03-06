import { testConn } from "../../../test-utils/testConn";
import { Connection } from "typeorm";
import casual from "casual";

import { gCall } from "../../../test-utils/gCall";
import { User } from "../../../entity/User";

let conn: Connection;

beforeAll(async (done) => {
  conn = await testConn();
  done();
});

afterAll(async (done) => {
  await conn.close();
  done();
});

const mockUser = {
  firstName: casual.first_name,
  lastName: casual.last_name,
  email: casual.email,
  password: casual.password,
};

const meQuery = `
{
    me{
      username
      email
      name
      id
    }
  }
`;

describe("Me", () => {
  it("get user info", async (done) => {
    const user = await User.create({
      // firstName: mockUser.firstName,
      username: mockUser.lastName,
      email: mockUser.email,
      password: mockUser.password,
    }).save();

    // call resolver
    const response = await gCall({
      source: meQuery,
      userId: user.id,
    });

    expect(response).toMatchObject({
      data: {
        me: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
    done();
  });

  it("return null", async (done) => {
    // call resolver
    const response = await gCall({
      source: meQuery,
    });

    // basically a test for an authenticated (logged in)
    // user
    expect(response).toMatchObject({
      data: {
        me: null,
      },
    });
    done();
  });
});
