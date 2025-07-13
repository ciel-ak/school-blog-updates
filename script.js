document.addEventListener('DOMContentLoaded', () => {
  let allPosts = [];
  let schoolsData = [];
  const postsPerPage = 30; // 1ページあたりの記事数
  let currentPage = 1;
  let currentCategory = 'all';

  // Fetch schools.json first to get school types
  fetch('schools.json')
    .then(response => response.json())
    .then(schools => {
      schoolsData = schools;
      return fetch('posts.json');
    })
    .then(response => response.json())
    .then(posts => {
      // Map school type to each post
      allPosts = posts.map(post => {
        const school = schoolsData.find(s => s.name === post.school_name);
        return { ...post, type: school ? school.type : '不明' };
      });

      allPosts.sort((a, b) => new Date(b.published) - new Date(a.published));

      setupCategoryTabs(allPosts);
      setupSearch(allPosts);
      displayPostsForCategory(allPosts, 'all', currentPage); // Display all posts initially
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const container = document.getElementById('posts-container');
      container.innerHTML = '<p>投稿の読み込み中にエラーが発生しました。</p>';
    });

  function setupSearch(posts) {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filteredBySearch = posts.filter(post => 
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.school_name && post.school_name.toLowerCase().includes(query))
      );
      // Reset category and page when searching
      currentCategory = 'all';
      currentPage = 1;
      document.querySelectorAll('.tab-button').forEach(btn => {
        if (btn.dataset.category === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      displayPostsForCategory(filteredBySearch, currentCategory, currentPage);
    });
  }

  function setupCategoryTabs(posts) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        currentPage = 1; // Reset to first page on category change
        document.getElementById('search-input').value = ''; // Clear search on category change
        displayPostsForCategory(posts, currentCategory, currentPage);
      });
    });
  }

  function displayPostsForCategory(posts, category, page) {
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; // Clear previous posts

    let filteredPosts = posts;
    if (category !== 'all') {
      filteredPosts = posts.filter(post => post.type === category);
    }

    if (filteredPosts.length === 0) {
      container.innerHTML = '<p>現在、このカテゴリの新しい投稿はありません。</p>';
      setupPagination(0, 1); // Hide pagination if no posts
      return;
    }

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToDisplay = filteredPosts.slice(startIndex, endIndex);

    postsToDisplay.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');

      const titleElement = document.createElement('h2');
      const schoolElement = document.createElement('p');
      const dateElement = document.createElement('p');

      const publishedDate = new Date(post.published);
      const formattedDate = `${publishedDate.getFullYear()}/${(publishedDate.getMonth() + 1).toString().padStart(2, '0')}/${publishedDate.getDate().toString().padStart(2, '0')} ${publishedDate.getHours().toString().padStart(2, '0')}:${publishedDate.getMinutes().toString().padStart(2, '0')}`;

      schoolElement.textContent = `学校名: ${post.school_name} (${post.type})`; // Display school type

      if (post.title && post.title.trim() !== '') {
        // Title exists, link on title
        const titleLink = document.createElement('a');
        titleLink.href = post.link;
        titleLink.textContent = post.title;
        titleLink.target = '_blank';
        titleElement.appendChild(titleLink);

        dateElement.textContent = `公開日: ${formattedDate}`;
      } else {
        // Title is empty, link on date
        titleElement.textContent = 'タイトルなし'; // Placeholder for empty title
        const dateLink = document.createElement('a');
        dateLink.href = post.link;
        dateLink.textContent = `公開日: ${formattedDate}`;
        dateLink.target = '_blank';
        dateElement.appendChild(dateLink);
      }

      postElement.appendChild(titleElement);
      postElement.appendChild(schoolElement);
      postElement.appendChild(dateElement);

      container.appendChild(postElement);
    });

    setupPagination(filteredPosts.length, page);
  }

  function setupPagination(totalPosts, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed
    }

    // << (First page) button
    const firstPageButton = document.createElement('button');
    firstPageButton.textContent = '<<';
    firstPageButton.classList.add('pagination-button');
    firstPageButton.disabled = currentPage === 1;
    firstPageButton.addEventListener('click', () => {
      currentPage = 1;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(firstPageButton);

    // < (Previous page) button
    const prevButton = document.createElement('button');
    prevButton.textContent = '< ';
    prevButton.classList.add('pagination-button');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
      currentPage--;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers (max 5 pages visible)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, 5);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('pagination-button');
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        displayPostsForCategory(allPosts, currentCategory, currentPage);
        window.scrollTo(0, 0); // Scroll to top
      });
      paginationContainer.appendChild(pageButton);
    }

    // > (Next page) button
    const nextButton = document.createElement('button');
    nextButton.textContent = ' >';
    nextButton.classList.add('pagination-button');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
      currentPage++;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(nextButton);

    // >> (Last page) button
    const lastPageButton = document.createElement('button');
    lastPageButton.textContent = ' >>';
    lastPageButton.classList.add('pagination-button');
    lastPageButton.disabled = currentPage === totalPages;
    lastPageButton.addEventListener('click', () => {
      currentPage = totalPages;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(lastPageButton);
  }
});
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const container = document.getElementById('posts-container');
      container.innerHTML = '<p>投稿の読み込み中にエラーが発生しました。</p>';
    });

  function setupCategoryTabs(posts) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        currentPage = 1; // Reset to first page on category change
        displayPostsForCategory(posts, currentCategory, currentPage);
      });
    });
  }

  function displayPostsForCategory(posts, category, page) {
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; // Clear previous posts

    let filteredPosts = posts;
    if (category !== 'all') {
      filteredPosts = posts.filter(post => post.type === category);
    }

    if (filteredPosts.length === 0) {
      container.innerHTML = '<p>現在、このカテゴリの新しい投稿はありません。</p>';
      setupPagination(0, 1); // Hide pagination if no posts
      return;
    }

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToDisplay = filteredPosts.slice(startIndex, endIndex);

    postsToDisplay.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');

      const titleElement = document.createElement('h2');
      const schoolElement = document.createElement('p');
      const dateElement = document.createElement('p');

      const publishedDate = new Date(post.published);
      const formattedDate = `${publishedDate.getFullYear()}/${(publishedDate.getMonth() + 1).toString().padStart(2, '0')}/${publishedDate.getDate().toString().padStart(2, '0')} ${publishedDate.getHours().toString().padStart(2, '0')}:${publishedDate.getMinutes().toString().padStart(2, '0')}`;

      schoolElement.textContent = `学校名: ${post.school_name} (${post.type})`; // Display school type

      if (post.title && post.title.trim() !== '') {
        // Title exists, link on title
        const titleLink = document.createElement('a');
        titleLink.href = post.link;
        titleLink.textContent = post.title;
        titleLink.target = '_blank';
        titleElement.appendChild(titleLink);

        dateElement.textContent = `公開日: ${formattedDate}`;
      } else {
        // Title is empty, link on date
        titleElement.textContent = 'タイトルなし'; // Placeholder for empty title
        const dateLink = document.createElement('a');
        dateLink.href = post.link;
        dateLink.textContent = `公開日: ${formattedDate}`;
        dateLink.target = '_blank';
        dateElement.appendChild(dateLink);
      }

      postElement.appendChild(titleElement);
      postElement.appendChild(schoolElement);
      postElement.appendChild(dateElement);

      container.appendChild(postElement);
    });

    setupPagination(filteredPosts.length, page);
  }

  function setupPagination(totalPosts, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed
    }

    // << (First page) button
    const firstPageButton = document.createElement('button');
    firstPageButton.textContent = '<<';
    firstPageButton.classList.add('pagination-button');
    firstPageButton.disabled = currentPage === 1;
    firstPageButton.addEventListener('click', () => {
      currentPage = 1;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(firstPageButton);

    // < (Previous page) button
    const prevButton = document.createElement('button');
    prevButton.textContent = '< ';
    prevButton.classList.add('pagination-button');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
      currentPage--;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers (max 5 pages visible)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, 5);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('pagination-button');
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        displayPostsForCategory(allPosts, currentCategory, currentPage);
        window.scrollTo(0, 0); // Scroll to top
      });
      paginationContainer.appendChild(pageButton);
    }

    // > (Next page) button
    const nextButton = document.createElement('button');
    nextButton.textContent = ' >';
    nextButton.classList.add('pagination-button');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
      currentPage++;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(nextButton);

    // >> (Last page) button
    const lastPageButton = document.createElement('button');
    lastPageButton.textContent = ' >>';
    lastPageButton.classList.add('pagination-button');
    lastPageButton.disabled = currentPage === totalPages;
    lastPageButton.addEventListener('click', () => {
      currentPage = totalPages;
      displayPostsForCategory(allPosts, currentCategory, currentPage);
      window.scrollTo(0, 0); // Scroll to top
    });
    paginationContainer.appendChild(lastPageButton);
  }
});
