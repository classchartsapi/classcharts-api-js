// Old version of the client
import Undici from "undici";
import { RequestOptions } from "undici/types/dispatcher";
import {
  ActivityResponse,
  AnnouncementsResponse,
  BadgesResponse,
  BehaviourResponse,
  DetentionsResponse,
  GetActivityOptions,
  GetBehaviourOptions,
  GetHomeworkOptions,
  GetLessonsOptions,
  Homework,
  HomeworksResponse,
  LessonsResponse,
  Student,
} from "./types";
import { API_BASE_STUDENT as API_BASE, BASE_URL } from "./consts";
/**
 * @deprecated Use ClasschartsStudentClient
 */
export class ClasschartsClient {
  public studentCode = "";
  public dateOfBirth = "";
  public studentId = 0;
  public studentName = "";
  private authCookies: Array<string> | undefined;
  private sessionId = "";
  /**
   * @deprecated Use ClasschartsStudentClient
   * @param studentCode Classcharts student code
   * @param dateOfBirth Student's date of birth
   */
  constructor(studentCode: string, dateOfBirth?: string) {
    console.warn(
      "ClasschartsClient is deprecated in favour of ClasschartsStudentClient, it will be removed in future versions"
    );
    this.studentCode = String(studentCode);
    this.dateOfBirth = String(dateOfBirth);
  }
  public async makeAuthedRequest(
    path: string,
    options: Omit<RequestOptions, "origin" | "path">
  ) {
    if (!this.authCookies) throw new Error("Not authenticated");
    const requestOptions: Omit<RequestOptions, "origin" | "path"> = {
      ...options,
      headers: {
        Cookie: this.authCookies.join(";"),
        authorization: "Basic " + this.sessionId,
      },
    };
    const request = await Undici.request(path, requestOptions);
    let responseJSON;
    try {
      responseJSON = await request.body.json();
    } catch {
      throw new Error("Invalid JSON response recieved");
    }
    if (responseJSON.success == 0) {
      throw new Error(responseJSON.error);
    }
    return responseJSON.data;
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * Initialises the client and authenticates with classcharts
   */
  async login(): Promise<void> {
    if (!this.studentCode) throw new Error("Student Code not inputted");
    const formData = new URLSearchParams();
    formData.append("_method", "POST");
    formData.append("code", this.studentCode.toUpperCase());
    formData.append("dob", this.dateOfBirth);
    formData.append("remember_me", "1");
    formData.append("recaptcha-token", "no-token-avaliable");
    const request = await Undici.request(BASE_URL + "/student/login", {
      method: "POST",
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (request.statusCode != 302 || !request.headers["set-cookie"])
      throw new Error("Unauthenticated: Classcharts returned an error");
    const cookies = request.headers["set-cookie"];
    for (let i = 0; i < cookies.length; i++) {
      cookies[i] = cookies[i].substring(0, cookies[i].indexOf(";"));
    }
    this.authCookies = cookies;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sessionID: any = decodeURI(cookies[2])
      .replace(/%3A/g, ":")
      .replace(/%2C/g, ",");
    sessionID = JSON.parse(
      sessionID.substring(sessionID.indexOf("{"), sessionID.length)
    );
    this.sessionId = sessionID.session_id;
    const user = await this.getStudentInfo();
    this.studentId = user.id;
    this.studentName = user.name;
  }
  /**
   * @deprecated Use .login() instead
   */
  async init(): Promise<void> {
    console.warn(
      "ClasschartsClient.init() is deprecated in favour of ClasschartsStudentClient.login(), it will be removed in future versions"
    );
    await this.login();
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @returns Student object
   */
  async getStudentInfo(): Promise<Student> {
    const data = await this.makeAuthedRequest(API_BASE + "/ping", {
      method: "POST",
      body: "include_date=true",
    });
    return data?.user;
  }
  /**
   * Get's the logged in student's general activity
   * @param options GetActivityOptions
   * @returns Activity data
   */
  async getActivity(options?: GetActivityOptions): Promise<ActivityResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    options?.last_id && params.append("last_id", options?.last_id);
    return this.makeAuthedRequest(
      API_BASE + "/activity/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @param options GetBehaviourOptions
   * @returns Array of behaviour points
   */
  async getBehaviour(
    options?: GetBehaviourOptions
  ): Promise<BehaviourResponse> {
    const params = new URLSearchParams();
    options?.from && params.append("from", options?.from);
    options?.to && params.append("to", options?.to);
    return await this.makeAuthedRequest(
      API_BASE + "/behaviour/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @param options GetHomeworkOptions
   * @returns Array of homeworks
   */
  async listHomeworks(
    options?: GetHomeworkOptions
  ): Promise<HomeworksResponse> {
    const params = new URLSearchParams();
    if (options?.displayDate)
      params.append("display_date", String(options?.displayDate));

    options?.fromDate && params.append("from", String(options?.fromDate));
    options?.toDate && params.append("to", String(options?.toDate));
    const data: Array<Homework> = await this.makeAuthedRequest(
      API_BASE + "/homeworks/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );

    for (let i = 0; i < data.length; i++) {
      data[i].description_raw = data[i].description;

      // homework.lesson.replace(/\\/g, '')
      data[i].description = data[i].description.replace(/(<([^>]+)>)/gi, "");
      data[i].description = data[i].description.replace(/&nbsp;/g, "");
      data[i].description = data[i].description.trim();
    }

    return data;
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @param options GetLessonsOptions
   * @returns Array of lessons
   */
  async getLessons(options?: GetLessonsOptions): Promise<LessonsResponse> {
    if (!options?.date) throw new Error("No date specified");
    const params = new URLSearchParams();
    params.append("date", String(options?.date));
    return await this.makeAuthedRequest(
      API_BASE + "/timetable/" + this.studentId + "?" + params.toString(),
      {
        method: "GET",
      }
    );
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @returns Array of badges
   */
  async getBadges(): Promise<BadgesResponse> {
    return await this.makeAuthedRequest(
      API_BASE + "/eventbadges/" + this.studentId,
      {
        method: "GET",
      }
    );
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @returns Array of announcements
   */
  async listAnnouncements(): Promise<AnnouncementsResponse> {
    return await this.makeAuthedRequest(
      API_BASE + "/announcements/" + this.studentId,
      {
        method: "GET",
      }
    );
  }
  /**
   * @deprecated Use ClasschartsStudentClient
   * @returns Array of detentions
   */
  async getDetentions(): Promise<DetentionsResponse> {
    return await this.makeAuthedRequest(
      API_BASE + "/detentions/" + this.studentId,
      {
        method: "GET",
      }
    );
  }
}