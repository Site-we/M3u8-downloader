addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get("url");

    if (!videoUrl || !videoUrl.includes("dailymotion.com/video/")) {
        return new Response(JSON.stringify({ error: "Invalid Dailymotion URL" }), {
            headers: { "Content-Type": "application/json" },
            status: 400
        });
    }

    try {
        // Fetch the Dailymotion page source
        const response = await fetch(videoUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        const html = await response.text();

        // Extract the M3U8 link from the page source
        const m3u8Match = html.match(/"url":"(https:\\/\\/[^"]+\\.m3u8)"/);

        if (m3u8Match) {
            let m3u8Url = m3u8Match[1].replace(/\\/g, ""); // Remove escape slashes

            return new Response(JSON.stringify({ m3u8: m3u8Url }), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ error: "M3U8 link not found" }), {
                headers: { "Content-Type": "application/json" },
                status: 404
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch video details", details: error.toString() }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
