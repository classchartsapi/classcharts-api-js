import { assertEquals, assertRejects } from "@std/assert";
import { ParentClient } from "../core/parentClient.ts";

Deno.test("Throws when no email is provided", async () => {
	const client = new ParentClient("", "password");
	await assertRejects(
		async () => {
			await client.login();
		},
		Error,
		"Email not provided",
	);
});

Deno.test("Throws when no password is provided", async () => {
	const client = new ParentClient("email", "");
	await assertRejects(
		async () => {
			await client.login();
		},
		Error,
		"Password not provided",
	);
});

Deno.test("Throws with invalid username and password", async () => {
	const client = new ParentClient("invalid", "invalid");
	await assertRejects(
		async () => {
			await client.login();
		},
		Error,
		"Unauthenticated: ClassCharts didn't return authentication cookies",
	);
});

Deno.test("getHomeworksForPupil requests homework for provided pupil ID", async () => {
	const client = new ParentClient("email", "password");
	client.pupils = [{ id: 1 }, { id: 2 }] as never;
	client.studentId = 1;

	let requestedStudentId = 0;
	client.getHomeworks = async () => {
		requestedStudentId = client.studentId;
		return { success: 1, data: [], meta: {} } as never;
	};

	await client.getHomeworksForPupil(2);

	assertEquals(requestedStudentId, 2);
	assertEquals(client.studentId, 1);
});

Deno.test("getHomeworksForEachPupil requests homework for each attached pupil", async () => {
	const client = new ParentClient("email", "password");
	client.pupils = [{ id: 10 }, { id: 20 }, { id: 30 }] as never;
	client.studentId = 20;

	const requestedStudentIds: number[] = [];
	client.getHomeworks = async () => {
		requestedStudentIds.push(client.studentId);
		return { success: 1, data: [], meta: {} } as never;
	};

	const result = await client.getHomeworksForEachPupil();

	assertEquals(requestedStudentIds, [10, 20, 30]);
	assertEquals(Object.keys(result), ["10", "20", "30"]);
	assertEquals(client.studentId, 20);
});

Deno.test("getHomeworksForEachPupil rejects unknown pupil IDs", async () => {
	const client = new ParentClient("email", "password");
	client.pupils = [{ id: 1 }, { id: 2 }] as never;

	await assertRejects(
		async () => {
			await client.getHomeworksForEachPupil(undefined, [2, 99]);
		},
		Error,
		"No pupil with specified ID returned: 99",
	);
});
