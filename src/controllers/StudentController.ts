import {Controller} from "@tsed/di";
import {Delete, Get, Post, Put, Returns} from "@tsed/schema";
import {StudentService} from "../providers/StudentService";
import {BodyParams, Context, HeaderParams, PathParams, QueryParams} from "@tsed/common";
import {NotFound, NotModified} from "@tsed/exceptions";
import {Student} from "../model/Student";
import {StudentSocket} from "../providers/StudentSocket";
import {Authorize} from "@tsed/passport";

// TODO: pagination

@Controller("/student")
export class StudentController {
  constructor(private readonly studentsService: StudentService, private readonly studentSocket: StudentSocket) {}

  @Get("/")
  @Returns(304, NotModified).Description("Not updated")
  @Returns(200, Student).Description("Success")
  get(
    @HeaderParams("If-Modified-Since") ifModifiedSince: string,
    @Context() ctx: Context,
    @QueryParams("name") name?: string,
    @QueryParams("page") page?: string
  ) {
    const lastUpdated = this.studentsService.getLastUpdated();
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
      throw new NotModified("Students not modified since " + lastUpdated);
    }
    if (name) {
      return this.studentsService.findByName(name);
    }
    ctx.response.setHeader("Last-Modified", lastUpdated.toUTCString());
    return this.studentsService.findAll();
  }

  @Get("/:id")
  @Returns(404, NotFound).Description("Not found")
  @Returns(200, Student).Description("Success")
  getById(@PathParams("id") id: string) {
    const res = this.studentsService.findById(id);
    if (!res) {
      throw new NotFound("Student not found");
    }
    return res;
  }

  @Post("/")
  @Returns(201, Student).Description("Student Created")
  create(@BodyParams() student: Student) {
    const ourStudent = this.studentsService.create(student);
    this.studentSocket.broadcastStudent("created", ourStudent);
    return ourStudent;
  }

  @Put("/:id")
  update(@BodyParams() student: Student, @PathParams("id") id: string) {
    const ourStudent = this.studentsService.updateById(id, student);
    if (ourStudent) {
      this.studentSocket.broadcastStudent("created", ourStudent);
    }
    return ourStudent;
  }

  @Delete("/:id")
  @Returns(204)
  delete(@PathParams("id") id: string) {
    const res = this.studentsService.deleteById(id);
    if (!res) {
      throw new NotFound("Student not found");
    }
    this.studentSocket.broadcastStudent("deleted", {id: id});
  }
}
