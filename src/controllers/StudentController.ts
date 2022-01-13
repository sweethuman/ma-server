import {Controller} from "@tsed/di";
import {Delete, Get, Post, Put, Returns} from "@tsed/schema";
import {StudentService} from "../providers/StudentService";
import {BodyParams, Context, HeaderParams, PathParams, QueryParams} from "@tsed/common";
import {NotFound, NotModified} from "@tsed/exceptions";
import {Student} from "../model/Student";
import {StudentSocket} from "../providers/StudentSocket";
import {Authorize} from "@tsed/passport";
import {UserService} from "../providers/UserService";

// TODO: pagination

@Controller("/")
@Authorize("jwt")
export class StudentController {
  constructor(
    private readonly studentsService: StudentService,
    private readonly studentSocket: StudentSocket,
    private readonly userService: UserService
  ) {}

  @Get("/student")
  @Returns(304, NotModified).Description("Not updated")
  @Returns(200, Student).Description("Success")
  get(
    @HeaderParams("If-Modified-Since") ifModifiedSince: string,
    @Context() ctx: Context,
    @QueryParams("name") name?: string,
    @QueryParams("filter") filter?: string,
    @QueryParams("page") page?: string
  ) {
    const lastUpdated = this.studentsService.getLastUpdated();
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
      throw new NotModified("Students not modified since " + lastUpdated);
    }
    if (name) {
      return this.studentsService.findByName(name, ctx.data.assetIds, filter ? filter : "");
    }
    ctx.response.setHeader("Last-Modified", lastUpdated.toUTCString());
    return this.studentsService.findAll(ctx.data.assetIds, filter ? filter : "");
  }

  @Get("/student/:id")
  @Returns(404, NotFound).Description("Not found")
  @Returns(200, Student).Description("Success")
  getById(@PathParams("id") id: string) {
    const res = this.studentsService.findById(id);
    if (!res) {
      throw new NotFound("Student not found");
    }
    return res;
  }

  @Post("/student")
  @Returns(201, Student).Description("Student Created")
  create(@BodyParams() student: Student, @Context() ctx: Context) {
    const ourStudent = this.studentsService.create(student);
    this.userService.addAssetIdToUser(ctx.data.email, ourStudent.id);
    this.studentSocket.broadcastStudent("created", ourStudent);
    return ourStudent;
  }

  @Put("/student/:id")
  update(@BodyParams() student: Student, @PathParams("id") id: string) {
    const ourStudent = this.studentsService.updateById(id, student);
    if (ourStudent) {
      this.studentSocket.broadcastStudent("updated", ourStudent);
    }
    return ourStudent;
  }

  @Delete("/student/:id")
  @Returns(204)
  delete(@PathParams("id") id: string) {
    const res = this.studentsService.deleteById(id);
    if (!res) {
      throw new NotFound("Student not found");
    }
    this.studentSocket.broadcastStudent("deleted", {id: id});
  }

  @Get("/studentfilter")
  @Returns(200)
  getAvailableFilters() {
    return this.studentsService.getAvailableFilters();
  }
}
