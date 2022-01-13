import {PassportException} from "@tsed/passport";
import {Catch, ExceptionFilterMethods, PlatformContext} from "@tsed/common";

@Catch(PassportException)
export class PassportExceptionFilter implements ExceptionFilterMethods {
  async catch(exception: PassportException, ctx: PlatformContext) {
    const {response} = ctx;

    console.log(exception.name);
  }
}
