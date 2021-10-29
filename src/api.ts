/**
 * Helper functions for requesting individual students instead of making a whole client
 * Using a client should be prefered over performance reasons
 */
import { ClasschartsClient } from '.'
import {
    ActivityResponse,
    BehaviourResponse,
    GetActivityOptions,
    GetBehaviourOptions,
    GetHomeworkOptions,
    GetLessonsOptions,
    HomeworksResponse,
    LessonsResponse,
    Student,
} from './types'
export async function getStudentInfo(
    studentCode: string,
    dateOfBirth: string | null
): Promise<Student> {
    const client = new ClasschartsClient(studentCode, dateOfBirth)
    return await client.getStudentInfo()
}
export async function getActivity(
    studentCode: string,
    dateOfBirth: string | null,
    options: GetActivityOptions | null
): Promise<ActivityResponse> {
    const client = new ClasschartsClient(studentCode, dateOfBirth)
    return await client.getActivity(options)
}
export async function getBehaviour(
    studentCode: string,
    dateOfBirth: string | null,
    options: GetBehaviourOptions | null
): Promise<BehaviourResponse> {
    const client = new ClasschartsClient(studentCode, dateOfBirth)
    return await client.getBehaviour(options)
}
export async function listHomeworks(
    studentCode: string,
    dateOfBirth: string | null,
    options: GetHomeworkOptions | null
): Promise<HomeworksResponse> {
    const client = new ClasschartsClient(studentCode, dateOfBirth)
    return await client.listHomeworks(options)
}
export async function getLessons(
    studentCode: string,
    dateOfBirth: string | null,
    options: GetLessonsOptions
): Promise<LessonsResponse> {
    const client = new ClasschartsClient(studentCode, dateOfBirth)
    return await client.getLessons(options)
}
