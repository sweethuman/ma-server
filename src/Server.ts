import {Configuration, Inject} from "@tsed/di";
import {PlatformApplication} from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import {config, rootDir} from "./config";
import "@tsed/socketio";
import "@tsed/passport";
import session from "express-session";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  mount: {
    "/": [`${rootDir}/controllers/**/*.ts`]
  },
  socketIO: {
    cors: {
      origin: "*"
    }
  },
  views: {
    root: `${rootDir}/views`,
    extensions: {
      ejs: "ejs"
    }
  },
  componentsScan: [
    `${rootDir}/protocols/*.ts` // scan protocols directory
  ],
  exclude: ["**/*.spec.ts"]
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {
    this.app
      .use(cors())
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(
        bodyParser.urlencoded({
          extended: true
        })
      )
      .use(
        session({
          secret: "secret",
          resave: true,
          saveUninitialized: true,
          cookie: {
            path: "/",
            httpOnly: true,
            secure: false,
            maxAge: undefined
          }
        })
      );
  }
}
