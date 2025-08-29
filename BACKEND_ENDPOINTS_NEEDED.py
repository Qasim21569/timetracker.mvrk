# New Backend Endpoints for Dashboard Optimization

from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response

class DashboardStatsView(APIView):
    """
    Optimized endpoint for dashboard statistics
    Returns pre-calculated stats instead of raw data
    """
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        month_start = today.replace(day=1)
        week_start = today - timedelta(days=today.weekday())
        
        # Single database query with aggregation
        stats = HourEntry.objects.filter(
            user=user
        ).aggregate(
            today_hours=Sum('hours', filter=Q(date=today)),
            week_hours=Sum('hours', filter=Q(date__gte=week_start)),
            month_hours=Sum('hours', filter=Q(date__gte=month_start)),
            active_projects=Count('project', distinct=True, filter=Q(date__gte=month_start))
        )
        
        # Calculate additional stats
        working_days = HourEntry.objects.filter(
            user=user, 
            date__gte=month_start
        ).values('date').distinct().count()
        
        avg_hours_per_day = (stats['month_hours'] or 0) / max(working_days, 1)
        
        return Response({
            'todayHours': stats['today_hours'] or 0,
            'weekHours': stats['week_hours'] or 0,
            'monthHours': stats['month_hours'] or 0,
            'activeProjects': stats['active_projects'] or 0,
            'avgHoursPerDay': round(avg_hours_per_day, 1),
            'workingDaysThisMonth': working_days
        })

class DashboardChartDataView(APIView):
    """
    Optimized endpoint for chart data
    Returns chart-ready data structure
    """
    def get(self, request):
        user = request.user
        chart_type = request.GET.get('type', 'daily')
        month = request.GET.get('month', timezone.now().strftime('%Y-%m'))
        
        if chart_type == 'daily':
            return self.get_daily_chart_data(user, month)
        elif chart_type == 'projects':
            return self.get_project_chart_data(user, month)
    
    def get_daily_chart_data(self, user, month):
        # Parse month parameter
        year, month_num = map(int, month.split('-'))
        month_start = timezone.datetime(year, month_num, 1).date()
        
        if month_num == 12:
            month_end = timezone.datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            month_end = timezone.datetime(year, month_num + 1, 1).date() - timedelta(days=1)
        
        # Get daily totals
        daily_data = HourEntry.objects.filter(
            user=user,
            date__gte=month_start,
            date__lte=month_end
        ).values('date').annotate(
            hours=Sum('hours')
        ).order_by('date')
        
        # Create complete daily array (1-31)
        days_in_month = (month_end - month_start).days + 1
        daily_array = []
        
        daily_dict = {entry['date'].day: entry['hours'] for entry in daily_data}
        
        for day in range(1, days_in_month + 1):
            daily_array.append({
                'day': day,
                'hours': daily_dict.get(day, 0)
            })
        
        return Response(daily_array)
    
    def get_project_chart_data(self, user, month):
        # Parse month parameter
        year, month_num = map(int, month.split('-'))
        month_start = timezone.datetime(year, month_num, 1).date()
        
        if month_num == 12:
            month_end = timezone.datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            month_end = timezone.datetime(year, month_num + 1, 1).date() - timedelta(days=1)
        
        # Get project totals with names
        project_data = HourEntry.objects.filter(
            user=user,
            date__gte=month_start,
            date__lte=month_end
        ).values(
            'project__id',
            'project__name'
        ).annotate(
            hours=Sum('hours')
        ).filter(
            hours__gt=0
        ).order_by('-hours')
        
        chart_data = []
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
        
        for i, entry in enumerate(project_data):
            chart_data.append({
                'name': entry['project__name'],
                'hours': float(entry['hours']),
                'color': colors[i % len(colors)]
            })
        
        return Response(chart_data)

# URL Configuration to add:
# urls.py
"""
urlpatterns = [
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('api/dashboard/chart-data/', DashboardChartDataView.as_view(), name='dashboard-chart-data'),
]
"""
