document.addEventListener('DOMContentLoaded', () => {
    const videoTableBody = document.getElementById('videoTableBody');
    const createPostBtn = document.getElementById('createPostBtn');

    const logoutBtn = document.getElementById('logoutBtn');
    const modal = document.getElementById('modal');
    const videoForm = document.getElementById('videoForm');
    const updateModal = document.getElementById('updateModal');
    const updateVideoForm = document.getElementById('updateVideoForm');
    const paginationContainer = document.getElementById('paginationContainer');
    let selectedVideoId = null;
    let currentPage = 1; // Track the current page
    let allVideosComments = {};

    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }

    // Fetch user posts
    const fetchUserPosts = async (page = 1) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/admin/posts/user?page=${page}&pageSize=10`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            console.log(result)

            if (response.ok) {
                const videos = result.posts || [];
                if (Array.isArray(videos) && videos.length > 0) {
                    const videosComments = await Promise.all(
                        videos.map(async (video) => {
                            try {
                                const commentsResponse = await fetch(`http://localhost:3000/admin/post/${video.id}/comments`, {
                                    method: 'GET',
                                    headers: {
                                        'authorization': `Bearer ${token}`
                                    }
                                });
                                const commentsResult = await commentsResponse.json();
                                const comments = commentsResult.comments || [];
                                console.log(comments)
                                allVideosComments[video.id] = comments;
                                return { ...video, comments };
                            } catch (error) {
                                console.log("ERROR ===== ", error);
                                return { ...video, comments: [] };
                        }
                        })
                    );

                    updateVideoTable(videosComments); 
                    updatePagination(result.totalPage); 
                } else {
                    alert('No videos found or invalid data.');
                }
            } else {
                alert('Failed to fetch posts.');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const updateVideoTable = (videos) => {
        if (videos.length === 0) {
            videoTableBody.innerHTML = '<tr><td colspan="4">No videos found</td></tr>'; // YE CHEK KRYGA KE VIDEO ERRAY MAY HAY YA NULL HAY Change colspan to match the number of columns
        } else {
            videoTableBody.innerHTML = '';
            videos.forEach((video) => {
                const row = document.createElement('tr');
                row.innerHTML = `
<td>
  <img src="${video.thumbnail}" alt="${video.title} Thumbnail" class="w-24 h-auto"> <!-- Display Thumbnail -->
</td>
<td class="px-2 py-1 text-gray-800 font-semibold text-sm md:text-base lg:text-lg">${video.title}</td>
<td class="px-2 py-1 text-gray-600 text-xs md:text-sm lg:text-base">${new Date(video.createdAt).toLocaleDateString()}</td>
<td class="px-2 py-1 flex flex-wrap gap-2 justify-start">
  <button onclick="deleteVideo('${video.id}')" class="bg-red-500 text-white w-32 h-10 rounded hover:bg-red-600 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
    Delete
  </button>
  <button onclick="openUpdateModal('${video.id}', '${video.title}', '${video.body}')" class="bg-blue-500 text-white w-32 h-10 rounded hover:bg-blue-600 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
    Update
  </button>
  <button onclick="fetchComments('${video.id}')" class="bg-gray-300 text-gray-700 w-32 h-10 rounded hover:bg-gray-400 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
    Comments
  </button>
  <button onclick="fetchPostViews('${video.id}')" class="bg-yellow-500 text-white w-32 h-10 rounded hover:bg-yellow-600 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
    View Post
  </button>
  <button onclick="fetchPostLikes('${video.id}')" class="bg-green-500 text-white w-32 h-10 rounded hover:bg-green-600 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
    Like
  </button>
  <button onclick="fetchPostDislikes('${video.id}')" class="bg-indigo-500 text-white w-32 h-10 rounded hover:bg-indigo-600 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
    Dislike
  </button>
</td>



                `;
                videoTableBody.appendChild(row);//NEW ROW KELIYE YE USE HOGA
            });
        }
    };
    
    
   
    const updatePagination = (totalPages) => {
        paginationContainer.innerHTML = ''; // Clear previous pagination
        const paginationWrapper = document.createElement('div');
        paginationWrapper.classList.add('flex', 'flex-wrap', 'justify-center', 'space-x-2', 'py-4'); // Flex container for buttons
    
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.classList.add('pagination-btn', 
                'bg-gray-300', 
                'text-gray-700', 
                'px-4', 
                'py-2', 
                'rounded', 
                'hover:bg-gray-400', // Background color on hover
                'focus:outline-none', // Remove default outline on focus
                'focus:ring', // Focus ring effect
                'focus:ring-gray-500', // Ring color on focus
                'transition', // Smooth transition for hover/focus
                'duration-200', 
                'text-sm', 
                'md:text-base'
            );
    
            // Add 'active' class for the current page button
            if (i === currentPage) {
                pageBtn.classList.add('bg-blue-500', 'text-white'); // Active button style
            }
    
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                console.log(currentPage);
                fetchUserPosts(i); 
                updatePagination(totalPages); 
            });
    
            paginationWrapper.appendChild(pageBtn);
        }
    
        paginationContainer.appendChild(paginationWrapper);
    };
    
    
    // Handle upload form submission
    videoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoBody').value;
        const videoFile = document.getElementById('videoFile').files[0];
        const thumbnailFile = document.getElementById('thumbnailFile').files[0];
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', description);
        formData.append('video', videoFile);
        formData.append('thumbnail', thumbnailFile);
        
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/admin/createpost', {
                method: 'POST',
                headers: { 'authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('Video uploaded successfully!');
                fetchUserPosts(currentPage);
                videoForm.reset();
                modal.style.display = 'none';
            } else {
                const errorData = await response.json();
                alert(errorData.message);
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error occurred while uploading video.');
        }
    });
    document.getElementById('closeCreateModal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    createPostBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    

    
    const commentsModal = document.getElementById('commentsModal');
    const commentsContainer = document.getElementById('commentsContainer');
    
    
    window.fetchComments = (videoId) => {
        const comments = allVideosComments[videoId] || [];
        displayComments(comments);
        toggleCommentsModal();
    };
    
    // Function to display comments in the comments modal
    const displayComments = (comments) => {
        commentsContainer.innerHTML = ''; // Clear previous comments
        console.log(comments)
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>No comments found.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.innerHTML = `
                <p><strong>${comment.user}</strong>: ${comment.comments}</p>
                <p><small>${new Date(comment.createdAt).toLocaleDateString()}</small></p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    };
    
    // Toggle modal visibility for Comments
    const toggleCommentsModal = () => {
        commentsModal.style.display = commentsModal.style.display === 'block' ? 'none' : 'block';
    };
    
   
    function closeCommentsModal() {
        const modal = document.getElementById('commentsModal');
        modal.style.display = 'none'; // Hide the modal
    }

  
    const closeSpan = document.getElementById('closeCommentsModal');
    const closeButton = document.getElementById('closeCommentsButton');

    
    closeSpan.addEventListener('click', closeCommentsModal);
    closeButton.addEventListener('click', closeCommentsModal);

    
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('commentsModal');
        if (event.target === modal) {
            closeCommentsModal();
        }
    });

    // Delete video
    window.deleteVideo = async (videoId) => {
        const confirmation = confirm('Are you sure you want to delete this video?');
        if (!confirmation) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/admin/deletepost/${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Video deleted successfully!');
                fetchUserPosts(currentPage); 
            } else {
                alert('Failed to delete video.');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error occurred while deleting video.');
        }
    };

    // Toggle  for Create Video
    const toggleModal = () => {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    };

    
    const toggleUpdateModal = () => {
        updateModal.style.display = updateModal.style.display === 'block' ? 'none' : 'block';
    };

    // update form keliye 
    window.openUpdateModal = (id, title, body) => {
        document.getElementById('updateVideoTitle').value = title;
        document.getElementById('updateVideoBody').value = body;
        selectedVideoId = id;
        toggleUpdateModal();
    };

    // Handle update form submission
    updateVideoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('updateVideoTitle').value;
        const description = document.getElementById('updateVideoBody').value;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/admin/updatepost/${selectedVideoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, body: description })
            });

            if (response.ok) {
                alert('Video updated successfully!');
                fetchUserPosts(currentPage); 
                toggleUpdateModal(); 
            } else {
                alert('Failed to update video.');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            alert('Error occurred while updating video.');
        }
    });
   // Add Post View Fetching Function
   window.fetchPostViews = async (postId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/admin/post/${postId}/postviews`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('postViewsContent').textContent = `View count: ${result.views}`;
            togglePostViewsModal(true);
        } else {
            console.error('Server response error:', result);
            alert(result.message || 'Failed to fetch post views.');
        }
    } catch (error) {
        console.error('Error fetching post views:', error);
        alert('An error occurred while fetching post views.');
    }
};

  
  
  const togglePostViewsModal = (show) => {
    const postViewsModal = document.getElementById('postViewsModal');
    postViewsModal.style.display = show ? 'block' : 'none';
  };
  

  document.getElementById('closePostViewsModal').addEventListener('click', () => {
    togglePostViewsModal(false);
  });
  
  window.addEventListener('click', (event) => {
    const postViewsModal = document.getElementById('postViewsModal');
    if (event.target === postViewsModal) {
      togglePostViewsModal(false);
    }
  });


