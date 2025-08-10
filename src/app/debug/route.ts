import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
    },
    supabaseAdmin: !!supabaseAdmin,
    connectionTest: null as any,
    tableTest: null as any
  }

  if (supabaseAdmin) {
    try {
      // Test basic connection
      const { data, error } = await supabaseAdmin
        .from('assessments')
        .select('id')
        .limit(1)
      
      debug.connectionTest = {
        success: !error,
        error: error?.message,
        hasData: !!data?.length
      }

      // Try to get table schema info
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('assessments')
        .select('*')
        .limit(5)
      
      debug.tableTest = {
        success: !tableError,
        error: tableError?.message,
        rowCount: tableData?.length || 0,
        sampleData: tableData?.slice(0, 2) // Just first 2 rows for debugging
      }
    } catch (error) {
      debug.connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  return Response.json(debug, { status: 200 })
}