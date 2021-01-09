const UserService = require("../../user/userService");
const sinon = require("sinon");

describe("UserService test", () => {
  it("has a module", () => {
    expect(UserService).toBeDefined();
  });

  it("getUser test", () => {
    const MockRepository = {
      findUserById: sinon.spy(),
    };

    const userService = UserService(MockRepository);
    userService.findUser("1023jkdjsla");
    const expected = true;

    const actual = MockRepository.findUserById.calledOnce;
    expect(actual).toEqual(expected);
  });
});
