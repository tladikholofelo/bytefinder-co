$(document).ready(function () {
    console.log('bookmarkedJobs.js is running'); // Add this line for testing

    // Declare jobListings as a global variable to make it accessible in other functions
    let jobListings;

    // Function to fetch job details by ID
    function fetchJobDetailsById(id, jobListings) {
        if (id === null || id === undefined) {
            // Handle the case where id is null or undefined (e.g., skip it or return a default value)
            return null; // Change this based on your requirements
        }

        id = id.toString(); // Convert id to string to ensure type compatibility

        // Implement logic to find the job details from the jobListings data by job ID
        const jobDetails = jobListings.find(job => job.id === id);
        console.log('Fetched job details for ID', id, ':', jobDetails); // Add this line for testing
        return jobDetails;
    }

    // Function to display bookmarked jobs on the page
    function displayBookmarkedJobs() {
        const bookmarkedJobsContainer = $('#bookmarkedJobListings');
        const locationFilter = $('#locationFilter'); // Get the selected location filter value

        // Clear existing content
        bookmarkedJobsContainer.empty();

        // Retrieve bookmarked job IDs from local storage
        const bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];

        // Ensure unique job IDs in the bookmarkedJobs array
        const uniqueBookmarkedJobs = [...new Set(bookmarkedJobs)];

        // Iterate through unique bookmarked job IDs and display job details
        uniqueBookmarkedJobs.forEach(jobId => {
            const jobDetails = fetchJobDetailsById(jobId, jobListings);
            if (jobDetails) {
                // Check if the location matches the selected location filter
                if (
                    locationFilter.val() === '' || // Display all jobs when no location filter is selected
                    jobDetails.location === locationFilter.val()
                ) {
                    // Create a row for the job
                    const row = $('<tr></tr>');

                    // Create cells for job details
                    row.append(`<td>${jobDetails.title}</td>`);
                    row.append(`<td>${jobDetails.company}</td>`);
                    row.append(`<td>${jobDetails.location}</td>`);
                    row.append(`<td>${jobDetails.salary}</td>`);
                    row.append(`<td>${jobDetails.postedDate}</td>`);

                    // Create a cell for the "Delete" button
                    const deleteCell = $('<td></td>');
                    const deleteButton = $('<button class="btn btn-danger">Delete</button>');

                    // Add a click event listener to the "Delete" button
                    deleteButton.click(function () {
                        // Remove the job from local storage
                        const updatedBookmarkedJobs = uniqueBookmarkedJobs.filter(id => id !== jobId);
                        localStorage.setItem('bookmarkedJobs', JSON.stringify(updatedBookmarkedJobs));

                        // Remove the job row from the UI
                        row.remove();
                    });

                    // Append the "Delete" button to the cell and the cell to the row
                    deleteCell.append(deleteButton);
                    row.append(deleteCell);

                    // Append the row to the table
                    bookmarkedJobsContainer.append(row);
                }
            }
        });
    }

    // Function to populate the location filter dropdown
    function populateLocationFilter() {
        const locationFilter = $('#locationFilter');
        locationFilter.empty();

        // Retrieve bookmarked job IDs from local storage
        const bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];

        // Ensure unique job IDs in the bookmarkedJobs array
        const uniqueBookmarkedJobs = [...new Set(bookmarkedJobs)];

        // Create an object to store unique locations and their counts
        const locationCounts = {};

        // Iterate through unique bookmarked job IDs and gather location information
        uniqueBookmarkedJobs.forEach(jobId => {
            const jobDetails = fetchJobDetailsById(jobId, jobListings);
            if (jobDetails) {
                // Count the occurrence of each location
                if (jobDetails.location in locationCounts) {
                    locationCounts[jobDetails.location]++;
                } else {
                    locationCounts[jobDetails.location] = 1;
                }
            }
        });

        // Populate the location filter dropdown with options based on locationCounts
        locationFilter.append(`<option value="">All Locations</option>`);
        for (const location in locationCounts) {
            locationFilter.append(`<option value="${location}">${location} (${locationCounts[location]})</option>`);
        }

        // Event listener for the location filter change
        locationFilter.change(function () {
            displayBookmarkedJobs(); // Apply filters and display bookmarked jobs based on the selected location
        });
    }

    // Event listener for the filter form submission
    $('#filterForm').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        displayBookmarkedJobs(); // Apply filters and display bookmarked jobs
    });

    // Event listener for clicking the "Clear Filters" button
    $('#clearFiltersButton').click(function () {
        // Clear filter input fields and display all bookmarked jobs
        $('#searchInput').val('');
        $('#locationFilter').val('');
        displayBookmarkedJobs();
    });

    // Function to fetch job listings data and then populate the location filter
    function fetchJobListingsDataAndPopulateLocationFilter() {
        $.getJSON('jobs.json', function (data) {
            jobListings = data.jobs; // Assign the data to the jobListings variable
            console.log('Fetched job data:', jobListings); // Add this line for testing
            populateLocationFilter(); // Call the location filter population function once the data is available
            displayBookmarkedJobs(); // Call the display function once the data is available
        });
    }

    // Call the function to fetch job listings data and populate the location filter
    fetchJobListingsDataAndPopulateLocationFilter();
});
