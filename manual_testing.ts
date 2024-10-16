import { Initialize, FetchJSON } from "./src";

// Example function to test FetchJSON
async function testFetchJSON() {
    await Initialize({ verbose: true });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 1 second
    const ipfsHash = "bafybeigb57kvrkchoa5isat6iv7lkzvzdbnrzetcvqtv7acvyf2rxhptcy/548"; // Example IPFS hash

    try {
        const result = await FetchJSON(ipfsHash);
        console.log("FetchJSON result:", result);
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

// Call the test function
testFetchJSON().then(() => {
    console.log("Test completed");
});

// Keep the script running
setInterval(() => {}, 1000); // Run an empty function every second