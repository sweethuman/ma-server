import {DateTime, Email, Property, ReadOnly, Required} from "@tsed/schema";

export class Student {
  @ReadOnly()
  public id: string;
  @Required()
  public name: string;
  @Required()
  @Email()
  public email: string;
  @Required()
  public faculty: string;
  @Required()
  public phoneNumber: string;
  @Property()
  public photoUrl: string;
  @ReadOnly()
  @DateTime()
  public date: Date;
  @ReadOnly()
  public version: number;

  constructor(id: string, name: string, date: Date, version: number, email = "", faculty = "", phoneNumber = "", photoUrl = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.faculty = faculty;
    this.phoneNumber = phoneNumber;
    this.photoUrl = photoUrl != null ? photoUrl : "https://robohash.org/" + name + ".png";
    this.date = date;
    this.version = version;
  }
}
