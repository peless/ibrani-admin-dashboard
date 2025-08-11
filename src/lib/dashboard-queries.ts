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
      avgProcessingTime: 0,
      medianProcessingTime: 0,
      slowAssessments: 0,
      failedAssessments: 0
    }
  }
  
  try {
    const lastSaturdayMorning = getLastSaturdayMorning()
    console.log('Filtering data from last Saturday morning:', lastSaturdayMorning)
    
    // Total assessments count (from last Saturday morning)
    const { count: totalAssessments, error: totalError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastSaturdayMorning)
    
    console.log('Total assessments query result:', { totalAssessments, totalError })
    if (totalError) throw totalError

    // Today's assessments
    const today = new Date().toISOString().split('T')[0]
    console.log('Querying today\'s assessments for date:', today)
    const { count: todayAssessments, error: todayError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)
    
    console.log('Today\'s assessments query result:', { todayAssessments, todayError })
    if (todayError) throw todayError

    // Success rate (completed vs total) from last Saturday morning
    const { count: completedAssessments, error: completedError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', lastSaturdayMorning)
    
    if (completedError) throw completedError

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

    // Calculate median processing time
    let medianProcessingTime = 0
    if (processingTimes.length > 0) {
      const sortedTimes = processingTimes
        .map(item => item.total_processing_seconds || 0)
        .sort((a, b) => a - b)
      
      const mid = Math.floor(sortedTimes.length / 2)
      medianProcessingTime = sortedTimes.length % 2 === 0
        ? (sortedTimes[mid - 1] + sortedTimes[mid]) / 2
        : sortedTimes[mid]
    }

    const successRate = totalAssessments && totalAssessments > 0 
      ? ((completedAssessments || 0) / totalAssessments * 100)
      : 0

    // Count slow assessments (>5 minutes = 300 seconds)
    const { count: slowAssessments, error: slowError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastSaturdayMorning)
      .gt('total_processing_seconds', 300)
    
    if (slowError) console.error('Slow assessments query error:', slowError)

    // Count failed/stuck assessments
    const { count: failedAssessments, error: failedError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastSaturdayMorning)
      .in('status', ['failed', 'processing'])
    
    if (failedError) console.error('Failed assessments query error:', failedError)

    return {
      totalAssessments: totalAssessments || 0,
      todayAssessments: todayAssessments || 0,
      successRate: Math.round(successRate * 10) / 10,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
      medianProcessingTime: Math.round(medianProcessingTime * 10) / 10,
      slowAssessments: slowAssessments || 0,
      failedAssessments: failedAssessments || 0
    }
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return {
      totalAssessments: 0,
      todayAssessments: 0,
      successRate: 0,
      avgProcessingTime: 0,
      medianProcessingTime: 0,
      slowAssessments: 0,
      failedAssessments: 0
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