const AuthService = require("../../service/authServiceImpl");
const sinon = require("sinon");

describe("AuthService test", () => {
  it("has a module", () => {
    expect(AuthService).toBeDefined();
  });

  it("GET@/user", () => {
    const MockRepository = {
      findUserById: sinon.spy(),
    };

    const authService = AuthService(MockRepository);
    authService.findUserById("5ffa0f1ccdcf6908248ba239");

    const actual = MockRepository.findUserById.calledOnce;
    expect(actual).toEqual(true);
  });
});
