import { assertEquals, assertExists } from "@std/assert";
import { parseCookies } from "./utils.ts";
Deno.test("Parses simple cookie", () => {
	const cookie =
		"testCookie=Hello%20world!; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/";
	const parsed = parseCookies(cookie);
	assertEquals(parsed.testCookie, "Hello world!");
});

Deno.test("Parses multiple cookies", () => {
	const cookies =
		"firstCookie=I'm%20the%20first%20cookie; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/, secondCookie=I'm%20the%20second%20cookie; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/";
	const parsed = parseCookies(cookies);
	assertEquals(parsed.firstCookie, "I'm the first cookie");
	assertEquals(parsed.secondCookie, "I'm the second cookie");
});

Deno.test("Parses cookie with no value", () => {
	const cookie =
		"cookieWithNoValue=; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/";
	const parsed = parseCookies(cookie);
	assertExists(parsed.cookieWithNoValue);
	assertEquals(parsed.cookieWithNoValue, "");
});
