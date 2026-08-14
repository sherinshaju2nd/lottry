async function testApi() {
  try {
    const res = await fetch("https://indialotteryapi.com/wp-json/klr/v1/latest");
    const json = await res.json();
    console.log("Keys in API response:", Object.keys(json));
    console.log("First key value:", json.first);
    console.log("Entire response excerpt:", JSON.stringify(json).slice(0, 1000));
  } catch (err) {
    console.error("Error fetching API:", err);
  }
}
testApi();
