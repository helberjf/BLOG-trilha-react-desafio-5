import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "prisma/config";

dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

function resolveDatasourceUrl() {
  const rawUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!rawUrl) return "postgresql://user:password@localhost:5432/entregador";

  try {
    const parsedUrl = new URL(rawUrl);
    parsedUrl.searchParams.delete("sslmode");
    return parsedUrl.toString();
  } catch {
    return rawUrl;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: resolveDatasourceUrl()
  }
});
