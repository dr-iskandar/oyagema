'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiMusic, FiGrid, FiList } from 'react-icons/fi';
import Link from 'next/link';

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: string;
};

const StatCard = ({ title, value, icon: Icon, href, color }: StatCardProps) => {
  return (
    <Link 
      href={href}
      className={`bg-background-light/10 rounded-xl p-6 flex items-center transition-transform hover:scale-105 hover:shadow-lg`}
    >
      <div className={`p-4 rounded-full ${color} mr-4`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        <p className="text-text-primary text-2xl font-bold">{value}</p>
      </div>
    </Link>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    tracks: 0,
    categories: 0,
    playlists: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersRes = await fetch('/api/users/count');
        const usersData = await usersRes.json();
        
        // Fetch tracks count
        const tracksRes = await fetch('/api/tracks/count');
        const tracksData = await tracksRes.json();
        
        // Fetch categories count
        const categoriesRes = await fetch('/api/categories/count');
        const categoriesData = await categoriesRes.json();
        
        // Fetch playlists count
        const playlistsRes = await fetch('/api/playlists/count');
        const playlistsData = await playlistsRes.json();
        
        setStats({
          users: usersData.count,
          tracks: tracksData.count,
          categories: categoriesData.count,
          playlists: playlistsData.count,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use dummy data for now
        setStats({
          users: 42,
          tracks: 128,
          categories: 6,
          playlists: 24,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={FiUsers} 
          href="/admin/users" 
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Tracks" 
          value={stats.tracks} 
          icon={FiMusic} 
          href="/admin/tracks" 
          color="bg-purple-500"
        />
        <StatCard 
          title="Categories" 
          value={stats.categories} 
          icon={FiGrid} 
          href="/admin/categories" 
          color="bg-green-500"
        />
        <StatCard 
          title="Playlists" 
          value={stats.playlists} 
          icon={FiList} 
          href="/admin/playlists" 
          color="bg-amber-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-light/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Recent Tracks</h2>
          <p className="text-text-secondary">Loading recent tracks...</p>
        </div>
        
        <div className="bg-background-light/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Recent Users</h2>
          <p className="text-text-secondary">Loading recent users...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;