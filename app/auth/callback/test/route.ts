import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  return NextResponse.json({
    message: 'Auth callback test endpoint',
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  })
}