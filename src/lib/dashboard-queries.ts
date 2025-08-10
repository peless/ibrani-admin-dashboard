import { supabaseAdmin } from './supabase'

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
    console.log('Querying assessments table for total count...')
    // Total assessments count
    const { count: totalAssessments, error: totalError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
    
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

    // Success rate (completed vs total)
    const { count: completedAssessments, error: completedError } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
    
    if (completedError) throw completedError

    // Average processing time
    const { data: processingTimes, error: processingError } = await supabaseAdmin
      .from('assessments')
      .select('total_processing_seconds')
      .not('total_processing_seconds', 'is', null)
      .limit(100)
    
    if (processingError) throw processingError

    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, item) => sum + (item.total_processing_seconds || 0), 0) / processingTimes.length
      : 0

    const successRate = totalAssessments && totalAssessments > 0 
      ? ((completedAssessments || 0) / totalAssessments * 100)
      : 0

    return {
      totalAssessments: totalAssessments || 0,
      todayAssessments: todayAssessments || 0,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10 // Round to 1 decimal
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
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('created_at, status')
      .gte('created_at', sevenDaysAgo.toISOString())
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