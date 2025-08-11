import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return Response.json({ error: 'No database connection' }, { status: 500 })
    }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Get today's assessments with details
    const { data: todayData, error: todayError } = await supabaseAdmin
      .from('assessments')
      .select(`
        id,
        created_at,
        status,
        session_id,
        user_agent,
        ip_address,
        audio_duration_seconds,
        transcript,
        total_processing_seconds
      `)
      .gte('created_at', today)
      .order('created_at', { ascending: false })

    if (todayError) throw todayError

    // Get yesterday's assessments for comparison
    const { data: yesterdayData, error: yesterdayError } = await supabaseAdmin
      .from('assessments')
      .select('id, created_at, status, session_id')
      .gte('created_at', yesterday)
      .lt('created_at', today)
      .order('created_at', { ascending: false })

    if (yesterdayError) throw yesterdayError

    // Check for suspicious patterns
    const sessionIds = todayData?.map(a => a.session_id) || []
    const uniqueSessions = [...new Set(sessionIds)]
    const duplicateSessions = sessionIds.length - uniqueSessions.length

    // IP analysis
    const ipAddresses = todayData?.map(a => a.ip_address).filter(ip => ip) || []
    const uniqueIPs = [...new Set(ipAddresses)]

    // User agent analysis
    const userAgents = todayData?.map(a => a.user_agent).filter(ua => ua) || []
    const uniqueUserAgents = [...new Set(userAgents)]

    const analysis = {
      today: {
        date: today,
        total_assessments: todayData?.length || 0,
        unique_sessions: uniqueSessions.length,
        duplicate_sessions: duplicateSessions,
        unique_ips: uniqueIPs.length,
        unique_user_agents: uniqueUserAgents.length,
        status_breakdown: todayData?.reduce((acc: Record<string, number>, assessment) => {
          acc[assessment.status] = (acc[assessment.status] || 0) + 1
          return acc
        }, {}) || {},
        assessments: todayData?.map(a => ({
          id: a.id.substring(0, 8) + '...',
          created_at: a.created_at,
          status: a.status,
          session_id: a.session_id?.substring(0, 8) + '...',
          ip: a.ip_address?.substring(0, 10) + '...',
          audio_duration: a.audio_duration_seconds,
          has_transcript: !!a.transcript,
          processing_time: a.total_processing_seconds
        })) || []
      },
      yesterday: {
        date: yesterday,
        total_assessments: yesterdayData?.length || 0,
        sample: yesterdayData?.slice(0, 3).map(a => ({
          id: a.id.substring(0, 8) + '...',
          created_at: a.created_at,
          status: a.status
        })) || []
      }
    }

    return Response.json(analysis, { status: 200 })
  } catch (error) {
    console.error('Database debug error:', error)
    return Response.json({ 
      error: 'Failed to analyze database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}