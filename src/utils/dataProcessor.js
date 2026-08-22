import Papa from 'papaparse';

export const loadAndProcessData = async () => {
  return new Promise((resolve, reject) => {
    Papa.parse('/netflix_titles.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        resolve(processMetrics(data));
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const processMetrics = (data) => {
  // 1. Basic KPIs
  const totalTitles = data.length;
  const movies = data.filter(d => d.type === 'Movie').length;
  const tvShows = data.filter(d => d.type === 'TV Show').length;
  
  // 2. Process Years
  const validYears = data.map(d => parseInt(d.release_year)).filter(y => !isNaN(y));
  const avgYear = Math.round(validYears.reduce((a, b) => a + b, 0) / validYears.length);

  // 3. Process Countries
  const countryCounts = {};
  data.forEach(d => {
    if (d.country) {
      // Split by comma for multiple countries
      const countries = d.country.split(',').map(c => c.trim());
      countries.forEach(c => {
        if (c) {
          countryCounts[c] = (countryCounts[c] || 0) + 1;
        }
      });
    }
  });
  const totalCountries = Object.keys(countryCounts).length;
  
  // Format for Top 10 Countries Bar Chart
  const topCountries = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 4. Trend over Time (Added Year)
  const yearlyTrend = {};
  data.forEach(d => {
    if (d.date_added) {
      // Extract year from "Month DD, YYYY" format
      const yearMatch = d.date_added.match(/\d{4}/);
      if (yearMatch) {
        const year = yearMatch[0];
        yearlyTrend[year] = (yearlyTrend[year] || 0) + 1;
      }
    }
  });
  
  const trendData = Object.entries(yearlyTrend)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
    // Filter out obvious errors or too old data for the area chart
    .filter(d => parseInt(d.year) >= 2010);

  // 5. Movies vs TV Shows Donut
  const typeData = [
    { name: 'Movies', value: movies },
    { name: 'TV Shows', value: tvShows }
  ];

  // 6. Top Genres
  const genreCounts = {};
  data.forEach(d => {
    if (d.listed_in) {
      const genres = d.listed_in.split(',').map(g => g.trim());
      genres.forEach(g => {
        if (g) {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      });
    }
  });
  const topGenres = Object.entries(genreCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  const totalGenres = Object.keys(genreCounts).length;

  // 7. Ratings Distribution
  const ratingCounts = {};
  data.forEach(d => {
    if (d.rating) {
      const r = d.rating.trim();
      if (r && !r.includes('min') && !r.includes('Season')) { // Filter out bad data
        ratingCounts[r] = (ratingCounts[r] || 0) + 1;
      }
    }
  });
  const ratingsData = Object.entries(ratingCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 ratings

  // 8. Top Directors
  const directorCounts = {};
  data.forEach(d => {
    if (d.director) {
      const directors = d.director.split(',').map(dir => dir.trim());
      directors.forEach(dir => {
        if (dir) {
          directorCounts[dir] = (directorCounts[dir] || 0) + 1;
        }
      });
    }
  });
  const topDirectors = Object.entries(directorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    kpis: {
      totalTitles,
      movies,
      tvShows,
      totalCountries,
      avgYear,
      totalGenres
    },
    charts: {
      topCountries,
      trendData,
      typeData,
      topGenres,
      ratingsData,
      topDirectors
    }
  };
};
