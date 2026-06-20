import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/user-service";

export const userRoute = new Elysia({ prefix: "/api" })
  .onError(({ code, set, path }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      if (path.endsWith("/login")) {
        return { data: "login gagal" };
      }
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
  )
  .post(
    "/users/login",
    async ({ body, set, cookie }) => {
      const { name, email } = body;
      const token = await loginUser(name, email);

      if (!token) {
        set.status = 400;
        return { data: "login gagal" };
      }

      // Set cookie and custom header with the session token
      cookie.session_token?.set({
        value: token,
        path: "/",
        httpOnly: true,
      });
      set.headers["X-Session-Token"] = token;

      return { data: "token berhasil dibuat" };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )
  .get(
    "/users/current",
    async ({ headers, set }) => {
      const authHeader = headers.authorization || headers["Authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { data: "Unauthorized" };
      }

      const token = authHeader.substring(7);
      const user = await getCurrentUser(token);

      if (!user) {
        set.status = 401;
        return { data: "Unauthorized" };
      }

      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_ad: user.createdAt,
        },
      };
    }
  );

