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
	dateOfBirth?: string
): Promise<Student> {
	const client = new ClasschartsClient(studentCode, dateOfBirth)
	return await client.getStudentInfo()
}
export async function getActivity(
	studentCode: string,
	dateOfBirth?: string,
	options?: GetActivityOptions
): Promise<ActivityResponse> {
	const client = new ClasschartsClient(studentCode, dateOfBirth)
	return await client.getActivity(options)
}
export async function getBehaviour(
	studentCode: string,
	dateOfBirth?: string,
	options?: GetBehaviourOptions
): Promise<BehaviourResponse> {
	const client = new ClasschartsClient(studentCode, dateOfBirth)
	return await client.getBehaviour(options)
}
export async function listHomeworks(
	studentCode: string,
	dateOfBirth?: string,
	options?: GetHomeworkOptions
): Promise<HomeworksResponse> {
	const client = new ClasschartsClient(studentCode, dateOfBirth)
	return await client.listHomeworks(options)
}
export async function getLessons(
	studentCode: string,
	dateOfBirth?: string,
	options?: GetLessonsOptions
): Promise<LessonsResponse> {
	const client = new ClasschartsClient(studentCode, dateOfBirth)
	return await client.getLessons(options)
}
