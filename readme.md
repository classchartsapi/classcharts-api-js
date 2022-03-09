# Classcharts API

A very WIP client for the classcharts API

[Documentation](https://jamesatjaminit.github.io/classcharts-api/index.html)

# Examples

```typescript
import { ClasschartsClient } from "classcharts-api";
async function main() {
  const client = new ClasschartsClient("classchartsCode", "01/1/2000");
  await client.init();
  console.log(
    await client.getBehaviour({
      from: "2020-12-23",
      to: "2022-03-09",
    })
  );
  console.log(await client.getActivity());
  console.log(await client.getStudentInfo());
  console.log(await client.getActivity());
  console.log(await client.getActivity());
}

main();
```
