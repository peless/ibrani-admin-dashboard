import { getDashboardMetrics, getWeeklyTrends, getLastSaturdayMorningDate } from '@/lib/dashboard-queries'
import MetricCard from '@/components/MetricCard'
import { formatProcessingTime } from '@/utils/formatTime'
import { Users, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  console.log('DashboardPage rendering...')
  const [metrics, weeklyTrends] = await Promise.all([
    getDashboardMetrics(),
    getWeeklyTrends()
  ])
  console.log('Dashboard data:', { metrics, weeklyTrends })

  const lastSaturday = getLastSaturdayMorningDate()
  const lastUpdated = new Date()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ibrani Dashboard</h1>
          <p className="text-gray-600">Hebrew Assessment Platform Analytics (Updated)</p>
          
          {/* Date Range Indicator */}
          <div className="mt-3 flex items-center text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 w-fit">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              Data from {lastSaturday.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} onwards (rolling weekly view)
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Assessments"
            value={metrics.totalAssessments.toLocaleString()}
            icon={<Users size={24} />}
          />
          <MetricCard
            title="Today's Assessments"
            value={metrics.todayAssessments}
            icon={<TrendingUp size={24} />}
          />
          <MetricCard
            title="Success Rate"
            value={`${metrics.successRate}%`}
            icon={<CheckCircle size={24} />}
          />
          <MetricCard
            title="Avg Processing Time"
            value={formatProcessingTime(metrics.avgProcessingTime)}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-lg border p-6 shadow-sm mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity by Days</h3>
          {weeklyTrends.length > 0 ? (
            <div className="space-y-2">
              {weeklyTrends.map((day, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">{day.assessments} total</span>
                    <span className="text-green-600">{day.completed} completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available for the past week</p>
          )}
        </div>

        {/* Last Updated */}
        <div className="mt-8 flex justify-end">
          <p className="text-sm text-gray-500">
            Dashboard last updated: {lastUpdated.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric', 
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
