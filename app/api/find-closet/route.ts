import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, requiredQuality = "HIGH" } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and Longitude are required" },
        { status: 400 }
      );
    }

    const apiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&requiredQuality=${requiredQuality}&key=AIzaSyB3BsorWnQtM0x28tGHfCEst2vqGtIDOBk`;

    const { data } = await axios.get(apiUrl);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch solar insights" },
      { status: 500 }
    );
  }
}
