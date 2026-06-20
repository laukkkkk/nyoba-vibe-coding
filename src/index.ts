import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => "API is running")
  .get("/users", async () => {
    try {
      // Test query ke database, dibungkus try/catch agar tidak crash jika DB belum running/dikonfigurasi
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      return { 
        status: "error", 
        message: "Database query failed. Make sure your MySQL server is running and credentials in .env are correct.", 
        details: String(error) 
      };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
