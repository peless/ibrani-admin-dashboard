import { supabaseAdmin } from './supabase'

// Get last Saturday morning (start of week for dashboard data)
function getLastSaturdayMorning(): string {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysToSubtract = dayOfWeek === 6 ? 0 : (dayOfWeek + 1) // If today is Saturday, use today; otherwise go back to last Saturday
  
  const lastSaturday = new Date(now)
  lastSaturday.setDate(now.getDate() - daysToSubtract)
  lastSaturday.setHours(8, 0, 0, 0) // 8 AM Saturday morning
  
  return lastSaturday.toISOString()
}

// Get last Saturday morning as Date object for display
export function getLastSaturdayMorningDate(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysToSubtract = dayOfWeek === 6 ? 0 : (dayOfWeek + 1)
  
  const lastSaturday = new Date(now)
  lastSaturday.setDate(now.getDate() - daysToSubtract)
  lastSaturday.setHours(8, 0, 0, 0)
  
  return lastSaturday
}

export async function getDashboardMetrics() {
  console.log('getDashboardMetrics called')
  console.log('Environment variables:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })
  
  if (!supabaseAdmin) {
    console.error('Supabase admin client not initialized - environment variables missing')
    return {
      totalAssessments: 0,
      todayAssessments: 0,
      successRate: 0,
      avgProcessingTime: 0
    }
  }
  
  try {
    const lastSaturdayMorning = getLastSaturdayMorning()
    console.log('Filtering data from last Saturday morning:', lastSaturdayMorning)
    
    // Total user sessions count (from last Saturday morning) - count unique session_ids
    const { data: totalSessionsData, error: totalError } = await supabaseAdmin
      .from('assessments')
      .select('session_id')
      .gte('created_at', lastSaturdayMorning)
    
    const totalUserSessions = totalSessionsData ? [...new Set(totalSessionsData.map(a => a.session_id))].length : 0
    console.log('Total user sessions query result:', { totalUserSessions, totalError })
    if (totalError) throw totalError

    // Today's user sessions - count unique session_ids for today
    const today = new Date().toISOString().split('T')[0]
    console.log('Querying today\'s user sessions for date:', today)
    const { data: todaySessionsData, error: todayError } = await supabaseAdmin
      .from('assessments')
      .select('session_id')
      .gte('created_at', today)
    
    const todayUserSessions = todaySessionsData ? [...new Set(todaySessionsData.map(a => a.session_id))].length : 0
    console.log('Today\'s user sessions query result:', { todayUserSessions, todayError })
    if (todayError) throw todayError

    // Success rate (completed sessions vs total sessions) from last Saturday morning
    const { data: completedSessionsData, error: completedError } = await supabaseAdmin
      .from('assessments')
      .select('session_id, status')
      .gte('created_at', lastSaturdayMorning)
    
    if (completedError) throw completedError
    
    // Count unique sessions that have at least one completed assessment
    const completedSessionIds = completedSessionsData
      ?.filter(a => a.status === 'completed')
      .map(a => a.session_id) || []
    const completedUserSessions = [...new Set(completedSessionIds)].length

    // Processing times (from last Saturday morning, all data for accurate metrics)
    const { data: processingTimes, error: processingError } = await supabaseAdmin
      .from('assessments')
      .select('total_processing_seconds')
      .not('total_processing_seconds', 'is', null)
      .gte('created_at', lastSaturdayMorning)
    
    if (processingError) throw processingError

    // Calculate average processing time
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, item) => sum + (item.total_processing_seconds || 0), 0) / processingTimes.length
      : 0

    const successRate = totalUserSessions && totalUserSessions > 0 
      ? (completedUserSessions / totalUserSessions * 100)
      : 0

    return {
      totalAssessments: totalUserSessions,
      todayAssessments: todayUserSessions,
      successRate: Math.round(successRate * 10) / 10,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10
    }
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return {
      totalAssessments: 0,
      todayAssessments: 0,
      successRate: 0,
      avgProcessingTime: 0
    }
  }
}


export async function getWeeklyTrends() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not initialized')
    return []
  }
  
  try {
    const lastSaturdayMorning = getLastSaturdayMorning()
    
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('created_at, status')
      .gte('created_at', lastSaturdayMorning)
      .order('created_at', { ascending: true })
    
    if (error) throw error

    // Group by day
    const dailyData: Record<string, { date: string; assessments: number; completed: number }> = {}
    
    data?.forEach(assessment => {
      const date = assessment.created_at.split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { date, assessments: 0, completed: 0 }
      }
      dailyData[date].assessments++
      if (assessment.status === 'completed') {
        dailyData[date].completed++
      }
    })
    
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Weekly trends error:', error)
    return []
  }
}