document.addEventListener('DOMContentLoaded', () => {
  let allPosts = [];
  let schoolsData = [];

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
      displayPosts(allPosts, 'all'); // Display all posts initially
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
        const category = button.dataset.category;
        displayPosts(posts, category);
      });
    });
  }

  function displayPosts(posts, category) {
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; // Clear previous posts

    let filteredPosts = posts;
    if (category !== 'all') {
      filteredPosts = posts.filter(post => post.type === category);
    }

    if (filteredPosts.length === 0) {
      container.innerHTML = '<p>現在、このカテゴリの新しい投稿はありません。</p>';
      return;
    }

    filteredPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');

      const title = document.createElement('h2');
      const link = document.createElement('a');
      link.href = post.link;
      link.textContent = post.title;
      link.target = '_blank'; // Open in new tab
      title.appendChild(link);

      const school = document.createElement('p');
      school.textContent = `学校名: ${post.school_name} (${post.type})`; // Display school type

      const date = document.createElement('p');
      const publishedDate = new Date(post.published);
      const formattedDate = `${publishedDate.getFullYear()}/${(publishedDate.getMonth() + 1).toString().padStart(2, '0')}/${publishedDate.getDate().toString().padStart(2, '0')} ${publishedDate.getHours().toString().padStart(2, '0')}:${publishedDate.getMinutes().toString().padStart(2, '0')}`;
      date.textContent = `公開日: ${formattedDate}`;

      postElement.appendChild(title);
      postElement.appendChild(school);
      postElement.appendChild(date);

      container.appendChild(postElement);
    });
  }
});