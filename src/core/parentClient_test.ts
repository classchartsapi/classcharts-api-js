import { assertRejects } from "../../deps_dev.ts";
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