window.fetchPostLikes = async (postId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/admin/post/${postId}/like`, { // Ensure endpoint is correct
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && result.likes !== undefined) { // Verify 'likes' exists in response
         //like ko modal may show kryga
            document.getElementById('likeModalMessage').textContent = `Like count: ${result.likes}`;
            toggleLikeModal(true);
        } else {
            console.error('Server response error:', result);
            alert(result.message || 'Failed to fetch like count.');
        }
    } catch (error) {
        console.error('Error fetching like count:', error);
        alert('An error occurred while fetching the like count.');
    }
};


window.fetchPostDislikes = async (postId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/admin/post/${postId}/dislike`, { // Ensure endpoint is correct
            method: 'POST',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log("result=======",result)

        if (response.ok && result.dislikes !== undefined) { // Verify 'dislikes' exists in response
            // current dislike count ko show karayga in the modal
            document.getElementById('likeModalMessage').textContent = `Dislike count: ${result.dislikes}`;
            toggleLikeModal(true);
        } else {
            console.error('Server response error:', result);
            alert(result.message || 'Failed to fetch dislike count.');
        }
    } catch (error) {
        console.error('Error fetching dislike count:', error);
        alert('An error occurred while fetching the dislike count.');
    }
};



// Toggle visibility for Like/Dislike Modal
const toggleLikeModal = (show) => {
    const likeModal = document.getElementById('likeModal');
    likeModal.style.display = show ? 'block' : 'none';
};

// Close modal on click of close button
document.getElementById('closeLikeModal').addEventListener('click', () => {
    toggleLikeModal(false);
});

// Optionally close modal when clicking outside of it
window.addEventListener('click', (event) => {
    const likeModal = document.getElementById('likeModal');
    if (event.target === likeModal) {
        toggleLikeModal(false);
    }
});

  
    
    // Logout user
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    fetchUserPosts(currentPage);
});