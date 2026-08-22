import React, { useEffect, useState } from 'react';
import { Film, Tv, Globe, Clapperboard, Calendar, Library } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { loadAndProcessData } from './utils/dataProcessor';

// Vibrant multi-color palette for dark themes
const COLORS = [
  '#FF3366', // Vibrant Pink/Red
  '#00C3FF', // Neon Blue
  '#FF9933', // Orange
  '#20E253', // Neon Green
  '#8A2BE2', // Blue Violet
  '#FFD700', // Gold
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF4500', // Orange Red
  '#7CFC00', // Lawn Green
];

const KPICard = ({ title, value, icon: Icon }) => (
  <div className="kpi-card">
    <div className="kpi-title">
      <Icon size={18} color="#FF3366" />
      {title}
    </div>
    <div className="kpi-value">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAndProcessData()
      .then(processedData => {
        setData(processedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load Netflix dataset. Ensure netflix_titles.csv is in the public folder.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading Netflix Analytics...</div>;
  if (error) return <div className="loading">{error}</div>;

  const { kpis, charts } = data;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">NETFLIX ANALYTICS</h1>
        <div style={{ color: '#B3B3B3' }}>Executive Overview</div>
      </header>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <KPICard title="Total Titles" value={kpis.totalTitles} icon={Library} />
        <KPICard title="Total Movies" value={kpis.movies} icon={Film} />
        <KPICard title="Total TV Shows" value={kpis.tvShows} icon={Tv} />
        <KPICard title="Global Reach (Countries)" value={kpis.totalCountries} icon={Globe} />
        <KPICard title="Total Genres" value={kpis.totalGenres} icon={Clapperboard} />
        <KPICard title="Avg Release Year" value={kpis.avgYear} icon={Calendar} />
      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid">
        
        {/* Chart 1: Donut */}
        <div className="chart-container">
          <div className="chart-title"><Film size={20} color={COLORS[0]} /> Movies vs TV Shows</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.typeData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {charts.typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Area Trend */}
        <div className="chart-container">
          <div className="chart-title"><Calendar size={20} color={COLORS[1]} /> Content Added Over Time (Since 2010)</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="year" stroke="#B3B3B3" />
              <YAxis stroke="#B3B3B3" />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Titles Added" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Top Countries Bar */}
        <div className="chart-container">
          <div className="chart-title"><Globe size={20} color={COLORS[2]} /> Top 10 Contributing Countries</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.topCountries} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#B3B3B3" />
              <YAxis dataKey="name" type="category" stroke="#B3B3B3" width={100} />
              <Tooltip />
              <Bar dataKey="count" name="Titles" radius={[0, 4, 4, 0]}>
                {charts.topCountries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Top Genres Bar */}
        <div className="chart-container">
          <div className="chart-title"><Clapperboard size={20} color={COLORS[3]} /> Most Popular Genres</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.topGenres} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#B3B3B3" />
              <YAxis dataKey="name" type="category" stroke="#B3B3B3" width={120} />
              <Tooltip />
              <Bar dataKey="count" name="Titles" radius={[0, 4, 4, 0]}>
                {charts.topGenres.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5: Ratings Distribution */}
        <div className="chart-container">
          <div className="chart-title"><Library size={20} color={COLORS[4]} /> Content Rating Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.ratingsData} margin={{ top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#B3B3B3" />
              <YAxis stroke="#B3B3B3" />
              <Tooltip />
              <Bar dataKey="count" name="Titles" radius={[4, 4, 0, 0]}>
                {charts.ratingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 6: Top Directors */}
        <div className="chart-container">
          <div className="chart-title"><Film size={20} color={COLORS[5]} /> Top 10 Directors</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.topDirectors} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#B3B3B3" />
              <YAxis dataKey="name" type="category" stroke="#B3B3B3" width={120} />
              <Tooltip />
              <Bar dataKey="count" name="Titles" radius={[0, 4, 4, 0]}>
                {charts.topDirectors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 7) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default App;
