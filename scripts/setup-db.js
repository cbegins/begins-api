const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read and execute SQL files
    const scriptsDir = path.join(__dirname, "..", "scripts")
    const sqlFiles = fs
      .readdirSync(scriptsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    for (const file of sqlFiles) {
      console.log(`Executing ${file}...`)
      const sql = fs.readFileSync(path.join(scriptsDir, file), "utf8")

      const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

      if (error) {
        console.error(`Error executing ${file}:`, error)
      } else {
        console.log(`✅ ${file} executed successfully`)
      }
    }

    console.log("Database setup completed!")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
