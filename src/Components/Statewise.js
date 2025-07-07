// Import React hooks
import { useEffect, useState } from 'react';

// Import necessary Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,  // For category labels on Y-axis
  LinearScale,    // For numerical values on X-axis
  BarElement,     // For drawing bars
  Title,          // For chart title
  Tooltip,        // For tooltips on hover
  Legend          // For chart legend
} from 'chart.js';

// Import Bar chart component for React
import { Bar } from 'react-chartjs-2';

// Register chart components to Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Chart configuration options
const options = {
  indexAxis: 'y', // Makes the bar chart horizontal
  scales: {
    x: {
      min: 0,         // Minimum x-axis value
      max: 450000,    // Maximum x-axis value
    },
  },
  elements: {
    bar: { borderWidth: 2 }, // Bar border thickness
  },
  responsive: true, // Chart automatically adjusts to screen size
  plugins: {
    legend: { position: 'right' }, // Legend appears on the right side
    title: { display: true, text: 'State Wise Display' }, // Chart title
  },
};

// Predefined labels for all states and regions (used on Y-axis)
const stateLabels = [
  'Chandigarh', 'Delhi', 'Haryana', 'Himachal Pradesh', 'J&K', 'Punjab',
  'Rajasthan', 'Uttar Pradesh', 'Uttrakhand', 'Northern Region', 'Chattisgarh',
  'Gujarat', 'Madhya Pradesh', 'Maharashtra', 'Daman & Diu', 'Goa', 'Western Region',
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Puducherry',
  'Lakshwadeep', 'Southern Region', 'Bihar', 'DVC', 'Jharkhand', 'Odisha',
  'West Bengal', 'Sikkim', 'Andaman & Nicobar', 'Eastern Region', 'Arunachal Pradesh',
  'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Nort Eastern Region'
];

// SWG component (State-Wise Graph)
const SWG = () => {

  // State to hold chart data (initially empty datasets)
  const [data, setData] = useState({
    labels: stateLabels, // Y-axis labels
    datasets: [
      {
        label: 'Energy Required State-Wise (MU)', // First dataset label
        data: [], // Initially empty (will be filled after API fetch)
        borderColor: 'blue', // Bar border color
        backgroundColor: '#1E90FF', // Bar fill color
      },
      {
        label: 'Energy Supplied State-Wise (MU)', // Second dataset label
        data: [], // Initially empty (will be filled after API fetch)
        borderColor: 'rgb(53, 162, 235)', // Bar border color
        backgroundColor: 'rgba(53, 235, 0.5)', // Bar fill color
      },
    ],
  });

  // Fetch data from API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // API URL to fetch state-wise data
        const url = 'https://script.google.com/macros/s/AKfycbzIn-T8v0E9F0Tzeu1tgNB992LhaWskEucxLb01bGiggiZoO--GLFQai3Q9B_jdZ3Dt5g/exec';
        const response = await fetch(url);

        // If API request fails, throw an error
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Parse API response as JSON
        const result = await response.json();

        // Remove the last element (probably unwanted summary row)
        let fetchedData = result.data.slice(0, -1);

        // Extract 'Energy_Required' for all states
        const energyRequired = fetchedData.map(item => item.Energy_Required);

        // Extract 'Energy_Supplied' for all states
        const energySupplied = fetchedData.map(item => item.Energy_Supplied);

        // Update chart data with fetched values
        setData({
          labels: stateLabels, // Use predefined labels
          datasets: [
            {
              label: 'Energy Required State-Wise (MU)', // Updated dataset label
              data: energyRequired, // Fill with fetched data
              borderColor: 'blue', // Bar border color
              backgroundColor: '#1E90FF', // Bar fill color
            },
            {
              label: 'Energy Supplied State-Wise (MU)', // Updated dataset label
              data: energySupplied, // Fill with fetched data
              borderColor: 'rgb(53, 162, 235)', // Bar border color
              backgroundColor: 'rgba(53, 235, 0.5)', // Bar fill color
            },
          ],
        });
      } catch (error) {
        // Log any fetch errors to console
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchData function
    fetchData();
  }, []); // Empty dependency array: Runs only once when component mounts

  // Render the chart
  return (
    <div style={{ backgroundColor: 'white' }}>
      <div style={{ width: '100%', height: '100%' }}>
        {/* Render the Bar chart with current data and chart options */}
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

// Export the component to use it in other files
export default SWG;
