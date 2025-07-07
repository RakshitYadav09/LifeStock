import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { getTasks, getSharedLists } from '../services/api';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    totalSharedLists: 0,
    activeCollaborations: 0,
    completionRate: 0,
    weeklyProgress: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [tasksResponse, sharedListsResponse] = await Promise.all([
          getTasks(),
          getSharedLists()
        ]);

        const tasks = tasksResponse.data;
        const sharedLists = sharedListsResponse.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const completedTasks = tasks.filter(task => task.completed).length;
        const overdueTasks = tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) < today
        ).length;
        const todayTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate < tomorrow;
        }).length;

        const activeCollaborations = sharedLists.filter(list => 
          list.collaborators && list.collaborators.length > 0
        ).length;

        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        // Calculate weekly progress (mock data for demo)
        const weeklyProgress = generateWeeklyProgress(tasks);

        setStats({
          totalTasks: tasks.length,
          completedTasks,
          overdueTasks,
          todayTasks,
          totalSharedLists: sharedLists.length,
          activeCollaborations,
          completionRate,
          weeklyProgress
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const generateWeeklyProgress = (tasks) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      // Mock completion data based on completed tasks
      const completedOnDay = Math.floor(Math.random() * 5) + 1;
      
      return {
        day,
        completed: completedOnDay,
        date: dayDate
      };
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: ClipboardList,
      color: 'primary',
      description: 'All your tasks'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'green',
      description: `${stats.completionRate}% completion rate`
    },
    {
      title: 'Due Today',
      value: stats.todayTasks,
      icon: Clock,
      color: 'orange',
      description: 'Tasks due today'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'red',
      description: 'Need attention'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return 'from-primary-400 to-primary-600';
      case 'green':
        return 'from-green-400 to-green-600';
      case 'orange':
        return 'from-orange-400 to-orange-600';
      case 'red':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="card hover:shadow-medium transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(stat.color)} rounded-xl flex items-center justify-center shadow-medium`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neutral-800">{stat.value}</div>
                <div className="text-sm text-neutral-600">{stat.title}</div>
              </div>
            </div>
            <p className="text-xs text-neutral-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Collaboration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Collaboration Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Shared Lists</span>
              <span className="font-medium text-neutral-800">{stats.totalSharedLists}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Active Collaborations</span>
              <span className="font-medium text-neutral-800">{stats.activeCollaborations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Completion Rate</span>
              <span className="font-medium text-neutral-800">{stats.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Weekly Progress</h3>
          <div className="flex items-end space-x-2 h-24">
            {stats.weeklyProgress.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-primary-400 to-primary-500 rounded-t min-h-2"
                  style={{ height: `${Math.max(day.completed * 8, 8)}px` }}
                ></div>
                <span className="text-xs text-neutral-600 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
