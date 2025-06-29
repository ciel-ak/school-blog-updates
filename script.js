
document.addEventListener('DOMContentLoaded', () => {
  fetch('posts.json')
    .then(response => response.json())
    .then(posts => {
      const container = document.getElementById('posts-container');
      if (posts.length === 0) {
        container.innerHTML = '<p>現在、新しい投稿はありません。</p>';
        return;
      }
      posts.sort((a, b) => new Date(b.published) - new Date(a.published));
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const title = document.createElement('h2');
        const link = document.createElement('a');
        link.href = post.link;
        link.textContent = post.title;
        link.target = '_blank'; // Open in new tab
        title.appendChild(link);

        const school = document.createElement('p');
        school.textContent = `学校名: ${post.school_name}`;

        const date = document.createElement('p');
        date.textContent = `公開日: ${new Date(post.published).toLocaleString('ja-JP')}`;

        postElement.appendChild(title);
        postElement.appendChild(school);
        postElement.appendChild(date);

        container.appendChild(postElement);
      });
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
      const container = document.getElementById('posts-container');
      container.innerHTML = '<p>投稿の読み込み中にエラーが発生しました。</p>';
    });
});
