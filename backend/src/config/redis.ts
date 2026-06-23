import { createClient } from "redis"
import { env } from "../validators/env.validator.js";

export const client = createClient({
  url: env.REDIS_URL
});

client.on("connect", () => {
  console.log("Redis: Connecting to Upstash...");
});

client.on("ready", () => {
  console.log("Redis: Connected successfully! Server is ready");
});

client.on("error", function(err) {
  console.error("Redis Error: ",err)
});

client.on("end", () => {
  console.log("Redis: Connection closed.");
});


