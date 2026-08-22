import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { Client } from "pg"

const MIGRATIONS = [
  "0001_clinician_patient_messages.sql",
  "0002_ihealth_clinician_platform.sql",
]

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  const ref = url.match(/https:\/\/([^.]+)/)?.[1] ?? ""
  const password =
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    process.env.POSTGRES_PASSWORD?.trim() ||
    ""

  if (!ref || !password) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in environment."
    )
  }

  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  try {
    for (const file of MIGRATIONS) {
      const migrationSql = readFileSync(
        resolve(process.cwd(), "database", file),
        "utf8"
      )
      console.log(`Applying ${file}...`)
      await client.query(migrationSql)
    }
    console.log("All iHealth migrations applied.")
  } finally {
    await client.end()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
