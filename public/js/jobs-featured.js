document.addEventListener('DOMContentLoaded', function () {
    const featuredJobsContainer = document.getElementById('featuredJobsContainer');

    // Fetch job data from JSON file
    fetch('featured.json')
        .then(response => response.json())
        .then(jobs => {
            // Calculate days ago for each job
            const currentDate = new Date(); // Get the current date once for efficiency
            jobs.forEach(job => {
                const postedDate = new Date(job.postedDate);

                // Calculate the difference in milliseconds
                const timeDifference = currentDate - postedDate;

                // Convert milliseconds to days
                const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

                // Add the calculated daysAgo to the job object
                job.daysAgo = daysAgo;
            });

            // Populate unique locations for filtering
            const uniqueLocations = [...new Set(jobs.map(job => job.location))];
            const filterLocation = document.getElementById('filterLocation');

            uniqueLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                filterLocation.appendChild(option);
            });

            // Function to render jobs based on filters
            function renderJobs() {
                const searchInput = document.getElementById('searchInput').value.toLowerCase();
                const selectedLocation = document.getElementById('filterLocation').value.toLowerCase();

                // Clear previous job cards
                featuredJobsContainer.innerHTML = '';

                jobs.forEach(job => {
                    const title = job.title.toLowerCase();
                    const company = job.company.toLowerCase();
                    const location = job.location.toLowerCase();

                    if (
                        (title.includes(searchInput) || company.includes(searchInput) || location.includes(searchInput)) &&
                        (selectedLocation === '' || location === selectedLocation)
                    ) {
                        const jobCard = document.createElement('div');
                        jobCard.classList.add('col-md-4', 'mb-4');

                        jobCard.innerHTML = `
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${job.title}</h5>
                                    <p class="card-text">${job.company}</p>
                                    <p class="card-text">${job.location}</p>
                                    <p class="card-text card-text-salary">${job.salary}</p>
                                    <ul class="card-text card-text-requirements">
                                        ${job.requirements.map(requirement => `<li>${requirement}</li>`).join('')}
                                    </ul>
                                    <p class="card-text card-text-posted">Posted ${job.daysAgo} days ago</p>
                                    <a href="#" class="btn btn-primary">Apply Now</a>
                                </div>
                            </div>
                        `;

                        featuredJobsContainer.appendChild(jobCard);
                    }
                });
            }

            // Initial render
            renderJobs();

            // Attach event listeners for input changes
            document.getElementById('searchInput').addEventListener('input', renderJobs);
            document.getElementById('filterLocation').addEventListener('change', renderJobs);

            // Clear Filters button event listener
            document.getElementById('clearFiltersBtn').addEventListener('click', function () {
                document.getElementById('searchInput').value = '';
                document.getElementById('filterLocation').value = '';
                renderJobs();
            });
        })
        .catch(error => console.error('Error fetching job data:', error));
});
