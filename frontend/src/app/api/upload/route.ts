import { NextResponse } from "next/server";
import { pinata } from "@/utils/pinata";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const upload = await pinata.upload.json(data);
    return NextResponse.json(upload, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
