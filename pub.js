const videoTableBody = document.getElementById("videoTableBody");
const paginationDiv = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
let currentPage = 1; // Use let to allow reassignment
const pageSize = 10;


async function fetchPublicPosts(current) {
    try {
        const response = await fetch(`http://localhost:3000/public/posts?page=${current}&pageSize=${pageSize}`);
        const data = await response.json();
        if (response.ok) {
            if (data.paginationVideo && Array.isArray(data.paginationVideo)) {
                displayPosts(data.paginationVideo);
                updatePagination(current, data.totalPage);
            } else {
                console.error("No videos found in the response:", data);
            }
        } else {
            console.error("Failed to fetch posts:", data.message);
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

async function searchVideos(keyword, page = 1, pageSize = 10) {
    try {                               
        const response = await fetch(`http://localhost:3000/public/filterVideo?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`);
        const data = await response.json();
        console.log("Here is the Data=====",data);

        if (response.ok) {
            console.log("Filtered Videos:", data);
            if (data.paginatedBlog && Array.isArray(data.paginatedBlog)) {
                displayPosts(data.paginatedBlog);
                updatePagination(page, data.totalPages);
            } else {
                console.error("No videos found in the response:", data);
            }
        } else {
            console.error(`Error ${response.status}: ${data.message} || unknown error`, data.message);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}


//  display posts in a grid layout
function displayPosts(posts) {
    videoTableBody.innerHTML = "";
    posts.forEach(post => {
        // Create a parent div for the video item
        const videoItem = document.createElement("div");
        videoItem.classList.add("bg-white", "shadow-md", "rounded-lg", "p-4", "hover:shadow-lg", "transition-shadow", "flex", "flex-col", "items-start");

     
        const thumbnail = document.createElement("img");
        thumbnail.src = post.thumbnail; 
        thumbnail.width = 200;
        thumbnail.height = 150;
        thumbnail.classList.add("rounded-lg", "cursor-pointer");

        //ab jab thumnail pay click kryga to video source play hoga
        thumbnail.addEventListener("click", () => {
            const videoSrc = encodeURIComponent(post.filePath || "");
            const username = encodeURIComponent(post.user?.username || "Unknown");
            const title = encodeURIComponent(post.title || "No Title");
            const description = encodeURIComponent(post.description || "No Description"); 
            const views = encodeURIComponent(post.views || 0);
            const videoPostId = encodeURIComponent(post.id);
            const uploadDate = encodeURIComponent(post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Unknown Date");
            window.location.href = `videoplayer.html?videoSrc=${videoSrc}&uploaderName=${username}&title=${title}&description=${description}&views=${views}&uploadDate=${uploadDate}&videoPostId=${videoPostId}`;
        });

        
        const textContainer = document.createElement("div");
        textContainer.classList.add("mt-2"); 

       
        const title = document.createElement("h3");
        title.textContent = post.title || "No Title";
        title.classList.add("text-lg", "font-semibold", "mb-1");
        textContainer.appendChild(title);

        // Created At
        const createdAt = document.createElement("small");
        createdAt.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Unknown Date";
        createdAt.classList.add("text-gray-500", "block", "mb-1");
        textContainer.appendChild(createdAt);

        //video upload  Username
        if (post.user && post.user.username) {
            const username = document.createElement("small");
            username.textContent = `Uploaded by: ${post.user.username}`;
            username.classList.add("text-gray-700", "font-bold", "block", "mb-2");
            textContainer.appendChild(username);
        }

        // Append the text container to the video item
        videoItem.appendChild(thumbnail);
        videoItem.appendChild(textContainer);
        
        // Append the video item to the videoTableBody
        videoTableBody.appendChild(videoItem);
    });
}



function updatePagination(currentPage, totalPages) {
    paginationDiv.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? "active" : "";
        pageButton.addEventListener("click", () => {
            fetchPublicPosts(i);
        });
        paginationDiv.appendChild(pageButton);
    }
}

// Add event listener for search button
searchButton.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
        searchVideos(keyword, 1, pageSize); // first page of filtered results
    } else {
        fetchPublicPosts(currentPage); // Fetch all posts if no keyword
    }
});


fetchPublicPosts(currentPage);
 





 