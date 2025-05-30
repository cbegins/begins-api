// Test script to verify the API endpoint works
async function testAPI() {
  const baseUrl = "https://api.begins.site"

  console.log("Testing Begins API...\n")

  // Test 1: Check if the root v1 endpoint works
  try {
    console.log("1. Testing GET /v1")
    const response = await fetch(`${baseUrl}/v1`)
    const data = await response.json()
    console.log("✅ Status:", response.status)
    console.log("✅ Response:", JSON.stringify(data, null, 2))
  } catch (error) {
    console.log("❌ Error:", error.message)
  }

  console.log("\n" + "=".repeat(50) + "\n")

  // Test 2: Check if the test endpoint works
  try {
    console.log("2. Testing GET /v1/test")
    const response = await fetch(`${baseUrl}/v1/test`)
    const data = await response.json()
    console.log("✅ Status:", response.status)
    console.log("✅ Response:", JSON.stringify(data, null, 2))
  } catch (error) {
    console.log("❌ Error:", error.message)
  }

  console.log("\n" + "=".repeat(50) + "\n")

  // Test 3: Test the chat endpoint with a sample request
  try {
    console.log("3. Testing POST /v1/chat")
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer begins_test_key_12345",
      },
      body: JSON.stringify({
        message: "Hello, this is a test message",
      }),
    })

    const data = await response.json()
    console.log("✅ Status:", response.status)
    console.log("✅ Response:", JSON.stringify(data, null, 2))

    if (response.status === 401) {
      console.log("ℹ️  Note: 401 is expected with test API key - this means routing is working!")
    }
  } catch (error) {
    console.log("❌ Error:", error.message)
  }
}

testAPI()
