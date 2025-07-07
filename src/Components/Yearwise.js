// Import necessary React hooks
import { useEffect, useState } from 'react';

// Import required components from Chart.js
import {
  Chart as ChartJS,
  CategoryScale, // For category-type X or Y axis
  LinearScale,   // For numeric scale
  BarElement,    // For creating bar charts
  Title,         // For adding chart title
  Tooltip,       // For showing data on hover
  Legend         // For displaying legend
} from 'chart.js';

// Import the Bar chart component from react-chartjs-2
import { Bar } from 'react-chartjs-2';

// Register the imported components to Chart.js so they can be used
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Chart options to configure the appearance and behavior of the chart
const options = {
  indexAxis: 'y', // Make the chart horizontal by using 'y' axis as index
  elements: {
    bar: {
      borderWidth: 2, // Set border width of bars
    },
  },
  responsive: true, // Make the chart responsive to container size
  plugins: {
    legend: {
      position: 'right', // Display legend on the right side
    },
    title: {
      display: true, // Show the title
      text: 'Total Generation & Growth Over the Years', // Title text
    },
  },
};

// Define the Horizontalchart component
const Horizontalchart = () => {

  // Define the year labels to display on the Y-axis
  const yearLabels = [
    '2012-13', '2013-14', '2014-15', '2015-16', '2016-17', '2017-18',
    '2018-19', '2019-20', '2020-21', '2021-22', '2022-23', '2023-24'
  ];

  // Initialize the chart data state with empty datasets
  const [data, setData] = useState({
    labels: yearLabels, // Predefined year labels
    datasets: [
      {
        label: 'Percentage Of Growth', // Label for the first dataset
        data: [], // Data will be fetched and filled here
        borderColor: 'rgb(255, 99, 132)', // Border color for bars
        backgroundColor: '#FFD700', // Gold color for bar fill
      },
      {
        label: 'Total Generation (BU)', // Label for the second dataset
        data: [], // Data will be fetched and filled here
        borderColor: 'rgb(53, 162, 235)', // Border color for bars
        backgroundColor: 'rgba(53, 162, 235, 0.5)', // Light blue color for bar fill
      },
    ],
  });

  // useEffect to fetch data when the component mounts
  useEffect(() => {
    // Async function to fetch data from API
    const fetchData = async () => {
      try {
        // API endpoint to fetch data
        const url = 'https://script.google.com/macros/s/AKfycbygurSv50sNgj5xQfUehrbbcTYItHZcH7SH2yzLi6qz9lXtqvn5zRenEid-Eg3OX1pLJQ/exec';
        
        // Fetch data from the API
        const response = await fetch(url);
        
        // Parse the response as JSON
        const result = await response.json();

        // Arrays to store fetched growth and generation values
        const growth = [];
        const generation = [];

        // Loop through the fetched data and push values to respective arrays
        for (const item of result.data) {
          growth.push(item.percentage_of_growth); // Push growth percentage
          generation.push(item.Total_Generation); // Push total generation
        }

        // Update the chart's data with the fetched values
        setData({
          labels: yearLabels, // Use predefined year labels
          datasets: [
            {
              label: 'Percentage Of Growth', // Dataset for growth percentage
              data: growth, // Fetched growth data
              borderColor: 'rgb(255, 99, 132)', // Border color
              backgroundColor: '#FFD700', // Bar color: gold
            },
            {
              label: 'Total Generation (BU)', // Dataset for total generation
              data: generation, // Fetched generation data
              borderColor: 'rgb(53, 162, 235)', // Border color
              backgroundColor: 'rgba(53, 162, 235, 0.5)', // Bar color: light blue
            },
          ],
        });
      } catch (error) {
        // If there's an error fetching data, log it to console
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchData function when the component loads
    fetchData();
  }, []); // Empty dependency array: runs only once on mount

  // Render the Bar chart
  return (
    <div style={{ backgroundColor: 'white', padding: '1rem' }}>
      <div style={{ width: '100%', height: '100%' }}>
        {/* Display the Bar chart using current data and options */}
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

// Export the component to use it elsewhere
export default Horizontalchart;
