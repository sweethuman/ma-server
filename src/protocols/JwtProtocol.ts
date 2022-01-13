import {Req} from "@tsed/common";
import {Arg, OnInstall, OnVerify, Protocol} from "@tsed/passport";
import {ExtractJwt, Strategy, StrategyOptions} from "passport-jwt";
import {UserService} from "../providers/UserService";

@Protocol<StrategyOptions>({
  name: "jwt",
  useStrategy: Strategy,
  settings: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "secret",
    issuer: "accounts.examplesoft.com",
    audience: "yoursite.net"
  }
})
export class JwtProtocol implements OnVerify, OnInstall {
  constructor(private userService: UserService) {}

  async $onVerify(@Req() request: Req, @Arg(0) jwtPayload: any) {
    const user = this.userService.findByEmail(jwtPayload.sub);

    return user ? user : false;
  }

  $onInstall(strategy: Strategy): void {
    // intercept the strategy instance to adding extra configuration
  }
}
