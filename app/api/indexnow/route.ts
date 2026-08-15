import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { urlList, key } = await request.json();
    const host = "www.keralalotteryresultstoday.in";
    const indexNowKey = key || process.env.INDEXNOW_KEY || "keralalotteryindexnowkey";

    const payload = {
      host,
      key: indexNowKey,
      keyLocation: `https://${host}/${indexNowKey}.txt`,
      urlList: Array.isArray(urlList) ? urlList : [`https://${host}/`],
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
