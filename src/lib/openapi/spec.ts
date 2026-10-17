/** Minimal OpenAPI 3 spec — hot paths only, not every admin route. */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SqftGo API",
    version: "0.1.0",
    description:
      "Minimal contract for the main marketplace routes. Auth is a Bearer access token (mobile) or the site session cookie (web). This is not a full catalog of admin routes.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Properties" },
    { name: "Inquiries" },
    { name: "Favorites" },
    { name: "Dealers" },
    { name: "Locations" },
  ],
  components: {
    securitySchemes: {
      bearer: { type: "http", scheme: "bearer" },
      cookie: { type: "apiKey", in: "cookie", name: "sb-access-token" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Ping the app and Supabase",
        description:
          "Runs a one-row read so the Free-plan database does not pause (pause is 7 days of inactivity). Called daily by CI.",
        responses: {
          "200": { description: "Database is up" },
          "503": { description: "Database or config is down", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/openapi": {
      get: {
        tags: ["Health"],
        summary: "This OpenAPI document as JSON",
        responses: { "200": { description: "OpenAPI JSON" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Email and password login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Session payload (role, profile, access token when issued)" },
          "401": { description: "Bad credentials" },
          "429": { description: "Rate limited" },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Account created" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "End the current session",
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user profile",
        security: [{ bearer: [] }, { cookie: [] }],
        responses: {
          "200": { description: "Profile" },
          "401": { description: "Not signed in" },
        },
      },
    },
    "/api/properties": {
      get: {
        tags: ["Properties"],
        summary: "List properties",
        parameters: [
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "purpose", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
          { name: "mine", in: "query", schema: { type: "string" }, description: "1 = caller’s listings (auth)" },
        ],
        responses: { "200": { description: "Paginated properties" } },
      },
      post: {
        tags: ["Properties"],
        summary: "Create a listing",
        security: [{ bearer: [] }, { cookie: [] }],
        responses: {
          "200": { description: "Created" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/properties/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Property detail",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Property" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/inquiries": {
      post: {
        tags: ["Inquiries"],
        summary: "Send a property inquiry",
        security: [{ bearer: [] }, { cookie: [] }],
        responses: {
          "200": { description: "Inquiry stored" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "List the signed-in user’s favorites",
        security: [{ bearer: [] }, { cookie: [] }],
        responses: { "200": { description: "Favorites" }, "401": { description: "Unauthorized" } },
      },
      post: {
        tags: ["Favorites"],
        summary: "Save a property",
        security: [{ bearer: [] }, { cookie: [] }],
        responses: { "200": { description: "Saved" } },
      },
    },
    "/api/dealers": {
      get: {
        tags: ["Dealers"],
        summary: "Public dealer directory",
        responses: { "200": { description: "Dealers" } },
      },
    },
    "/api/locations": {
      get: {
        tags: ["Locations"],
        summary: "Active cities",
        responses: { "200": { description: "Locations" } },
      },
    },
  },
};
