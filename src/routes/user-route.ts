import { Elysia, t } from "elysia";
import { registerUser } from "../services/user-service";

export const userRoute = new Elysia({ prefix: "/api" })
  .onError(({ code, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { data: "user gagal dibuat" };
    }
  })
  .post(
    "/users",
    async ({ body, set }) => {
      const { name, email, password } = body;
      const success = await registerUser(name, email, password);

      if (!success) {
        set.status = 400;
        return { data: "user gagal dibuat" };
      }

      set.status = 201;
      return { data: "user berhasil dibuat" };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  );
