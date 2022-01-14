import {Service} from "@tsed/di";
import {Student} from "../model/Student";
import _ from "lodash";
import {email} from "@tsed/schema";

@Service()
export class StudentService {
  private readonly students: Student[] = [];
  private lastUpdated: Date;
  private lastId = 0;

  constructor() {
    for (let i = 0; i < 40; i++) {
      this.create(new Student(`${i}`, `student ${i}`, new Date(Date.now() + i), 1, `test${i}@test.com`, "Test"));
    }
  }

  create(student: Readonly<Student>) {
    const ourStudent: Student = Object.assign({}, student);
    ourStudent.id = `${this.lastId + 1}`;
    this.lastId = this.lastId + 1;
    ourStudent.version = 1;
    ourStudent.date = new Date();
    this.students.push(ourStudent);
    this.lastUpdated = new Date();
    return Object.assign({}, ourStudent);
  }

  updateById(id: string, student: Readonly<Student>): Student | undefined {
    const idx = this.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return;
    }
    const ourStudent: Student = Object.assign({}, student);
    ourStudent.id = id;
    ourStudent.date = new Date();
    ourStudent.version = this.students[idx].version + 1;
    this.students[idx] = ourStudent;
    this.lastUpdated = new Date();
    return Object.assign({}, ourStudent);
  }

  deleteById(id: string): boolean {
    const idx = this.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return false;
    }
    this.students.splice(idx, 1);
    return true;
  }

  findById(id: string) {
    return this.students.find((s) => s.id === id);
  }

  findByName(name: string, ids: string[], facultyFilter: string, page: number) {
    const std = this.students
      .filter((item) => item.name.indexOf(name) !== -1)
      .filter((item) => item.faculty.indexOf(facultyFilter) !== -1)
      .filter((item) => ids.indexOf(item.id) !== -1)
      .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
    const chunks = _.chunk(std, 5);
    return page < chunks.length ? chunks[page] : [];
  }

  findAll(ids: string[], facultyFilter: string, page: number): Student[] {
    const std = this.students
      .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()))
      .filter((item) => ids.indexOf(item.id) !== -1)
      .filter((item) => item.faculty.indexOf(facultyFilter) !== -1);
    const chunks = _.chunk(std, 5);
    return page < chunks.length ? chunks[page] : [];
  }

  getLastUpdated(): Date {
    return this.lastUpdated;
  }

  getAvailableFilters(): string[] {
    const filterSet = new Set<string>();
    filterSet.add("");
    this.students.forEach((item) => filterSet.add(item.faculty));
    return Array.from(filterSet);
  }
}
