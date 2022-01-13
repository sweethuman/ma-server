import {Service} from "@tsed/di";

export type User = {
  email: string;
  password: string;
  assetIds: string[];
};

@Service()
export class UserService {
  private readonly users: User[] = [{email: "gheo@sweethuman.tech", password: "123456", assetIds: ["2", "3"]}];

  create(user: Readonly<User>) {
    const ourUser: User = Object.assign({}, user);
    this.users.push(ourUser);
    return Object.assign({}, ourUser);
  }

  findByEmail(email: string) {
    return this.users.find((s) => s.email === email);
  }
}
