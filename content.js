/* Dynamic blog & gallery loaded from JSON */

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderBlogImage(post) {
  if (post.imageUrl) {
    return `<img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" loading="lazy">`;
  }
  return `<span class="blog-card-emoji">${post.image || '🏹'}</span>`;
}

function renderGalleryImage(item) {
  if (item.src) {
    return `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || '')}" loading="lazy">`;
  }
  return `<div class="gallery-placeholder">${item.emoji || '🏹'}</div>`;
}

async function loadGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  try {
    const data = await fetchJson('data/gallery.json');
    grid.innerHTML = data.images.map(item => `
      <div class="gallery-item">
        ${renderGalleryImage(item)}
      </div>
    `).join('');
    grid.classList.add('visible');
  } catch (err) {
    grid.innerHTML = '<p class="content-error">Unable to load gallery. Please try again later.</p>';
    console.error(err);
  }
}

async function loadBlogList() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  try {
    const data = await fetchJson('data/blog.json');
    const sorted = [...data.posts].sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

    grid.innerHTML = sorted.map(post => {
      const href = post.slug
        ? `blog-article.html?slug=${encodeURIComponent(post.slug)}`
        : (post.linkUrl || 'registration.html');
      const btnLabel = post.slug ? 'Read More' : (post.linkLabel || 'Learn More');

      return `
        <article class="blog-card">
          <div class="blog-card-image">${renderBlogImage(post)}</div>
          <div class="blog-card-body">
            <p class="blog-date">${escapeHtml(post.date)}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.summary)}</p>
            <a href="${href}" class="btn btn-gradient">${escapeHtml(btnLabel)}</a>
          </div>
        </article>
      `;
    }).join('');
    grid.classList.add('visible');
  } catch (err) {
    grid.innerHTML = '<p class="content-error">Unable to load blog posts. Please try again later.</p>';
    console.error(err);
  }
}

function renderArticleBody(blocks) {
  return blocks.map(block => {
    if (block.type === 'h2') return `<h2>${block.text}</h2>`;
    if (block.type === 'p') return `<p>${block.text}</p>`;
    return '';
  }).join('');
}

async function loadBlogArticle() {
  const container = document.getElementById('article-content');
  if (!container) return;

  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    window.location.href = 'blog.html';
    return;
  }

  try {
    const data = await fetchJson('data/blog.json');
    const post = data.posts.find(p => p.slug === slug);

    if (!post || !post.body) {
      window.location.href = 'blog.html';
      return;
    }

    document.title = `${post.title} | Fit & Fast Archery Club`;

    const heroTitle = document.getElementById('article-hero-title');
    if (heroTitle) heroTitle.textContent = post.title;

    const featured = post.imageUrl
      ? `<img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" class="article-featured-img">`
      : `<div class="article-featured-image">${post.image || '🏹'}</div>`;

    container.innerHTML = `
      <div class="article-meta">
        <span>📅 ${escapeHtml(post.date)}</span>
        <span>✍️ ${escapeHtml(post.author || 'Fit & Fast Archery Club')}</span>
      </div>
      ${featured}
      ${renderArticleBody(post.body)}
      <div class="article-actions">
        <a href="registration.html" class="btn btn-primary">Register for Training</a>
        <a href="blog.html" class="btn btn-gradient">Back to Blog</a>
      </div>
    `;
    container.classList.add('visible');
  } catch (err) {
    container.innerHTML = '<p class="content-error">Unable to load article. <a href="blog.html">Return to blog</a></p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  loadBlogList();
  loadBlogArticle();
});
