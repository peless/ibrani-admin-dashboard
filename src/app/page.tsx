import { getDashboardMetrics, getWeeklyTrends } from '@/lib/dashboard-queries'
import MetricCard from '@/components/MetricCard'
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  console.log('DashboardPage rendering...')
  const metrics = await getDashboardMetrics()
  const weeklyTrends = await getWeeklyTrends()
  console.log('Dashboard data:', { metrics, weeklyTrends })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ibrani Dashboard</h1>
          <p className="text-gray-600">Hebrew Assessment Platform Analytics</p>
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
            value={`${metrics.avgProcessingTime}s`}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Activity</h2>
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
            <p className="text-gray-500">No data available for the past week</p>
          )}
        </div>

        {/* Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <CheckCircle className="inline w-5 h-5 mr-2" />
            System Status: All services operational
          </p>
        </div>
      </div>
    </div>
  )
}
