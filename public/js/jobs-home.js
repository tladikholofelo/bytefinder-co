$(document).ready(function () {
    // Fetch the JSON data from a separate file (e.g., jobs.json)
    $.getJSON('jobs.json', function (data) {
        console.log(data); // Check if data is loaded correctly
        const jobListings = data.jobs;
        
        // Populate the location filter dropdown
        const locations = [...new Set(jobListings.map(job => job.location))];
        const locationFilter = $('#locationFilter');
        locations.forEach(location => {
            locationFilter.append(`<option value="${location}">${location}</option>`);
        });

        // Function to set the initial state of the bookmark button
        function setBookmarkButtonState(jobId) {
            const bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
            const bookmarkButton = $(`.bookmark-btn[data-jobid="${jobId}"]`);

            if (bookmarkedJobs.includes(jobId)) {
                // Job is bookmarked, so set the button as green
                bookmarkButton.removeClass('btn-primary').addClass('btn-success').text('Bookmarked');
            } else {
                // Job is not bookmarked, so set the button as blue
                bookmarkButton.removeClass('btn-success').addClass('btn-primary').text('Bookmark');
            }
        }

        // Function to update job listings based on search and filter criteria
        function updateJobListings() {
            const searchValue = $('#searchInput').val().toLowerCase();
            const locationValue = $('#locationFilter').val();
            
            const filteredJobs = jobListings.filter(job => {
                const titleMatch = job.title.toLowerCase().includes(searchValue);
                const companyMatch = job.company.toLowerCase().includes(searchValue);
                const locationMatch = !locationValue || job.location === locationValue;
                
                return titleMatch && companyMatch && locationMatch;
            });

            // Clear the existing job listings
            $('#jobListings').empty();

            // Populate the table with filtered job listings
            filteredJobs.forEach(job => {
                $('#jobListings').append(`
                    <tr>
                        <td>${job.title}</td>
                        <td>${job.company}</td>
                        <td>${job.location}</td>
                        <td>${job.salary}</td>
                        <td>${job.postedDate}</td>
                        <td><button class="btn btn-primary bookmark-btn" data-jobid="${job.id}">Bookmark</button></td>
                    </tr>
                `);
                
                // Set the initial state of the bookmark button for this job
                setBookmarkButtonState(job.id);
            });
            
            // After updating the job listings, set the bookmark button states for all jobs
            $('.bookmark-btn').each(function () {
                const jobId = $(this).data('jobid');
                setBookmarkButtonState(jobId);
            });
        }

        // Function to handle bookmarking a job
        function bookmarkJob(jobId) {
            // Implement the logic to bookmark the job (e.g., save it to user's profile or local storage)
            // You can use browser's localStorage to store bookmarked jobs
            // Example:
            const bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
            bookmarkedJobs.push(jobId);
            localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
        }

        // Initial job listings update
        updateJobListings();

        // Attach event listeners to input fields and filters
        $('#searchInput, #locationFilter').on('input change', updateJobListings);

        // Event listener for clicking the Bookmark button
        $('#jobListings').on('click', '.bookmark-btn', function () {
            const jobId = $(this).data('jobid');
            bookmarkJob(jobId);
            // Optionally, you can provide visual feedback to the user (e.g., change button color)
            $(this).removeClass('btn-primary').addClass('btn-success').text('Bookmarked');
        });

        // After the page loads, set the initial state of bookmark buttons for all jobs
        $('.bookmark-btn').each(function () {
            const jobId = $(this).data('jobid');
            setBookmarkButtonState(jobId);
        });

        // Function to toggle the bookmark state
        function toggleBookmark(jobId) {
            const bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];
            
            const index = bookmarkedJobs.indexOf(jobId);
            if (index === -1) {
                // Job is not bookmarked, so add it
                bookmarkedJobs.push(jobId);
            } else {
                // Job is bookmarked, so remove it
                bookmarkedJobs.splice(index, 1);
            }
            
            localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
        }

        // Click event handler for the bookmark button
        $('.bookmark-btn').click(function () {
            const jobId = $(this).data('job-id');
            
            // Toggle the bookmark state
            toggleBookmark(jobId);
            
            // Update the button's state
            setBookmarkButtonState(jobId);
        });

        // Function to clear all filters
        function clearFilters() {
            $('#searchInput').val(''); // Clear the search input field
            $('#locationFilter').val(''); // Clear the location filter dropdown
            updateJobListings(); // Update job listings after clearing filters
        }

        // Event listener for the "Clear Filters" button
        $('#clearFiltersButton').click(function () {
            clearFilters();
        });
    });
});
