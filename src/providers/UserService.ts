import {Service} from "@tsed/di";

export type User = {
  email: string;
  password: string;
  assetIds: string[];
};

@Service()
export class UserService {
  private readonly users: User[] = [
    {email: "gheo@sweethuman.tech", password: "123456", assetIds: ["2", "3", "4", "5", "6", "7", "8", "10", "11", "12", "14", "24"]}
  ];

  create(user: Readonly<User>) {
    const ourUser: User = Object.assign({}, user);
    this.users.push(ourUser);
    return Object.assign({}, ourUser);
  }

  addAssetIdToUser(email: string, assetId: string) {
    const idx = this.users.findIndex((elem) => elem.email === email);
    if (idx === -1) {
      return;
    }
    this.users[idx].assetIds.push(assetId);
  }

  findByEmail(email: string) {
    return this.users.find((s) => s.email === email);
  }
}
