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
  username: casual.last_name,
  email: casual.email,
  password: casual.password,
};

// const mockUser2 = {
//   firstName: "bob",
//   lastName: "bob",
//   email: "bob@bob.com",
//   password: "skdjfksajfdksajfkjaskdfj"
// };

const registerMutation = `
mutation Register($data: RegisterInput!) {
  register(
    data: $data
  ) {
    id
    firstName
    lastName
    email
    name
  }
}
`;

describe("Register", () => {
  it("create user", async (done) => {
    // call resolver
    const response = await gCall({
      source: registerMutation,
      variableValues: {
        data: mockUser,
      },
    });

    expect(response).toMatchObject({
      data: {
        register: {
          username: mockUser.username,
          email: mockUser.email,
        },
      },
    });

    const dbUser = await User.findOne({ where: { email: mockUser.email } });

    // we should be able to find a user in the db
    expect(dbUser).toBeDefined();

    // that user SHOULD NOT be conifrmed yet
    expect(dbUser!.confirmed).toBeFalsy();

    // the user in the db should match our mocked up
    // data exactly
    expect(dbUser!.username).toBe(mockUser.username);

    done();
  });
});
