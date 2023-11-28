import { assertRejects } from "../../deps_dev.ts";
import { StudentClient } from "../core/studentClient.ts";

Deno.test("Throws when no student code is provided", async () => {
	const client = new StudentClient("");
	await assertRejects(
		async () => {
			await client.login();
		},
		Error,
		"Student Code not provided",
	);
});

Deno.test("Throws with invalid student code", async () => {
	const client = new StudentClient("invalid");
	await assertRejects(
		async () => {
			await client.login();
		},
		Error,
		"Unauthenticated: ClassCharts didn't return authentication cookies",
	);
});
