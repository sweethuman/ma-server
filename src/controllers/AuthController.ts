import {Controller} from "@tsed/di";
import {Post} from "@tsed/schema";
import {BodyParams, Req} from "@tsed/common";
import jwt from "jsonwebtoken";
import {UserService} from "../providers/UserService";
import {Unauthorized} from "@tsed/exceptions";

@Controller("/auth")
export class AuthController {
  constructor(private userService: UserService) {}

  @Post("/login")
  get(@Req() req: Req, @BodyParams("email") email: string, @BodyParams("password") password: string) {
    const user = this.userService.findByEmail(email);
    if (!user || user.password != password) {
      throw new Unauthorized("Wrong password");
    }
    return {
      token: jwt.sign(
        {
          sub: email,
          iss: "accounts.examplesoft.com",
          aud: "yoursite.net"
        },
        "secret"
      )
    };
  }
}
